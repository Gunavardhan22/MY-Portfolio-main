'use strict';

/*
   Portfolio server: serves the static site and the voice endpoint.
   No dependencies; needs Node.js 18+ (built-in fetch).

   Only the files in PUBLIC_FILES and the assets/ folder are served, so .env,
   server code, the audio cache, docs and legacy files are never reachable.
*/
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { loadEnv } = require('./lib/env');

const ROOT = path.resolve(__dirname, '..');
loadEnv(path.join(ROOT, '.env'));

const { createVoiceService } = require('./services/voiceService');
const { createVoiceRoute } = require('./routes/voice');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || '').trim();
const TRUST_PROXY = process.env.TRUST_PROXY === '1';

const PUBLIC_FILES = new Set([
    '/index.html',
    '/styles.css',
    '/script.js',
    '/voice-assistant.js',
    '/content/about-me.js',
]);
const ASSETS_DIR = path.join(ROOT, 'assets');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8',
};

const CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data:",
    "media-src 'self' blob:",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join('; ');

const voiceService = createVoiceService({ env: process.env, rootDir: ROOT });
const handleVoice = createVoiceRoute(voiceService, { trustProxy: TRUST_PROXY });

function setSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function sendText(res, status, text) {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(text);
}

function resolvePublicFile(pathname) {
    if (pathname === '/') pathname = '/index.html';
    if (PUBLIC_FILES.has(pathname)) return path.join(ROOT, pathname);

    if (pathname.startsWith('/assets/')) {
        const file = path.resolve(ROOT, `.${pathname}`);
        if (file.startsWith(ASSETS_DIR + path.sep)) return file;
    }
    return null;
}

function serveStatic(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        return sendText(res, 405, 'Method not allowed');
    }

    const file = resolvePublicFile(pathname);
    if (!file) return sendText(res, 404, 'Not found');

    fs.stat(file, (err, stat) => {
        if (err || !stat.isFile()) return sendText(res, 404, 'Not found');

        const ext = path.extname(file).toLowerCase();
        const headers = {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Content-Length': stat.size,
            // HTML/CSS/JS revalidate so edits show up; assets can be cached for a day.
            'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache',
        };
        if (ext === '.html') headers['Content-Security-Policy'] = CSP;

        res.writeHead(200, headers);
        if (req.method === 'HEAD') return res.end();
        fs.createReadStream(file).pipe(res);
    });
}

const server = http.createServer(async (req, res) => {
    setSecurityHeaders(res);

    let pathname;
    try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
        return sendText(res, 400, 'Bad request');
    }
    if (pathname.includes('\0')) return sendText(res, 400, 'Bad request');

    if (pathname.startsWith('/api/')) {
        // Cross-origin access only when the frontend is hosted elsewhere (see README).
        if (ALLOWED_ORIGIN && req.headers.origin === ALLOWED_ORIGIN) {
            res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
            res.setHeader('Vary', 'Origin');
        }
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
            res.writeHead(204);
            return res.end();
        }
        if (pathname.startsWith('/api/voice/')) {
            try {
                return await handleVoice(req, res, pathname);
            } catch (err) {
                console.error('[voice] unexpected error:', err.name);
                if (!res.headersSent) return sendText(res, 500, 'Internal error');
                return res.end();
            }
        }
        return sendText(res, 404, 'Not found');
    }

    return serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
    const { provider, segments } = voiceService;
    const cached = `${voiceService.cachedCount()}/${segments.length} segments cached`;
    let voiceState;
    if (provider.configured) voiceState = `AI voice on (${provider.label}), ${cached}`;
    else if (voiceService.available()) voiceState = `AI voice from cache only (no VOICE_API_KEY), ${cached}`;
    else voiceState = `AI voice off: VOICE_API_KEY not set, ${cached}; visitors get the browser voice`;
    console.log(`Portfolio running at http://localhost:${PORT}`);
    console.log(voiceState);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
