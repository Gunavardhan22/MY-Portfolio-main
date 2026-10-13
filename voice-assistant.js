/*
   Floating "Hear About Me" voice assistant.

   Preferred voice: AI audio from this site's server (/api/voice/*). The server holds
   the provider key and only ever synthesises the fixed narration in content/about-me.js.
   Fallback: the browser's built-in speechSynthesis, reading the same text.

   One playback session at a time: every start/stop bumps `session`, and any async
   work from an older session checks it and quietly exits.
*/

(() => {
    'use strict';

    const content = window.ABOUT_ME;
    const rootEl = document.getElementById('voice');
    if (!rootEl || !content || !Array.isArray(content.parts)) return;

    const $ = (id) => document.getElementById(id);
    const els = {
        panel: $('voice-panel'),
        launcher: $('voice-launcher'),
        badge: $('voice-launcher-badge'),
        close: $('voice-close'),
        play: $('voice-play'),
        pause: $('voice-pause'),
        stop: $('voice-stop'),
        replay: $('voice-replay'),
        state: $('voice-state'),
        status: $('voice-status'),
        progress: $('voice-progress'),
        engine: $('voice-engine'),
        transcript: $('voice-transcript'),
        transcriptBody: $('voice-transcript-body'),
        speeds: Array.from(document.querySelectorAll('input[name="voice-speed"]')),
    };

    const apiMeta = document.querySelector('meta[name="voice-api-base"]');
    const API_BASE = ((apiMeta && apiMeta.content) || '').trim().replace(/\/+$/, '');
    const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
    const parts = content.parts;

    const STATE_LABEL = {
        idle: 'Ready',
        loading: 'Loading',
        playing: 'Playing',
        paused: 'Paused',
        stopped: 'Stopped',
        done: 'Finished',
        error: 'Unavailable',
    };

    let state = 'idle';
    let rate = 1;
    let session = 0;
    let engine = null; // 'ai' | 'browser' | null
    let currentPart = -1;
    let abort = null; // AbortController for the active AI session
    let manifestPromise = null;
    let speech = null; // browser-voice queue for the active session

    const audio = new Audio();
    audio.preload = 'auto';
    const segmentUrls = new Map(); // segment index → object URL (kept for replay)
    const pendingSegments = new Map(); // segment index → Promise<object URL>
    let unlockUrl = null;

    // ---------- Transcript ----------
    const partEls = parts.map((part, i) => {
        const article = document.createElement('article');
        article.className = 'voice-part';
        article.dataset.part = String(i);

        const heading = document.createElement('h3');
        heading.textContent = part.heading;
        const text = document.createElement('p');
        text.textContent = part.text.join(' ');

        article.append(heading, text);
        return article;
    });
    els.transcriptBody.replaceChildren(...partEls);

    const nowLabel = document.createElement('span');
    nowLabel.className = 'voice-now';
    nowLabel.textContent = 'Now playing';

    function setCurrentPart(index) {
        if (index === currentPart) return;
        currentPart = index;
        partEls.forEach((el, i) => el.classList.toggle('is-current', i === index));

        if (index < 0) {
            nowLabel.remove();
            els.progress.textContent = '';
            return;
        }
        partEls[index].querySelector('h3').append(nowLabel);
        els.progress.textContent = `Part ${index + 1} of ${parts.length}: ${parts[index].heading}`;

        // Keep the current part in view inside the transcript (never scrolls the page)
        if (els.transcript.open) {
            const body = els.transcriptBody;
            body.scrollTo({
                top: partEls[index].offsetTop - body.offsetTop - 8,
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            });
        }
    }

    // ---------- UI state ----------
    function setState(next, message) {
        state = next;
        rootEl.dataset.state = next;
        els.state.dataset.state = next;
        els.state.textContent = STATE_LABEL[next];
        if (message) els.status.textContent = message;

        const active = next === 'loading' || next === 'playing' || next === 'paused';
        els.play.disabled = active;
        els.pause.disabled = !(next === 'playing' || next === 'paused');
        els.pause.textContent = next === 'paused' ? 'Resume' : 'Pause';
        els.stop.disabled = !active;
        els.replay.disabled = next === 'idle' || next === 'error';
        els.badge.textContent = active ? STATE_LABEL[next] : '';
    }

    const setEngineLabel = (text) => { els.engine.textContent = text || ''; };

    // ---------- Panel ----------
    function openPanel() {
        els.panel.hidden = false;
        els.launcher.setAttribute('aria-expanded', 'true');
        (els.play.disabled ? els.pause : els.play).focus();
    }

    function closePanel({ returnFocus = true } = {}) {
        if (els.panel.hidden) return;
        const hadFocus = els.panel.contains(document.activeElement);
        els.panel.hidden = true;
        els.launcher.setAttribute('aria-expanded', 'false');
        if (returnFocus && hadFocus) els.launcher.focus();
    }

    els.launcher.addEventListener('click', () => (els.panel.hidden ? openPanel() : closePanel()));
    els.close.addEventListener('click', () => closePanel());
    els.panel.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            closePanel();
        }
    });

    // ---------- AI voice (server) ----------
    function getManifest() {
        if (!manifestPromise) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);
            manifestPromise = fetch(`${API_BASE}/api/voice/manifest`, { signal: controller.signal, cache: 'no-store' })
                .then((res) => (res.ok ? res.json() : null))
                .then((m) => (m && m.available && Array.isArray(m.segments) && m.segments.length ? m : null))
                .catch(() => null)
                .finally(() => clearTimeout(timer));
        }
        return manifestPromise;
    }

    function fetchSegment(index, signal) {
        if (segmentUrls.has(index)) return Promise.resolve(segmentUrls.get(index));
        if (pendingSegments.has(index)) return pendingSegments.get(index);

        const job = fetch(`${API_BASE}/api/voice/segment/${index}`, { signal })
            .then(async (res) => {
                const type = res.headers.get('content-type') || '';
                if (!res.ok || !type.startsWith('audio/')) throw new Error(`segment ${index}: HTTP ${res.status}`);
                const url = URL.createObjectURL(await res.blob());
                segmentUrls.set(index, url);
                return url;
            })
            .finally(() => {
                if (pendingSegments.get(index) === job) pendingSegments.delete(index);
            });

        pendingSegments.set(index, job);
        return job;
    }

    function waitForEnd(signal) {
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                audio.removeEventListener('ended', onEnded);
                audio.removeEventListener('error', onError);
                signal.removeEventListener('abort', onAbort);
            };
            const onEnded = () => { cleanup(); resolve(true); };
            const onError = () => { cleanup(); reject(new Error('media error')); };
            const onAbort = () => { cleanup(); resolve(false); };
            audio.addEventListener('ended', onEnded);
            audio.addEventListener('error', onError);
            signal.addEventListener('abort', onAbort);
        });
    }

    async function playAI(manifest, mySession, signal) {
        engine = 'ai';
        setEngineLabel(`Voice: AI voice (${manifest.provider || 'server'})`);
        const segments = manifest.segments;

        for (let i = 0; i < segments.length; i++) {
            if (mySession !== session) return;
            if (!segmentUrls.has(i)) {
                setState('loading', i === 0 ? 'Generating audio…' : 'Generating the next part…');
            }

            const url = await fetchSegment(i, signal);
            if (mySession !== session) return;

            setCurrentPart(Number(segments[i].part) || 0);
            audio.src = url;
            audio.defaultPlaybackRate = rate;
            audio.playbackRate = rate;
            await audio.play();
            if (mySession !== session) return;
            if (state !== 'playing') setState('playing', 'Playing introduction');

            // Prefetch the next segment while this one plays
            if (i + 1 < segments.length) fetchSegment(i + 1, signal).catch(() => {});

            const ended = await waitForEnd(signal);
            if (!ended) return;
        }
        if (mySession === session) finish();
    }

    // Keep the UI honest when the OS or media keys pause/resume the audio element.
    audio.addEventListener('pause', () => {
        if (engine === 'ai' && state === 'playing' && !audio.ended) setState('paused', 'Playback paused');
    });
    audio.addEventListener('play', () => {
        if (engine === 'ai' && state === 'paused') setState('playing', 'Playing introduction');
    });

    // A tiny silent WAV played inside the click handler unlocks audio on iOS/Safari,
    // so the real audio can start after the network request finishes.
    function unlockAudio() {
        if (!unlockUrl) {
            const samples = 800; // 0.1 s at 8 kHz
            const buffer = new ArrayBuffer(44 + samples * 2);
            const view = new DataView(buffer);
            const writeStr = (offset, str) => [...str].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
            writeStr(0, 'RIFF');
            view.setUint32(4, 36 + samples * 2, true);
            writeStr(8, 'WAVEfmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, 1, true);
            view.setUint32(24, 8000, true);
            view.setUint32(28, 16000, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            writeStr(36, 'data');
            view.setUint32(40, samples * 2, true);
            unlockUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
        }
        audio.src = unlockUrl;
        audio.play().catch(() => {});
    }

    // ---------- Browser voice (fallback) ----------
    function pickVoice() {
        const voices = synth.getVoices();
        return (
            voices.find((v) => /^en(-|_)(US|GB|IN)/i.test(v.lang) && v.localService) ||
            voices.find((v) => /^en/i.test(v.lang)) ||
            null
        );
    }

    function playBrowser(fromPart, mySession, message) {
        if (!synth) {
            engine = null;
            setEngineLabel('');
            setState('error', 'Audio isn’t available in this browser, but the full transcript is below.');
            els.transcript.open = true;
            return;
        }

        engine = 'browser';
        setEngineLabel('Voice: your browser’s built-in voice');
        const queue = [];
        for (let p = Math.max(0, fromPart); p < parts.length; p++) {
            parts[p].text.forEach((text) => queue.push({ part: p, text }));
        }
        speech = { session: mySession, queue, index: 0, utterance: null, restartOnResume: false };
        synth.cancel();
        setState('playing', message || 'Playing introduction');
        speakNext();
    }

    function speakNext() {
        const s = speech;
        if (!s || s.session !== session) return;
        if (s.index >= s.queue.length) {
            finish();
            return;
        }

        const item = s.queue[s.index];
        setCurrentPart(item.part);

        // One sentence per utterance: avoids Chrome cutting off long utterances,
        // and lets speed changes take effect from the current sentence.
        const utterance = new SpeechSynthesisUtterance(item.text);
        const voice = pickVoice();
        if (voice) utterance.voice = voice;
        utterance.lang = voice ? voice.lang : 'en-US';
        utterance.rate = rate;
        utterance.onend = () => {
            if (s.utterance !== utterance) return;
            s.index += 1;
            speakNext();
        };
        utterance.onerror = (e) => {
            if (s.utterance !== utterance || e.error === 'interrupted' || e.error === 'canceled') return;
            s.index += 1;
            speakNext();
        };
        s.utterance = utterance;
        synth.speak(utterance);
    }

    function restartCurrentSentence() {
        if (!speech) return;
        speech.utterance = null; // ignore the cancelled utterance's end event
        synth.cancel();
        speakNext();
    }

    // ---------- Controls ----------
    function stopAll() {
        session += 1;
        if (abort) abort.abort();
        abort = null;
        pendingSegments.clear(); // aborted downloads must not be reused by the next session
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        if (synth) synth.cancel();
        speech = null;
        engine = null;
    }

    function finish() {
        engine = null;
        speech = null;
        setCurrentPart(-1);
        setState('done', 'Introduction finished. Thanks for listening!');
    }

    async function start() {
        stopAll();
        const mySession = session;
        abort = new AbortController();
        const { signal } = abort;

        unlockAudio();
        setCurrentPart(-1);
        setEngineLabel('');
        setState('loading', 'Generating audio…');

        const manifest = await getManifest();
        if (mySession !== session) return;

        if (!manifest) {
            playBrowser(0, mySession, 'The AI voice isn’t available here, so your browser’s voice is reading the introduction.');
            return;
        }

        try {
            await playAI(manifest, mySession, signal);
        } catch (err) {
            if (mySession !== session) return;
            audio.pause();
            const resumeAt = currentPart >= 0 ? currentPart : 0;
            playBrowser(resumeAt, mySession, 'The AI voice is unavailable right now, so your browser’s voice is continuing.');
        }
    }

    function togglePause() {
        if (state === 'playing') {
            if (engine === 'ai') audio.pause();
            else if (engine === 'browser') synth.pause();
            setState('paused', 'Playback paused');
        } else if (state === 'paused') {
            setState('playing', 'Playing introduction');
            if (engine === 'ai') {
                audio.play().catch(() => setState('paused', 'Playback paused. Press Resume to continue.'));
            } else if (engine === 'browser') {
                if (speech && speech.restartOnResume) {
                    speech.restartOnResume = false;
                    restartCurrentSentence();
                } else {
                    synth.resume();
                }
            }
        }
    }

    function stop() {
        stopAll();
        setCurrentPart(-1);
        setEngineLabel('');
        setState('stopped', 'Playback stopped');
    }

    function setRate(next) {
        rate = next;
        audio.defaultPlaybackRate = next;
        audio.playbackRate = next;
        if (engine === 'browser' && speech) {
            if (state === 'playing') restartCurrentSentence();
            else if (state === 'paused') speech.restartOnResume = true;
        }
    }

    els.play.addEventListener('click', start);
    els.replay.addEventListener('click', start);
    els.pause.addEventListener('click', togglePause);
    els.stop.addEventListener('click', stop);
    els.speeds.forEach((input) => {
        input.addEventListener('change', () => {
            if (input.checked) setRate(Number(input.value) || 1);
        });
    });

    // Clean up audio, speech and object URLs when leaving the page.
    window.addEventListener('pagehide', () => {
        stopAll();
        segmentUrls.forEach((url) => URL.revokeObjectURL(url));
        segmentUrls.clear();
        if (unlockUrl) URL.revokeObjectURL(unlockUrl);
        unlockUrl = null;
    });

    // Coming back via the back/forward cache: playback was stopped on pagehide.
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            setCurrentPart(-1);
            setState('idle', 'Ready to speak');
        }
    });

    // Some browsers load voices asynchronously; touching the list warms it up.
    if (synth) {
        synth.getVoices();
        if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', () => synth.getVoices());
    }

    setState('idle', 'Ready to speak');
})();
