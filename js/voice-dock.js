/*
   Voice dock (bottom-right): the spoken "About Me" introduction and the optional
   "Ask About Me" assistant.

   Introduction: the browser's built-in speech synthesis reads content/intro.js.
   It needs no server and no API key. Every [data-intro-toggle] button (the floating
   button and the hero's "About Me — Listen") starts it, or stops it while it plays.
   Starting again always restarts from the beginning.

   Ask About Me: shown only when this site's server reports /api/ask/status as
   available. Answers come from the server (key stays there) and are read aloud
   with the same speech engine.

   One utterance at a time: every start or stop bumps `session`, and callbacks from
   an older session do nothing, so speech can never overlap.
*/
(() => {
    'use strict';

    const root = document.documentElement;
    const $ = (id) => document.getElementById(id);
    const intro = window.PORTFOLIO_INTRO;
    const dock = $('voice-dock');
    if (!dock || !intro || !Array.isArray(intro.paragraphs)) return;

    const els = {
        fab: $('voice-fab'),
        tip: $('voice-tip'),
        live: $('voice-live'),
        panel: $('ask-panel'),
        askToggle: $('ask-toggle'),
        close: $('ask-close'),
        notice: $('ask-notice'),
        chat: $('ask-chat'),
        log: $('ask-log'),
        form: $('ask-form'),
        input: $('ask-input'),
        submit: $('ask-submit'),
        status: $('ask-status'),
        stop: $('ask-stop'),
        transcript: $('intro-transcript'),
        transcriptBody: $('intro-transcript-body'),
    };
    const toggles = Array.from(document.querySelectorAll('[data-intro-toggle]'));
    const labels = Array.from(document.querySelectorAll('[data-intro-label]'));

    const apiMeta = document.querySelector('meta[name="api-base"]');
    const API_BASE = ((apiMeta && apiMeta.content) || '').trim().replace(/\/+$/, '');

    const announce = (message) => { if (els.live) els.live.textContent = message; };

    // ======================================================================
    // Speech engine
    // ======================================================================
    const synth = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;
    let voice = null;
    let session = 0;
    let activeUtterance = null; // a live reference stops some browsers from dropping `onend`

    // Prefer a natural Indian English voice, then any natural English voice, then any English voice.
    function pickVoice() {
        if (!synth) return null;
        const voices = synth.getVoices();
        if (!voices.length) return null;
        const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
        const natural = (v) => /natural|neural|online|premium|enhanced/i.test(v.name);
        const indian = (v) => /^en[-_]IN$/i.test(v.lang) || /india/i.test(v.name);
        const ukUs = (v) => /^en[-_](GB|US)$/i.test(v.lang);
        return english.find((v) => indian(v) && natural(v))
            || english.find(indian)
            || english.find((v) => natural(v) && ukUs(v))
            || english.find((v) => /google (uk|us) english/i.test(v.name))
            || english.find((v) => v.default)
            || english[0]
            || null;
    }
    if (synth) {
        voice = pickVoice();
        synth.addEventListener('voiceschanged', () => { voice = pickVoice(); });
    }

    // Short sentence-sized chunks: some browsers cut off a single long utterance.
    function chunk(text, max = 220) {
        const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [text];
        const out = [];
        let current = '';
        sentences.forEach((raw) => {
            const sentence = raw.trim();
            if (!sentence) return;
            if (current && (current.length + sentence.length + 1) > max) {
                out.push(current);
                current = sentence;
            } else {
                current = current ? `${current} ${sentence}` : sentence;
            }
        });
        if (current) out.push(current);
        return out;
    }

    /**
     * Speak a queue of { text, part } items. Resolves through onDone('done' | 'error')
     * unless a newer session (another start, or a stop) takes over first.
     */
    function speak(items, { onPart, onDone } = {}) {
        stopSpeech();
        const id = ++session;
        let index = 0;

        const finish = (reason) => {
            if (id !== session) return;
            activeUtterance = null;
            if (onDone) onDone(reason);
        };

        const next = () => {
            if (id !== session) return;
            if (index >= items.length) return finish('done');
            const item = items[index++];
            const utterance = new SpeechSynthesisUtterance(item.text);
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang;
            } else {
                utterance.lang = 'en-IN';
            }
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.onstart = () => { if (id === session && onPart) onPart(item.part); };
            utterance.onend = next;
            utterance.onerror = (e) => {
                if (id !== session || e.error === 'interrupted' || e.error === 'canceled') return;
                finish(e.error === 'not-allowed' ? 'blocked' : 'error');
            };
            activeUtterance = utterance;
            synth.speak(utterance);
        };

        if (synth.paused) synth.resume();
        next();
    }

    function stopSpeech() {
        session += 1;
        activeUtterance = null;
        if (synth && (synth.speaking || synth.pending)) synth.cancel();
    }

    // ======================================================================
    // Introduction
    // ======================================================================
    const introItems = intro.paragraphs.flatMap((paragraph, part) => chunk(paragraph).map((text) => ({ text, part })));
    let voiceState = 'idle'; // idle | speaking | stopped | unsupported
    let speakingKind = null; // 'intro' | 'answer' while speaking

    if (els.transcriptBody) {
        els.transcriptBody.replaceChildren(...intro.paragraphs.map((text) => {
            const p = document.createElement('p');
            p.textContent = text;
            return p;
        }));
    }
    const highlight = (part) => {
        if (!els.transcriptBody) return;
        Array.from(els.transcriptBody.children).forEach((p, i) => p.classList.toggle('is-current', i === part));
    };

    function setVoiceState(state, kind = null) {
        voiceState = state;
        speakingKind = state === 'speaking' ? kind : null;
        root.dataset.voice = state;

        const playing = state === 'speaking';
        toggles.forEach((button) => button.setAttribute('aria-pressed', String(playing)));
        labels.forEach((label) => {
            let text = label.dataset.idle;
            if (playing) text = kind === 'answer' ? 'Stop speaking' : label.dataset.active;
            else if (state === 'stopped' && label.dataset.stopped) text = label.dataset.stopped;
            else if (state === 'unsupported') text = label.dataset.unsupported || 'Read introduction';
            if (text) label.textContent = text;
        });

        if (els.tip) {
            els.tip.textContent = {
                speaking: kind === 'answer' ? 'Stop speaking' : 'Stop Introduction',
                stopped: 'Play my introduction again',
                unsupported: 'Voice isn’t available in this browser: read the introduction',
            }[state] || 'Listen to my introduction';
        }
        if (els.stop) {
            const hide = !(playing && kind === 'answer');
            // Don't strand keyboard focus on a button that is about to disappear.
            if (hide && document.activeElement === els.stop) els.input.focus();
            els.stop.hidden = hide;
        }
    }

    function startIntro() {
        if (!synth) {
            openPanel({ transcript: true });
            announce('Voice isn’t available in this browser, so the introduction is shown as text.');
            return;
        }
        speak(introItems, {
            onPart: highlight,
            onDone: (reason) => {
                highlight(-1);
                setVoiceState('idle');
                if (reason === 'done') announce('Introduction finished.');
                else announce('The introduction couldn’t be played in this browser. You can read it in the Ask About Me panel.');
            },
        });
        setVoiceState('speaking', 'intro');
        announce('Playing my introduction. Press the button again to stop.');
    }

    function stopIntro() {
        stopSpeech();
        highlight(-1);
        setVoiceState('stopped');
        announce('Introduction stopped.');
    }

    toggles.forEach((button) => {
        button.addEventListener('click', () => {
            if (voiceState === 'speaking') stopIntro();
            else startIntro();
        });
    });

    // Never keep talking after the visitor leaves the page.
    window.addEventListener('pagehide', stopSpeech);

    setVoiceState(synth ? 'idle' : 'unsupported');

    // ======================================================================
    // Ask About Me
    // ======================================================================
    let askAvailable = false;

    function openPanel({ transcript = false } = {}) {
        els.panel.hidden = false;
        dock.classList.add('is-open');
        els.askToggle.setAttribute('aria-expanded', 'true');
        if (transcript && els.transcript) els.transcript.open = true;
        if (!synth) {
            els.notice.hidden = false;
            els.notice.textContent = 'Voice isn’t available in this browser, so answers and the introduction are shown as text.';
        }
        if (askAvailable && !transcript) els.input.focus();
        else els.close.focus();
    }

    function closePanel() {
        els.panel.hidden = true;
        dock.classList.remove('is-open');
        els.askToggle.setAttribute('aria-expanded', 'false');
        (askAvailable ? els.askToggle : els.fab).focus();
    }

    els.askToggle.addEventListener('click', () => (els.panel.hidden ? openPanel() : closePanel()));
    els.close.addEventListener('click', closePanel);

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!els.panel.hidden) {
            if (speakingKind === 'answer') stopAnswer();
            closePanel();
        } else if (voiceState === 'speaking') {
            if (speakingKind === 'answer') stopAnswer();
            else stopIntro();
        }
    });

    function addMessage(kind, text) {
        const msg = document.createElement('div');
        msg.className = `ask-msg ask-msg--${kind}`;
        const p = document.createElement('p');
        p.textContent = text;
        msg.append(p);
        els.log.append(msg);
        // Keep the conversation short.
        while (els.log.children.length > 10) els.log.firstElementChild.remove();
        msg.scrollIntoView({ block: 'nearest' });
        return msg;
    }

    function speakAnswer(text) {
        if (!synth) return;
        highlight(-1);
        speak(chunk(text).map((t) => ({ text: t, part: -1 })), {
            onDone: (reason) => {
                setVoiceState('idle');
                if (reason === 'blocked') els.status.textContent = 'Press “Listen” on the answer to hear it.';
            },
        });
        setVoiceState('speaking', 'answer');
    }

    function stopAnswer() {
        stopSpeech();
        setVoiceState('idle');
        els.status.textContent = 'Stopped.';
    }
    els.stop.addEventListener('click', stopAnswer);

    async function ask(question) {
        addMessage('q', question);
        const pending = addMessage('a', 'Thinking');
        pending.classList.add('ask-msg--pending');
        els.submit.disabled = true;
        els.status.textContent = 'Thinking…';

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 25000);
        try {
            const res = await fetch(`${API_BASE}/api/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
                signal: controller.signal,
            });
            const data = await res.json().catch(() => ({}));
            pending.remove();
            if (!res.ok || !data.answer) {
                addMessage('a', data.message || 'The assistant is unavailable right now.').classList.add('ask-msg--error');
                els.status.textContent = '';
                return;
            }

            const answer = addMessage('a', data.answer);
            if (synth) {
                const replay = document.createElement('button');
                replay.type = 'button';
                replay.className = 'text-btn';
                replay.textContent = 'Listen';
                replay.setAttribute('aria-label', 'Listen to this answer');
                replay.addEventListener('click', () => speakAnswer(data.answer));
                answer.append(replay);
                speakAnswer(data.answer);
                els.status.textContent = 'Reading the answer aloud.';
            } else {
                els.status.textContent = '';
            }
        } catch (err) {
            pending.remove();
            addMessage('a', err.name === 'AbortError'
                ? 'That took too long. Please try again.'
                : 'Couldn’t reach the assistant. Check your connection and try again.').classList.add('ask-msg--error');
            els.status.textContent = '';
        } finally {
            clearTimeout(timer);
            els.submit.disabled = false;
        }
    }

    els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const question = els.input.value.replace(/\s+/g, ' ').trim();
        if (question.length < 3) {
            els.status.textContent = 'Type a slightly longer question.';
            return;
        }
        els.input.value = '';
        ask(question);
    });

    els.chat.querySelectorAll('[data-question]').forEach((chip) => {
        chip.addEventListener('click', () => {
            if (els.submit.disabled) return;
            ask(chip.dataset.question);
        });
    });

    // Show "Ask About Me" only when this site's server has the assistant configured.
    fetch(`${API_BASE}/api/ask/status`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            if (!data || !data.available) return;
            askAvailable = true;
            els.askToggle.hidden = false;
            els.chat.hidden = false;
        })
        .catch(() => { /* static hosting or offline: the introduction still works */ });
})();
