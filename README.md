# Gunavardhan Tigulla — Portfolio

A responsive GenAI developer portfolio with a floating **Hear About Me** voice assistant. The site is plain HTML, CSS, and JavaScript. A small dependency-free Node.js server hosts it and keeps the AI voice API key on the server.

```text
Browser ── GET /api/voice/segment/:n ──▶ Node server ── POST (key from .env) ──▶ Groq TTS (Orpheus)
   ▲                                        │
   └──────────── WAV audio ◀── disk cache ◀─┘      (each segment is generated once, then reused)
```

If the AI voice is unavailable (no key, provider error, rate limit, or static hosting without the server), the assistant falls back to the browser's built-in `speechSynthesis` voice and the transcript stays readable.

## Quick start

Requires **Node.js 18.17+**. There are no npm dependencies to install.

```bash
cp .env.example .env        # then put your Groq key in VOICE_API_KEY
npm start                   # http://localhost:3000
```

Without a key the site works fully and the assistant uses the browser voice.

`npm run dev` restarts the server when files change.

## Configure the AI voice (Groq)

1. **Create a key** at <https://console.groq.com/keys> and set `VOICE_API_KEY` in `.env`. Never paste it into HTML or JS, or commit it.
2. **Accept the model terms.** Groq requires an org admin to accept the Orpheus terms once at <https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english>. Until then every request fails with `model_terms_required`. The server log and `npm run voice:build` both print this link.
3. **Pre-generate the narration** so visitors never wait on the provider:

   ```bash
   npm run voice:check   # show the 26 segments, no API calls
   npm run voice:build   # generate and cache them in .cache/voice/
   ```

   Groq's published limits for Orpheus are tight: 10 requests/min, 1.2K tokens/min, 100 requests/day, and 3.6K tokens/day. The narration is about 3.4K characters, so the build paces itself and takes roughly 3–4 minutes. If it hits a daily limit it stops, keeps its progress, and you can re-run it later. After you edit the narration, only the changed segments are regenerated.

4. **Choose a voice** with `VOICE_NAME`. The English voices are autumn, diana, hannah, austin, daniel, and troy (the default). Changing the voice or model invalidates the cache automatically.

### Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VOICE_API_KEY` | (none) | Groq API key. Server-side only. |
| `VOICE_PROVIDER` | `groq` | Adapter in `server/services/voiceProvider.js`. |
| `VOICE_MODEL` | `canopylabs/orpheus-v1-english` | Groq TTS model. |
| `VOICE_NAME` | `troy` | Voice persona. |
| `VOICE_CACHE_DIR` | `.cache/voice` | Generated audio. Not publicly served. |
| `PORT` | `3000` | Server port. |
| `ALLOWED_ORIGIN` | (empty) | Set only when the page is hosted on a different origin than the API. |
| `TRUST_PROXY` | `0` | Set `1` behind Render/Railway/Nginx so rate limits see real client IPs. |

## Security

- **The key stays on the server.** It's read from the environment in `server/services/voiceProvider.js` and never logged or sent to the browser. The tests confirmed no served file contains it.
- **The endpoint can't be used as a general TTS service.** The browser only asks for a segment *index* (`/api/voice/segment/3`). Text comes from `content/about-me.js` on the server, so nobody can spend your key on their own text.
- **Only an allowlist of files is served:** `index.html`, `styles.css`, `script.js`, `voice-assistant.js`, `content/about-me.js`, and `assets/`. `.env`, `server/`, `.cache/`, `docs/`, and `legacy/` all return 404, including `../` and encoded-traversal attempts.
- **Limits:** provider calls are paced under Groq's per-minute limits. Each client gets 60 uncached segment requests per 10 minutes, and identical concurrent requests share one provider call.
- **Errors:** visitors get generic messages (`voice_busy`, `voice_unavailable`). Server logs show only an error category and HTTP status, never the key or the provider's response body.
- **Headers:** CSP, `nosniff`, `X-Frame-Options: DENY`, and a strict referrer policy.
- `.env` and `.cache/` are git-ignored. `.env.example` holds placeholders only.

## Editing the narration

All spoken text lives in **`content/about-me.js`**. The transcript, the AI voice, and the browser fallback all read from it. Keep sentences short and true. Then run `npm run voice:build`.

## Project structure

```text
.
├── index.html              # page: header, hero, skills, projects, workflow, journey, contact, voice panel
├── styles.css              # design tokens, components, responsive + reduced-motion rules
├── script.js               # menu, smooth scroll, progress bar, active nav, reveal, back-to-top, copy email
├── voice-assistant.js      # voice panel: AI audio playback, browser-voice fallback, controls, transcript
├── content/about-me.js     # the narration (single source of truth)
├── server/
│   ├── server.js           # static allowlist + /api/voice routing + security headers
│   ├── routes/voice.js     # GET /api/voice/manifest, GET /api/voice/segment/:n
│   ├── services/
│   │   ├── voiceProvider.js  # Groq adapter (the only provider-specific code)
│   │   ├── voiceService.js   # segments + cache + pacing + in-flight de-duplication
│   │   ├── audioCache.js     # memory + disk cache keyed by provider/model/voice/text
│   │   └── pacer.js          # per-minute request/character budget
│   └── lib/                  # .env loader, narration segmenter
├── scripts/build-voice.js  # pre-generates the audio (npm run voice:build)
├── assets/                 # favicon, résumé (add resume.pdf), diagrams
├── docs/                   # content inventory + testing checklist
├── .env.example
└── package.json
```

## Deploy

### Option A: one Node service (recommended)

Use Render, Railway, Fly.io, or any VPS.

- Start command: `npm start`. There's no build step.
- Environment: `VOICE_API_KEY`, plus `TRUST_PROXY=1` on Render and Railway.
- After the first deploy, open the site once and play the introduction, or run `npm run voice:build` in the service shell, to fill the cache.
- **Ephemeral disks** (Render's free tier, for example) lose `.cache/` on every deploy, and regenerating costs most of a day's free TTS quota. Either attach a persistent disk and point `VOICE_CACHE_DIR` at it, or intentionally commit the generated audio: set `VOICE_CACHE_DIR=voice-cache`, run `npm run voice:build`, and commit `voice-cache/`. The audio is still served only through `/api/voice/*`, and with a complete cache the server doesn't even need the key.

### Option B: static host + separate API

You can put the page on GitHub Pages, Netlify, or similar, and deploy the server (Option A) separately for the voice:

1. In `index.html`, set `<meta name="voice-api-base" content="https://your-api.example.com">`.
2. On the server, set `ALLOWED_ORIGIN=https://your-static-site.example.com`.

If you skip the server entirely, the site still works and the assistant uses the browser voice.

After deploying, add a canonical URL, `og:url`, and `og:image` to `index.html`.

## Before launch

See [`docs/content-inventory.md`](docs/content-inventory.md). In short:

1. Accept the Orpheus terms in the Groq console, then run `npm run voice:build`.
2. Rotate the Groq key, since it was shared in a chat, and update `.env`. Also rotate the Gemini keys that are hardcoded in two project repos.
3. Add `assets/resume.pdf`.
4. Add the LinkedIn URL and the AI Resume Analyzer repository URL.
5. Confirm degree status.

## Testing

Run `npm start` and open <http://localhost:3000>. [`docs/testing-checklist.md`](docs/testing-checklist.md) lists what was verified and how.
