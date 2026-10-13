'use strict';

// Ties the narration, provider, cache and pacer together.
// Only the fixed narration can be synthesised: callers ask for a segment index,
// never for arbitrary text, so the API key cannot be used as a general TTS service.
const path = require('node:path');
const { createVoiceProvider } = require('./voiceProvider');
const { createAudioCache } = require('./audioCache');
const { createPacer } = require('./pacer');
const { buildSegments } = require('../lib/segments');

function createVoiceService({ env = process.env, rootDir }) {
    const content = require(path.join(rootDir, 'content', 'about-me.js'));
    const provider = createVoiceProvider(env);
    const cache = createAudioCache({
        dir: path.resolve(rootDir, env.VOICE_CACHE_DIR || '.cache/voice'),
        extension: provider.extension,
    });
    const pacer = createPacer(provider.limits);
    const inflight = new Map();

    const segments = buildSegments(content, provider.maxChars).map((segment, index) => ({
        ...segment,
        index,
        key: cache.keyFor(provider.cacheId, segment.text),
    }));

    const cachedCount = () => segments.filter((s) => cache.has(s.key)).length;

    return {
        provider,
        segments,
        cachedCount,

        /** True when every segment can be served: either a key is set or all audio is cached. */
        available() {
            return provider.configured || cachedCount() === segments.length;
        },

        getCached(index) {
            const segment = segments[index];
            return segment ? cache.get(segment.key) : null;
        },

        /** Returns cached audio, or generates it (shared between concurrent callers). */
        async getSegment(index, { maxWaitMs = Infinity } = {}) {
            const segment = segments[index];
            if (!segment) throw new RangeError('segment out of range');

            const hit = cache.get(segment.key);
            if (hit) return { audio: hit, cached: true };
            if (inflight.has(segment.key)) return inflight.get(segment.key);

            const job = (async () => {
                await pacer.reserve(segment.text.length, { maxWaitMs });
                try {
                    const audio = await provider.synthesize(segment.text);
                    cache.set(segment.key, audio);
                    return { audio, cached: false };
                } catch (err) {
                    if (err.code === 'rate_limited') pacer.penalise(err.retryAfter || 30);
                    throw err;
                }
            })().finally(() => inflight.delete(segment.key));

            inflight.set(segment.key, job);
            return job;
        },
    };
}

module.exports = { createVoiceService };
