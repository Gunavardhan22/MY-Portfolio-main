# Tigulla Gunavardhan — Portfolio

A dark, moonlit portfolio with a cinematic 3D scroll experience, a spoken **About Me** introduction, and an optional **Ask About Me** assistant that answers questions from the portfolio's own content.

It's plain HTML, CSS, and JavaScript with no build step. A small dependency-free Node.js server hosts the site and keeps the AI key private.

```text
Fixed background image → navy veil + moonlight + clouds → WebGL particles & glass panels → content → voice dock

Browser ── POST /api/ask {question} ──▶ Node server ── (key from .env) ──▶ Groq chat model
   ▲                                     │   answers only from content/profile.md
   └──────── { answer } ◀────────────────┘   then the browser reads it aloud
```

## Quick start

Requires **Node.js 18.17+**. There are no npm packages to install.

```bash
cp .env.example .env   # optional: add AI_API_KEY to enable "Ask About Me"
npm start              # http://localhost:3000
npm run check          # syntax-check every JavaScript file
```

Without a key, everything works except the **Ask About Me** button, which stays hidden. The spoken introduction never needs a server or a key.

## Features

| Feature | Where | Notes |
| --- | --- | --- |
| Persistent anime background | `index.html` `.backdrop`, `styles.css` §3, `js/ambient.js` | Fixed layer behind every section. Pointer and scroll parallax, and a veil that deepens over the content for readability. |
| Ambient effects | `styles.css` §3 | Moon glow, drifting clouds, and CSS dust when WebGL isn't available. All CSS. |
| 3D depth layer | `js/scene.js` | three.js particles and glass panels. The camera travels forward as you scroll. Loaded after the page is interactive. Pauses in background tabs. |
| Scroll animations | `js/motion.js` | GSAP ScrollTrigger. The hero recedes into depth, and sections, skills, projects, and contact animate in. All reversible when scrolling up. No scroll hijacking. |
| Spoken introduction | `js/voice-dock.js`, `content/intro.js` | Browser speech synthesis. The floating button and the hero's "About Me — Listen" button start it, stop it, and restart it from the beginning. |
| Ask About Me | `js/voice-dock.js`, `server/routes/ask.js`, `server/services/askService.js` | Grounded answers from `content/profile.md`, read aloud. Shown only when the server reports it's configured. |

### Voice button behaviour

- First click starts the introduction. While it plays, the button shows an audio wave and reads **Stop Introduction**.
- Clicking again stops it immediately (so does **Esc**). Starting again restarts from the beginning.
- One utterance at a time: overlapping speech is impossible.
- Voice choice: a natural Indian English voice if installed, then any natural English voice, then the browser default.
- Speech stops when the visitor leaves the page. Nothing plays automatically.
- Without speech support, the button reads **Read introduction** and opens the transcript.

## Editing content

| What | File |
| --- | --- |
| Spoken introduction | `content/intro.js` (one string per paragraph) |
| Knowledge the assistant answers from | `content/profile.md`. It's read on every question, so no restart is needed. |
| Page text, projects, skills | `index.html` |
| Background image | `assets/images/moonlit-bg.webp` and `.jpg`; the supplied original is `moonlit-original.png` |

Keep `content/profile.md` and `index.html` consistent: the assistant only knows what the profile says.

### Replacing the background image

The supplied image is 500×353 pixels. It was upscaled 3× to `moonlit-bg.*` so it looks smoother full-screen, but a higher-resolution original (at least 1920px wide) will look much sharper. Save it as `assets/images/moonlit-bg.webp` and `.jpg`. On phones, the framing that keeps the face above the text is set in `styles.css` (`@media (max-width: 899px) .bg-image`).

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `AI_API_KEY` | (none) | Groq API key for "Ask About Me". Server-side only. `VOICE_API_KEY` from older `.env` files is also accepted. |
| `AI_PROVIDER` | `groq` | Only `groq` is supported. |
| `AI_MODEL` | `openai/gpt-oss-20b` | Any Groq chat model. List yours with `GET https://api.groq.com/openai/v1/models`. |
| `PORT` | `3000` | Server port. |
| `ALLOWED_ORIGIN` | (empty) | Set only when the page is hosted on a different origin than the API. |
| `TRUST_PROXY` | `0` | Set `1` behind Render, Railway, or Nginx so rate limits see real client IPs. |

## Security

- **The key stays on the server.** It's read in `server/services/askService.js` and never logged or sent to the browser. No served file contains it.
- **Grounded and bounded.** The model sees only `content/profile.md` and the question. It's told to refuse anything off-topic and never to invent experience, metrics, or links. Questions are limited to 3–300 characters and bodies to 2 KB. Answers are capped and stripped of markdown and URLs.
- **Limits:** 15 questions per visitor per 10 minutes, and provider calls paced under 25 per minute.
- **Allowlisted files only:** `index.html`, `styles.css`, `script.js`, `content/intro.js`, `js/`, and `assets/`. `.env`, `server/`, `content/profile.md`, `docs/`, and `legacy/` all return 404, including `../` and encoded-traversal attempts.
- **Headers:** a strict CSP (`script-src 'self'`; three.js and GSAP are vendored in `assets/vendor/`), `nosniff`, `X-Frame-Options: DENY`.

## Project structure

```text
.
├── index.html               # hero, about, skills, projects, workflow, education, contact, voice dock
├── styles.css               # tokens, backdrop layers, glass UI, responsive + reduced-motion rules
├── script.js                # menu, smooth anchors, progress bar, active nav, back-to-top, copy email
├── js/
│   ├── ambient.js           # background parallax + veil depth
│   ├── scene.js             # WebGL particles and glass panels (lazy-loads three.js)
│   ├── motion.js            # GSAP ScrollTrigger animations, with a fallback
│   └── voice-dock.js        # spoken introduction + Ask About Me
├── content/
│   ├── intro.js             # the spoken introduction (edit this)
│   └── profile.md           # the assistant's only knowledge source (edit this; not served)
├── assets/
│   ├── images/              # background image (original + upscaled)
│   ├── vendor/              # three.js r128, GSAP 3.12.5 + ScrollTrigger
│   ├── resume.pdf
│   └── favicon.svg, diagrams/
├── server/
│   ├── server.js            # static allowlist, /api/ask routing, security headers
│   ├── routes/ask.js        # GET /api/ask/status, POST /api/ask
│   ├── services/askService.js, pacer.js
│   └── lib/env.js, rateLimit.js
├── scripts/check.js         # npm run check
├── docs/                    # content inventory + testing checklist
└── 3d-portfolio/            # separate 3D-artist template site
```

## Deploy

**One Node service (recommended):** Render, Railway, Fly.io, or a VPS. Start command `npm start`, with no build step. Set `AI_API_KEY` (and `TRUST_PROXY=1` on Render or Railway).

**Static host only (GitHub Pages, Netlify):** everything works, including the spoken introduction, except Ask About Me, which hides itself. To add it, deploy the server separately, set `<meta name="api-base" content="https://your-api.example.com">` in `index.html`, and set `ALLOWED_ORIGIN` on the server.

After deploying, add a canonical URL, `og:url`, and `og:image` to `index.html`.

## Before launch

See [`docs/content-inventory.md`](docs/content-inventory.md). The main items:

1. **Background image rights.** The character artwork is likely copyrighted fan art. Check that you're allowed to use it on a public site, or credit the artist.
2. **Rotate the Groq key**, which was shared in a chat earlier, and update `.env`.
3. Add the LinkedIn URL, and the AI Resume Analyzer and Seat Seeker repository URLs when they're public.
4. Resolve the résumé/site differences listed in the inventory (SHAP vs LIME).
