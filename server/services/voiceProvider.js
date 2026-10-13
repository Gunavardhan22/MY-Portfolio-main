'use strict';

/*
   Voice provider adapter. Everything provider-specific lives in this file.

   Supported today:
     groq  →  POST https://api.groq.com/openai/v1/audio/speech
              model canopylabs/orpheus-v1-english, WAV output, max 200 characters per request.
              Docs: https://console.groq.com/docs/text-to-speech

   Adding another provider: write a factory that returns the same shape as
   createGroqProvider() below and register it in PROVIDERS. Use only endpoints and
   parameters from that provider's official documentation.
*/

class ProviderError extends Error {
    /**
     * @param {'not_configured'|'auth'|'terms_required'|'rate_limited'|'bad_request'|'unavailable'|'timeout'} code
     * @param {{ status?: number|null, retryAfter?: number|null, hint?: string|null }} [details]
     *   hint: an operator-facing fix (server logs only, never sent to visitors)
     */
    constructor(code, { status = null, retryAfter = null, hint = null } = {}) {
        super(`voice provider error: ${code}`);
        this.name = 'ProviderError';
        this.code = code;
        this.status = status;
        this.retryAfter = retryAfter;
        this.hint = hint;
    }
}

function codeForStatus(status) {
    if (status === 401 || status === 403) return 'auth';
    if (status === 429) return 'rate_limited';
    if (status === 400 || status === 404 || status === 413 || status === 422) return 'bad_request';
    return 'unavailable';
}

function createGroqProvider(env) {
    const apiKey = env.VOICE_API_KEY || '';
    const model = env.VOICE_MODEL || 'canopylabs/orpheus-v1-english';
    const voice = env.VOICE_NAME || 'troy';
    const timeoutMs = Number(env.VOICE_TIMEOUT_MS) || 30000;

    return {
        name: 'groq',
        label: 'Groq · Orpheus',
        configured: Boolean(apiKey),
        maxChars: 200,
        contentType: 'audio/wav',
        extension: 'wav',
        // Changes whenever the model or voice changes, so cached audio is regenerated.
        cacheId: `groq|${model}|${voice}`,
        // Free-tier pacing (10 requests and 1.2K tokens per minute); stays slightly under.
        limits: { requestsPerMinute: 9, charsPerMinute: 1100 },

        async synthesize(text) {
            if (!apiKey) throw new ProviderError('not_configured');
            if (typeof text !== 'string' || !text.trim() || text.length > this.maxChars) {
                throw new ProviderError('bad_request');
            }

            let res;
            try {
                res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ model, voice, input: text, response_format: 'wav' }),
                    signal: AbortSignal.timeout(timeoutMs),
                });
            } catch (err) {
                throw new ProviderError(err && err.name === 'TimeoutError' ? 'timeout' : 'unavailable');
            }

            if (!res.ok) {
                const retryAfter = Number(res.headers.get('retry-after')) || null;
                // Read only the machine-readable error code; the message is never echoed.
                const body = await res.json().catch(() => null);
                const providerCode = body && body.error && typeof body.error.code === 'string' ? body.error.code : '';
                if (providerCode === 'model_terms_required') {
                    throw new ProviderError('terms_required', {
                        status: res.status,
                        hint: `Accept the ${model} terms (org admin): https://console.groq.com/playground?model=${encodeURIComponent(model)}`,
                    });
                }
                throw new ProviderError(codeForStatus(res.status), { status: res.status, retryAfter });
            }

            const audio = Buffer.from(await res.arrayBuffer());
            if (!audio.length) throw new ProviderError('unavailable', { status: res.status });
            return audio;
        },
    };
}

const PROVIDERS = {
    groq: createGroqProvider,
};

function createVoiceProvider(env = process.env) {
    const name = (env.VOICE_PROVIDER || 'groq').trim().toLowerCase();
    const factory = PROVIDERS[name];
    if (!factory) {
        throw new Error(`Unknown VOICE_PROVIDER "${name}". Supported: ${Object.keys(PROVIDERS).join(', ')}`);
    }
    return factory(env);
}

module.exports = { createVoiceProvider, ProviderError };
