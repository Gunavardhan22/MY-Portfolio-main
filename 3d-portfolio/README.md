# 3D Artist Portfolio

A dark, fast, static portfolio for a 3D artist or animator. It has no build step and no framework: plain HTML, CSS and JavaScript, with three.js loaded from a CDN for the WebGL hero and project turntables.

Every page reads its content from one file, [`js/data.js`](js/data.js). Until you add real images, the site draws placeholder renders, so it always looks complete.

## Pages

| Page | What's on it |
| --- | --- |
| `index.html` | WebGL hero (Render / Clay / Wire shading), showreel modal, category filters, project grid with hover previews, contact call-to-action |
| `project.html?id=…` | One template for every project: hero, client, software, roles, overview, mood board, wireframe/clay/lighting work in progress with a compare slider, final renders gallery with a full-screen viewer, turntable, breakdown video |
| `about.html` | Photo, bio, background, availability, software skills, workstation specs, process, what you're exploring |
| `resources.html` | Free models, tutorials and articles |
| `contact.html` | Commission status, email with a copy button, project brief form, social links, Discord, rate sheet with "Save as PDF" |
| `404.html` | Not-found page |

## Run it locally

Any static file server works. From this folder:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000. Opening `index.html` straight from disk mostly works, but use a server so video embeds and fonts behave as they will online.

## Make it yours

Everything below is in [`js/data.js`](js/data.js).

### 1. You

`artist`: name, title, tagline, location, email and social links. `about`: photo, bio, experience, skills, hardware, process, what you're learning and availability.

### 2. Your showreel

```js
showreel: { title: 'Showreel 2026', provider: 'vimeo', id: '123456789', chapters: [...] }
```

`provider` is `'youtube'` or `'vimeo'`; `id` is the video id from the share link. `chapters` lists the projects featured in the reel with their timecodes.

### 3. Your projects

Each project needs `id`, `title`, `category`, `year`, `software`, `roles` and `summary`. Everything else is optional; leave a field out and that section shows placeholders (or is hidden, for the breakdown video).

```js
{
  id: 'ember-warden',                 // used in the URL: project.html?id=ember-warden
  title: 'Ember Warden',
  category: 'character',              // character | environment | product | motion | personal
  year: 2026,
  client: null,                       // a name for commercial work
  software: ['zbrush', 'maya'],       // keys from the `software` list
  roles: ['Modeling', 'Texturing'],
  summary: 'One sentence for the grid and page header.',

  thumb: 'assets/projects/ember/thumb.webp',      // grid image, ~1600×1200
  preview: 'assets/projects/ember/preview.mp4',   // optional hover loop (MP4, WebM or GIF)
  hero: { image: 'assets/projects/ember/hero.webp' },
  overview: ['Paragraph one.', 'Paragraph two.'],
  concept: 'Ideas and reference.',
  moodboard: [{ src: '…', caption: 'Volcanic rock' }],
  wip: [
    { src: '…/wire.webp', stage: 'wireframe', caption: 'Topology' },
    { src: '…/clay.webp', stage: 'clay' },
    { src: '…/light-warm.webp', stage: 'lighting', caption: 'Warm key' },
  ],
  gallery: [{ src: '…/final-1.webp', full: '…/final-1@4k.webp', caption: 'Hero angle' }],
  turntable: { provider: 'vimeo', id: '…' },      // or { src: '…/turntable.mp4', poster: '…' }
  breakdown: { provider: 'youtube', id: '…', title: 'Breakdown' },
  art: { shape: 'pillar', colors: ['#ff7a45', '#5c160a'] }, // placeholder colours; keep as a fallback
}
```

Character and product projects without a `turntable` video get an interactive 3D stand-in that visitors can rotate.

### 4. Software badges

The `software` list draws a coloured monogram badge for each tool. To use a real logo instead, add `icon: 'assets/icons/blender.svg'`. Check each brand's usage guidelines first.

### 5. Contact, rates and resources

- `contact.commission.status`: `'open'`, `'limited'` or `'closed'`. This also updates the homepage call-to-action.
- `contact.rates.file`: set to a PDF path to offer a download. Otherwise the "Save rate sheet as PDF" button prints only the rate table.
- `resources`: any item with `url: null` shows as "Coming soon".

### 6. Hero loop

To replace the WebGL sculpture with your own render loop, set `hero: { video: 'assets/hero.mp4', poster: 'assets/hero.jpg' }`. Keep it short, muted and under ~8 MB.

## Image tips

- Export grid thumbnails at about **1600×1200** and gallery images at **2400px** wide as WebP (quality 80–85). Put the 4K version in `full`; it only loads when someone opens the viewer.
- Hover previews: 3–5 second MP4 loops, 720p, no audio. They only load on hover.
- Replace `assets/og-image.png` (1200×630) with your best render. It's the image shown when the site is shared on social media.

## Before you publish

- Make the `og:image` URLs in each page's `<head>` absolute (e.g. `https://yourdomain.com/assets/og-image.png`), since social networks don't resolve relative paths.
- Update the `<title>` and `description` tags in each HTML file with your name.
- Delete the placeholder reel note in `showreel.note`.

## Deploy

It's a static folder, so any static host works: GitHub Pages, Netlify, Vercel or Cloudflare Pages. On GitHub Pages, publish this folder as the site root so `404.html` is picked up.

## Accessibility and performance

- Keyboard friendly: skip link, visible focus, Esc closes modals, arrow keys work in the image viewer and turntable.
- Respects "reduced motion": the hero and turntable stop auto-rotating.
- The WebGL scenes pause when off-screen or when the tab is hidden.
- Video embeds load only when played, and grid images lazy-load.
