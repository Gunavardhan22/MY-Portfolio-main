# Testing checklist

Run `npm start`, open <http://localhost:3000>, and run `npm run check` (syntax-checks every JavaScript file).

Verified on 2026-10-13 in headless Chromium at 1920×1080, 1440×900, 1280×800, 768×1024, 390×844, and 360×740. The speech checks used a recording stand-in for `speechSynthesis`, because headless browsers have no voices; listen once in a real browser before launch.

## Background and scrolling

- [x] The background image is fixed and covers the viewport in every section (About, Skills, Projects, Workflow, Education, Contact).
- [x] The veil deepens after the hero; the image stays visible.
- [x] WebGL particles and glass panels render; with WebGL blocked, `html.no-webgl` shows the CSS dust.
- [x] The hero recedes on scroll and returns fully (opacity 1) when scrolling back to the top.
- [x] Project cards hide again when scrolling back above them (animations reverse).
- [x] No horizontal overflow at any tested width. The hero name fits at every width.
- [x] Reduced motion: all 33 animated elements are visible with no transforms, and the background doesn't move.

## Spoken introduction

- [x] Nothing plays on load.
- [x] The first click speaks the first paragraph of `content/intro.js`, with the Indian English natural voice picked when present.
- [x] While speaking: `aria-pressed="true"`, wave animation, label and tooltip read "Stop Introduction".
- [x] A second click stops immediately (`speechSynthesis.cancel()`). The state becomes "stopped" and the label reads "Play again".
- [x] Starting again (from either button) restarts from the first paragraph.
- [x] Rapid double-clicks never produce overlapping speech (at most one utterance active).
- [x] A full run speaks all 7 chunks in order and returns to idle on its own.
- [x] Esc stops speech. `pagehide` cancels speech.
- [x] Without speech synthesis, the button reads "Read introduction" and opens the transcript (5 paragraphs), with a notice.

## Ask About Me

- [x] Hidden when the page is served without this server (static host); the introduction still works.
- [x] `GET /api/ask/status` → `{"available":true}` with a key.
- [x] Real answers are grounded in `content/profile.md`; "experience at Google?" → "not aware… email him"; a prompt-injection attempt is refused.
- [x] Answers are read aloud, the dock shows "Stop speaking", and the Stop button and Esc stop them.
- [x] Validation: a 2-character question → 400, a non-JSON body → 415, GET → 405, a 3 KB body → 413.

## Security

- [x] `.env`, `content/profile.md`, `server/`, `package.json`, `../` and `%2e%2e` traversal → 404.
- [x] The API key appears in no served file.
- [x] CSP `script-src 'self'`: all scripts load (three.js and GSAP are vendored), with no CSP violations in the console.

## Still to check by hand

- [ ] Listen to the introduction in Chrome, Edge, Safari, and Firefox (voices differ per OS).
- [ ] Ask About Me on a deployed host with `TRUST_PROXY=1`.
- [ ] Screen reader pass (NVDA or VoiceOver): the voice dock announcements and the Ask panel.
