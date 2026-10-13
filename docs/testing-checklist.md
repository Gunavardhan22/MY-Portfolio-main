# Testing checklist

Results from local testing on 2026-10-10. Tests ran in headless Chromium against `node server/server.js` with three configurations: no key, a real key (provider failing on terms), and a pre-filled test audio cache.

Legend: ✅ verified · ⏳ owner action needed · ☐ needs a human or a deployment

## Layout and scrolling

- ✅ No horizontal overflow at 320, 375, 768, 1024, 1440px. The header never overflows
- ✅ Hamburger menu below 900px (six links). It toggles `aria-expanded` and closes on link click, Escape, outside click, and resize
- ✅ Nav links scroll smoothly and land below the sticky header (Skills top at 84px with a 68px header). The URL hash updates
- ✅ Progress bar: `scaleX(0)` at the top, about 0.22 at Skills, `scaleX(1)` at the bottom. One passive scroll listener, batched with rAF, and offsets measured only on resize or layout change
- ✅ Active nav follows scrolling (Skills → … → Contact at the bottom) with `aria-current="location"`. It's a pure function of scroll position, so it can't flicker
- ✅ Back-to-top is hidden near the top, shows after 600px, and returns to 0. It sits bottom-right and never overlaps the bottom-left launcher (checked at all widths)
- ✅ Reveal animations: all `.reveal` elements are visible after scrolling, content is visible without JS (`html.js-reveal` gate), and reduced motion shows everything with no animation
- ✅ No console errors or failed requests on load

## Voice assistant

- ✅ Launcher bottom-left. The panel opens and closes, `aria-expanded` syncs, focus moves to the play button, and Escape closes the panel and returns focus to the launcher
- ✅ Transcript renders all 7 parts from `content/about-me.js`, scrolls independently, and highlights the current part with a "Now playing" text label
- ✅ Nothing plays on page load
- ✅ **AI path** (test audio cache): play → *Playing introduction*, pause → *Playback paused* (position holds), resume, speed 1.15×, runs through all 26 segments to *Finished*, replay restarts, stop stays stopped
- ✅ **Provider failing** (real key, terms not accepted): the server returns 502 `voice_unavailable`, and the panel switches to the browser voice with "The AI voice is unavailable right now, so your browser's voice is continuing."
- ✅ **No server / no key**: the manifest reports unavailable and the browser voice reads the same text
- ✅ Pause, resume, stop, and speed work on the browser voice too
- ✅ Only one session at a time: start, stop, and replay cancel earlier audio, speech, and in-flight downloads
- ✅ Status uses text plus icon (`aria-live="polite"`), not colour alone
- ✅ Mobile (320×640): the panel stays within the viewport (12px gutters), and the transcript has its own scroll area
- ☐ Listen to the real Orpheus audio once the terms are accepted (blocker #1)
- ☐ Test on a real iPhone (Safari audio unlock) and Android

## Server security

- ✅ Allowlist: `/.env`, `/.env.example`, `/package.json`, `/server/*`, `/legacy/*`, `/docs/*`, `/.cache/*`, `/assets/../.env`, `/assets/%2e%2e/.env`, and `/assets/..%5c.env` all return 404
- ✅ The key prefix appears in 0 served responses. Only `.env` (git-ignored) contains it
- ✅ `/api/voice/segment/999` and `/abc` return 404. POST returns 405. Without a key: 503 `voice_not_configured`
- ✅ CSP, nosniff, X-Frame-Options, and Referrer-Policy headers are present. No CSP violations in the console
- ✅ Provider errors are logged as category and status only, plus an operator hint for `model_terms_required`

## Content

- ⏳ Résumé PDF, LinkedIn URL, Resume Analyzer repo, and degree status (see `content-inventory.md`)
- ✅ No fabricated metrics. Prototypes and academic work are labelled as such

## Launch

- ☐ Deploy (README → Deploy), fill the voice cache, and test the public URL
- ☐ Add canonical, `og:url`, and `og:image`. Run Lighthouse
