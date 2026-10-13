'use strict';

// GET /api/voice/manifest      → which segments exist and whether the AI voice is available
// GET /api/voice/segment/:n    → WAV audio for segment n (cached after the first request)
const { PacerBusyError } = require('../services/pacer');

const SEGMENT_PATH = /^\/api\/voice\/segment\/(\d{1,4})$/;

function sendJson(res, status, body, headers = {}) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Cache-Control': 'no-store',
        ...headers,
    });
    res.end(payload);
}

// Simple fixed-window limit per client for requests that reach the provider.
function createClientLimiter({ max, windowMs }) {
    const hits = new Map();
    return {
        take(id) {
            const now = Date.now();
            if (hits.size > 5000) {
                for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
            }
            const entry = hits.get(id);
            if (!entry || entry.resetAt <= now) {
                hits.set(id, { count: 1, resetAt: now + windowMs });
                return { ok: true };
            }
            entry.count += 1;
            return entry.count <= max
                ? { ok: true }
                : { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
        },
    };
}

function clientId(req, trustProxy) {
    if (trustProxy) {
        const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
        if (forwarded) return forwarded;
    }
    return req.socket.remoteAddress || 'unknown';
}

function createVoiceRoute(service, { trustProxy = false } = {}) {
    const limiter = createClientLimiter({ max: 60, windowMs: 10 * 60_000 });

    const sendAudio = (req, res, audio) => {
        res.writeHead(200, {
            'Content-Type': service.provider.contentType,
            'Content-Length': audio.length,
            'Cache-Control': 'private, max-age=86400',
        });
        res.end(req.method === 'HEAD' ? undefined : audio);
    };

    const unavailable = (res, status, error, message, retryAfter) =>
        sendJson(res, status, { error, message }, retryAfter ? { 'Retry-After': String(retryAfter) } : {});

    return async function handleVoice(req, res, pathname) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return sendJson(res, 405, { error: 'method_not_allowed' }, { Allow: 'GET, HEAD' });
        }

        if (pathname === '/api/voice/manifest') {
            return sendJson(res, 200, {
                available: service.available(),
                provider: service.provider.label,
                segments: service.segments.map((s) => ({ part: s.part })),
            });
        }

        const match = pathname.match(SEGMENT_PATH);
        const index = match ? Number(match[1]) : -1;
        if (index < 0 || index >= service.segments.length) {
            return sendJson(res, 404, { error: 'not_found' });
        }

        const cached = service.getCached(index);
        if (cached) return sendAudio(req, res, cached);

        if (!service.provider.configured) {
            return unavailable(res, 503, 'voice_not_configured', 'The AI voice is not configured on this server.');
        }

        const allowed = limiter.take(clientId(req, trustProxy));
        if (!allowed.ok) {
            return unavailable(res, 429, 'too_many_requests', 'Too many voice requests. Please try again later.', allowed.retryAfter);
        }

        try {
            const { audio } = await service.getSegment(index, { maxWaitMs: 15_000 });
            return sendAudio(req, res, audio);
        } catch (err) {
            if (err instanceof PacerBusyError || err.code === 'rate_limited') {
                return unavailable(res, 503, 'voice_busy', 'The AI voice is busy right now.', err.retryAfter || 30);
            }
            // Log the category and status only. Never the key, headers, or provider body.
            console.warn(`[voice] segment ${index} failed: ${err.code || err.name}${err.status ? ` (HTTP ${err.status})` : ''}${err.hint ? `. ${err.hint}` : ''}`);
            return unavailable(res, 502, 'voice_unavailable', 'The AI voice is unavailable right now.');
        }
    };
}

module.exports = { createVoiceRoute };
