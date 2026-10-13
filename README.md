# Tigulla Gunavardhan — Portfolio

A dark, cinematic portfolio with a living 2.5D anime portrait, a 3D scroll experience, a spoken **About Me** introduction, and an optional **Ask About Me** assistant that answers questions from the portfolio's own content.

It's plain HTML, CSS, and JavaScript with no build step. A small dependency-free Node.js server hosts the site and keeps the AI key private.

```text
Still image → living portrait (WebGL) → navy veil → WebGL particles & glass panels → content → controls + voice dock

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
| Living portrait (2.5D) | `js/portrait.js`, `assets/portrait/` | A WebGL shader composites prepared layers (sky, clouds, body, head and hair, eye glow) with depth parallax, a hair breeze, breathing, rim light, and pulsing eyes on a seamless 10-second loop. The scroll pushes the camera in (GSAP scrub, reversible). Falls back to the still image. |
| Background controls | `js/backdrop-controls.js` | Bottom-left glass panel: play/pause the animation, show/hide particles. 44×44 targets, remembered per device. |
| Readability veil | `styles.css` §3, `js/ambient.js` | Gradient scrims behind the hero copy, and a navy veil that deepens over the content sections. |
| Particles | `js/scene.js` | three.js dust and glass panels (panels are hidden on portrait screens so nothing crosses the face). The camera travels forward as you scroll. Loaded after the page is interactive. Pauses with the controls, in background tabs, and with reduced motion. |
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
| Background portrait | `assets/portrait/` (generated; see below) |

Keep `content/profile.md` and `index.html` consistent: the assistant only knows what the profile says.

### The living portrait

`assets/portrait/` holds layers generated from the source image by two scripts in `tools/`:

| File | Contents |
| --- | --- |
| `poster.webp` / `.jpg` | The original image: the loading placeholder and the no-WebGL fallback |
| `sky.webp` | The background with the character removed and the hole filled, revealed by parallax |
| `character.webp` | The character cut out with the `isnet-anime` model, with the hair fringe colour cleaned up |
| `maps.png` | R = depth (a smooth gradient, so nothing shears), G = hair sway (tips only, never over the face), B = eye glow |

To use a different image (Python 3 with `numpy`, `pillow`, `onnxruntime`):

```bash
curl -L -o isnet-anime.onnx https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-anime.onnx
python tools/run_seg.py new-image.png isnet-anime.onnx mask.png
python tools/build_layers.py new-image.png mask.png assets/portrait
```

Then update `IMAGE` (pixel size) and `FACE` (the face centre, as fractions of width and height) at the top of `js/portrait.js`. The eye detection region in `build_layers.py` assumes the eyes sit around 38–58% across and 40–47% down; adjust it for a different pose.

Loop timing (10 s): 0–25% clouds drift and a cool rim light rises on the hair; 25–55% the eyes brighten and ease back; 45–85% a stronger breeze and gentle breathing; then idle. Every effect is periodic in the loop phase, so there's no visible reset.

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

## Performance and accessibility

- The portrait is one full-screen quad and one shader (no three.js). Its pixel count is capped, and phones and tablets get a lighter shader, 1× resolution, and about 30 fps.
- It only animates while visible and playing. When paused, it redraws only while the pointer or scroll easing settles.
- Reduced motion: starts paused on a well-lit still frame, with no pointer or scroll parallax. Play remains available.
- The backdrop has `pointer-events: none` and sits behind the content (`z-index: -1`). The hero copy has its own scrims for contrast.
- On a real unload, the GPU context, textures and listeners are released; pages in the back/forward cache keep theirs.

## Project structure

```text
.
├── index.html               # hero, about, skills, projects, workflow, education, contact, voice dock
├── styles.css               # tokens, backdrop layers, glass UI, responsive + reduced-motion rules
├── script.js                # menu, smooth anchors, progress bar, active nav, back-to-top, copy email
├── js/
│   ├── portrait.js          # living 2.5D portrait (raw WebGL, no three.js)
│   ├── backdrop-controls.js # play/pause + particles toggles
│   ├── ambient.js           # veil depth + still-image parallax
│   ├── scene.js             # WebGL particles and glass panels (lazy-loads three.js)
│   ├── motion.js            # GSAP ScrollTrigger animations, with a fallback
│   └── voice-dock.js        # spoken introduction + Ask About Me
├── content/
│   ├── intro.js             # the spoken introduction (edit this)
│   └── profile.md           # the assistant's only knowledge source (edit this; not served)
├── assets/
│   ├── portrait/            # portrait layers (poster, sky, character, maps)
│   ├── vendor/              # three.js r128, GSAP 3.12.5 + ScrollTrigger
│   ├── resume.pdf
│   └── favicon.svg, diagrams/
├── server/
│   ├── server.js            # static allowlist, /api/ask routing, security headers
│   ├── routes/ask.js        # GET /api/ask/status, POST /api/ask
│   ├── services/askService.js, pacer.js
│   └── lib/env.js, rateLimit.js
├── scripts/check.js         # npm run check
├── tools/                   # run_seg.py, build_layers.py: regenerate the portrait layers
├── docs/                    # content inventory + testing checklist
└── 3d-portfolio/            # separate 3D-artist template site
```

## Deploy

**One Node service (recommended):** Render, Railway, Fly.io, or a VPS. Start command `npm start`, with no build step. Set `AI_API_KEY` (and `TRUST_PROXY=1` on Render or Railway).

**Static host only (GitHub Pages, Netlify):** everything works, including the spoken introduction, except Ask About Me, which hides itself. To add it, deploy the server separately, set `<meta name="api-base" content="https://your-api.example.com">` in `index.html`, and set `ALLOWED_ORIGIN` on the server.

After deploying, add a canonical URL, `og:url`, and `og:image` to `index.html`.

## Before launch

See [`docs/content-inventory.md`](docs/content-inventory.md). The main items:

1. **Background image rights.** The portrait is fan art of a copyrighted anime character. Check that you're allowed to use it on a public site, or credit the artist.
2. **Rotate the Groq key**, which was shared in a chat earlier, and update `.env`.
3. Add the LinkedIn URL, and the AI Resume Analyzer and Seat Seeker repository URLs when they're public.
4. Resolve the résumé/site differences listed in the inventory (SHAP vs LIME).
