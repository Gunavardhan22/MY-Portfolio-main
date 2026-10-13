/* Shared site behaviour: header, mobile nav, showreel modal, video embeds and
   the work grid. Each part checks for its markup, so this file is safe to load
   on every page. Page scripts (project.js, about.js) use the helpers on window.Site. */
(function () {
  'use strict';

  const data = window.PORTFOLIO;
  if (!data) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const categoryLabel = (id) => (data.categories.find((c) => c.id === id) || {}).label || id;
  const findProject = (id) => data.projects.find((p) => p.id === id);
  const projectUrl = (p) => `project.html?id=${encodeURIComponent(p.id)}`;

  function embedUrl(video) {
    return video.provider === 'vimeo'
      ? `https://player.vimeo.com/video/${encodeURIComponent(video.id)}?autoplay=1&title=0&byline=0&portrait=0`
      : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }

  function iframeHTML(video, title) {
    return `<iframe src="${embedUrl(video)}" title="${esc(title)}"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"></iframe>`;
  }

  /* A video from data: { src, poster } for a self-hosted file, or { provider, id }
     for YouTube/Vimeo. Embeds load only when played, keeping the page light. */
  function videoHTML(video, title) {
    if (video.src) {
      return `<div class="embed"><video controls playsinline preload="none"
        ${video.poster ? `poster="${esc(video.poster)}"` : ''} src="${esc(video.src)}"></video></div>`;
    }
    const thumb = video.poster
      || (video.provider !== 'vimeo' ? `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg` : '');
    return `<div class="embed" data-embed='${esc(JSON.stringify({ provider: video.provider, id: video.id }))}' data-embed-title="${esc(title)}">
      ${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy" decoding="async">` : ''}
      <button type="button" class="embed-play">
        <span class="play-icon" aria-hidden="true"></span><span>Play ${esc(title)}</span>
      </button>
    </div>`;
  }

  function softwareBadge(id, { withName = true } = {}) {
    const sw = data.software[id] || { name: id, short: id.slice(0, 2), color: '#9b9bab' };
    const mark = sw.icon
      ? `<img src="${esc(sw.icon)}" alt="" width="24" height="24">`
      : esc(sw.short);
    return `<span class="sw" title="${esc(sw.name)}">
      <span class="sw-icon" style="--sw: ${esc(sw.color)}" aria-hidden="true">${mark}</span>
      <span class="${withName ? 'sw-name' : 'sr-only'}">${esc(sw.name)}</span>
    </span>`;
  }

  window.Site = { $, $$, esc, categoryLabel, findProject, projectUrl, videoHTML, softwareBadge };

  fillArtistText();
  initHeader();
  initEmbeds();
  initReel();
  initGrid();

  function fillArtistText() {
    $$('[data-artist]').forEach((el) => {
      const value = data.artist[el.dataset.artist];
      if (value) el.textContent = value;
    });
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

    const socials = $('[data-socials]');
    if (socials) {
      socials.innerHTML = data.artist.socials
        .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`)
        .join('');
    }
  }

  function initHeader() {
    const header = $('[data-header]');
    if (!header) return;

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = $('[data-nav-toggle]');
    const nav = $('[data-nav]');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      header.classList.toggle('nav-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a, button')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  function initEmbeds() {
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.embed-play');
      const box = button && button.closest('[data-embed]');
      if (!box) return;
      box.innerHTML = iframeHTML(JSON.parse(box.dataset.embed), box.dataset.embedTitle);
      box.classList.add('is-playing');
    });
  }

  // Showreel modal: built once here so the nav's Reel button works on every page.
  function initReel() {
    const triggers = $$('[data-open-reel]');
    if (!triggers.length) return;

    const reel = data.showreel;
    const dialog = document.createElement('dialog');
    dialog.className = 'reel-modal';
    dialog.setAttribute('aria-labelledby', 'reel-title');
    dialog.innerHTML = `<div class="reel-inner">
      <div class="reel-head">
        <h2 id="reel-title">${esc(reel.title)}</h2>
        <button class="reel-close" type="button" aria-label="Close showreel" data-close-reel>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="reel-body">
        <div class="reel-player" data-reel-player></div>
        <div class="reel-list">
          <h3>Featured in this reel</h3>
          <ol>${reel.chapters.map(chapterHTML).join('')}</ol>
          ${reel.note ? `<p class="reel-note">${esc(reel.note)}</p>` : ''}
        </div>
      </div>
    </div>`;
    document.body.append(dialog);

    const player = $('[data-reel-player]', dialog);

    // The iframe is created on open and removed on close, so playback always stops.
    const open = () => {
      player.innerHTML = iframeHTML(reel, reel.title);
      dialog.showModal();
    };
    const close = () => dialog.close();

    triggers.forEach((button) => button.addEventListener('click', open));
    $('[data-close-reel]', dialog).addEventListener('click', close);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.addEventListener('close', () => {
      player.innerHTML = '';
      if (location.hash === '#reel') history.replaceState(null, '', location.pathname + location.search);
    });

    if (location.hash === '#reel') open();
  }

  function chapterHTML(chapter) {
    const p = findProject(chapter.project);
    if (!p) return '';
    return `<li><a href="${projectUrl(p)}">
      <span class="reel-time">${esc(chapter.time)}</span>
      <span class="reel-item-title">${esc(p.title)}</span>
      <span class="reel-item-cat">${esc(categoryLabel(p.category))}</span>
    </a></li>`;
  }

  // Work grid -----------------------------------------------------------------
  function initGrid() {
    const grid = $('[data-grid]');
    const filters = $('[data-filters]');
    if (!grid || !filters) return;

    const status = $('[data-filter-status]');
    grid.innerHTML = data.projects.map(cardHTML).join('');
    const cards = $$('.project-card', grid);

    filters.innerHTML = data.categories
      .map((c) => {
        const count = c.id === 'all'
          ? data.projects.length
          : data.projects.filter((p) => p.category === c.id).length;
        return `<button type="button" class="filter" data-filter="${esc(c.id)}" aria-pressed="false">
          ${esc(c.label)}<span class="filter-count">${count}</span>
        </button>`;
      })
      .join('');

    function apply(id, { animate = true, updateUrl = true } = {}) {
      $$('[data-filter]', filters).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === id)));

      let shown = 0;
      cards.forEach((card) => {
        const visible = id === 'all' || card.dataset.category === id;
        card.hidden = !visible;
        card.classList.remove('is-entering');
        if (visible && animate) {
          card.style.setProperty('--i', shown);
          void card.offsetWidth; // restart the entrance animation
          card.classList.add('is-entering');
        }
        if (visible) shown += 1;
      });

      if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'} in ${categoryLabel(id)}`;
      if (updateUrl) {
        const url = new URL(location.href);
        if (id === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', id);
        history.replaceState(null, '', url);
      }
    }

    filters.addEventListener('click', (e) => {
      const button = e.target.closest('[data-filter]');
      if (button) apply(button.dataset.filter);
    });

    const requested = new URLSearchParams(location.search).get('category');
    const initial = data.categories.some((c) => c.id === requested) ? requested : 'all';
    apply(initial, { animate: false, updateUrl: false });

    cards.forEach(initPreview);
  }

  function cardHTML(p) {
    const media = p.thumb
      ? `<img src="${esc(p.thumb)}" alt="" loading="lazy" decoding="async">`
      : window.placeholderArt(p);

    let preview = '';
    if (p.preview && /\.(mp4|webm)$/i.test(p.preview)) {
      preview = `<video class="card-preview" data-src="${esc(p.preview)}" muted loop playsinline preload="none" aria-hidden="true"></video>`;
    } else if (p.preview) {
      preview = `<img class="card-preview" data-src="${esc(p.preview)}" alt="" aria-hidden="true">`;
    }

    return `<li class="project-card" data-category="${esc(p.category)}">
      <a class="card-link" href="${projectUrl(p)}">
        <div class="card-media">
          ${media}
          ${preview}
          <span class="card-cta" aria-hidden="true">View project</span>
        </div>
        <div class="card-body">
          <div>
            <h3 class="card-title">${esc(p.title)}</h3>
            <p class="card-cat">${esc(categoryLabel(p.category))}</p>
          </div>
          <span class="card-year">${esc(p.year)}</span>
        </div>
      </a>
    </li>`;
  }

  // Hover previews load on first hover or focus, so the grid stays light.
  function initPreview(card) {
    const preview = $('.card-preview', card);
    if (!preview) return;
    const link = $('.card-link', card);
    const isVideo = preview.tagName === 'VIDEO';

    preview.addEventListener(isVideo ? 'loadeddata' : 'load', () => preview.classList.add('is-loaded'), { once: true });

    const start = () => {
      if (!preview.getAttribute('src')) preview.src = preview.dataset.src;
      if (isVideo) preview.play().catch(() => {});
    };
    const stop = () => {
      if (!isVideo) return;
      preview.pause();
      preview.currentTime = 0;
    };
    link.addEventListener('mouseenter', start);
    link.addEventListener('focus', start);
    link.addEventListener('mouseleave', stop);
    link.addEventListener('blur', stop);
  }
})();
