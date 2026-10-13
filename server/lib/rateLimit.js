'use strict';

// Simple fixed-window limit per client for requests that reach a paid provider.
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

module.exports = { createClientLimiter, clientId };
