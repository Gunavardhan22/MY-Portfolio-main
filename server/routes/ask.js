'use strict';

// GET  /api/ask/status  → { available } so the page only shows "Ask About Me" when it works
// POST /api/ask         → { question } in, { answer } out
const { PacerBusyError } = require('../services/pacer');
const { createClientLimiter, clientId } = require('../lib/rateLimit');

const MAX_BODY_BYTES = 2048;
const MIN_QUESTION = 3;
const MAX_QUESTION = 300;

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

function readJson(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        let tooLarge = false;
        const chunks = [];
        req.on('data', (chunk) => {
            if (tooLarge) return; // keep draining so the 413 response can still be sent
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                tooLarge = true;
                reject(Object.assign(new Error('too large'), { status: 413 }));
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            if (tooLarge) return;
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
            } catch {
                reject(Object.assign(new Error('bad json'), { status: 400 }));
            }
        });
        req.on('error', reject);
    });
}

function createAskRoute(service, { trustProxy = false } = {}) {
    const limiter = createClientLimiter({ max: 15, windowMs: 10 * 60_000 });
    const fail = (res, status, error, message, retryAfter) =>
        sendJson(res, status, { error, message }, retryAfter ? { 'Retry-After': String(retryAfter) } : {});

    return async function handleAsk(req, res, pathname) {
        if (pathname === '/api/ask/status') {
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                return sendJson(res, 405, { error: 'method_not_allowed' }, { Allow: 'GET, HEAD' });
            }
            return sendJson(res, 200, { available: service.configured });
        }

        if (pathname !== '/api/ask') return sendJson(res, 404, { error: 'not_found' });
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' }, { Allow: 'POST' });
        if (!String(req.headers['content-type'] || '').includes('application/json')) {
            return fail(res, 415, 'unsupported_media_type', 'Send JSON.');
        }
        if (!service.configured) {
            return fail(res, 503, 'ask_not_configured', 'Questions are not available on this server.');
        }

        let body;
        try {
            body = await readJson(req);
        } catch (err) {
            return fail(res, err.status || 400, 'bad_request', 'The question could not be read.');
        }

        const question = typeof body.question === 'string' ? body.question.replace(/\s+/g, ' ').trim() : '';
        if (question.length < MIN_QUESTION || question.length > MAX_QUESTION) {
            return fail(res, 400, 'bad_question', `Ask a question between ${MIN_QUESTION} and ${MAX_QUESTION} characters.`);
        }

        const allowed = limiter.take(clientId(req, trustProxy));
        if (!allowed.ok) {
            return fail(res, 429, 'too_many_requests', 'That’s a lot of questions. Please try again in a few minutes.', allowed.retryAfter);
        }

        try {
            const answer = await service.answer(question);
            return sendJson(res, 200, { answer });
        } catch (err) {
            if (err instanceof PacerBusyError || err.code === 'rate_limited') {
                return fail(res, 503, 'ask_busy', 'The assistant is busy right now. Please try again shortly.', err.retryAfter || 20);
            }
            // Log the category and status only. Never the key, the question, or the provider body.
            console.warn(`[ask] failed: ${err.code || err.name}${err.status ? ` (HTTP ${err.status})` : ''}`);
            return fail(res, 502, 'ask_unavailable', 'The assistant is unavailable right now.');
        }
    };
}

module.exports = { createAskRoute };
