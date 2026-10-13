/* Project page template: project.html?id=<project id>.
   Builds every section from js/data.js. Any section without real media gets
   placeholder art, so a project can be published with only a title and summary. */
(function () {
  'use strict';

  const data = window.PORTFOLIO;
  const site = window.Site;
  const root = document.querySelector('[data-project]');
  if (!data || !site || !root) return;

  const { $, $$, esc, categoryLabel, projectUrl, videoHTML, softwareBadge } = site;
  const art = window.placeholderArt;

  const id = new URLSearchParams(location.search).get('id');
  const index = data.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    renderMissing();
    return;
  }

  const project = data.projects[index];
  const [c1, c2] = project.art.colors;

  document.title = `${project.title} | ${data.artist.name}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = project.summary;

  // Every image that opens in the full-screen viewer, in page order.
  const viewerItems = [];

  const sections = [
    { id: 'overview', title: 'Overview', body: overviewHTML() },
    { id: 'concept', title: 'Concept & Reference', body: conceptHTML() },
    { id: 'process', title: 'Work in Progress', body: processHTML() },
    { id: 'renders', title: 'Final Renders', body: galleryHTML() },
    { id: 'turntable', title: 'Turntable', body: turntableHTML() },
    { id: 'breakdown', title: 'Breakdown', body: breakdownHTML() },
  ].filter((s) => s.body);

  root.innerHTML = `${heroHTML()}
    <div class="container case">
      ${metaHTML()}
      <div class="case-body">${sections.map(sectionHTML).join('')}</div>
    </div>
    ${pagerHTML()}`;

  initCompare();
  initViewer();
  initTurntable();
  initToc();
  initHeroVideo();

  // Media items ---------------------------------------------------------------
  // Each item renders a grid version and a full-size version for the viewer.
  function imageItem(m) {
    return {
      caption: m.caption || '',
      html: () => `<img src="${esc(m.src)}" alt="" loading="lazy" decoding="async">`,
      full: () => `<img src="${esc(m.full || m.src)}" alt="${esc(m.caption || project.title)}" decoding="async">`,
    };
  }

  function artItem(caption, options) {
    return {
      caption,
      html: (variant) => art(project, { ...options, variant }),
      full: (variant) => art(project, { ...options, variant: `${variant}-full` }),
    };
  }

  function figureHTML(item, { label = '', caption = '', className = '' } = {}) {
    const i = viewerItems.push(item) - 1;
    return `<figure class="shot ${className}">
      <button type="button" class="shot-open" data-view="${i}" aria-label="View larger: ${esc(item.caption || label || project.title)}">
        ${item.html(`m${i}`)}
        ${label ? `<span class="shot-label">${esc(label)}</span>` : ''}
      </button>
      ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}
    </figure>`;
  }

  // Sections ------------------------------------------------------------------
  function heroHTML() {
    const hero = project.hero || {};
    let media;
    if (hero.video) {
      media = `<video src="${esc(hero.video)}" ${hero.poster ? `poster="${esc(hero.poster)}"` : ''}
        muted loop playsinline aria-hidden="true" data-hero-video></video>`;
    } else if (hero.image || project.thumb) {
      media = `<img src="${esc(hero.image || project.thumb)}" alt="" fetchpriority="high" decoding="async">`;
    } else {
      media = art(project, { variant: 'hero', zoom: 0.5, shiftY: -25 });
    }

    return `<header class="project-hero">
      <div class="project-hero-media">${media}</div>
      <div class="container project-hero-text">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html#work">Work</a>
          <span aria-hidden="true">/</span>
          <a href="index.html?category=${encodeURIComponent(project.category)}#work">${esc(categoryLabel(project.category))}</a>
        </nav>
        <h1 class="project-title">${esc(project.title)}</h1>
        <p class="project-summary">${esc(project.summary)}</p>
      </div>
    </header>`;
  }

  function metaHTML() {
    const rows = [
      ['Year', esc(project.year)],
      project.client ? ['Client', esc(project.client)] : ['Type', 'Personal project'],
      ['Software', `<ul class="sw-list">${project.software.map((s) => `<li>${softwareBadge(s)}</li>`).join('')}</ul>`],
      ['Role', `<ul class="role-list">${project.roles.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`],
    ];
    return `<aside class="case-meta">
      <div class="case-meta-inner">
        <dl class="meta-list">
          ${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
        </dl>
        <nav class="case-toc" aria-label="On this page">
          <p class="toc-title">On this page</p>
          <ul>${sections.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}</ul>
        </nav>
      </div>
    </aside>`;
  }

  function sectionHTML(s, i) {
    return `<section id="${s.id}" class="case-section" aria-labelledby="${s.id}-title">
      <h2 id="${s.id}-title" class="case-heading">
        <span class="case-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}
      </h2>
      ${s.body}
    </section>`;
  }

  function overviewHTML() {
    const paragraphs = project.overview && project.overview.length ? project.overview : [project.summary];
    return `<div class="prose">${paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`;
  }

  function conceptHTML() {
    const palette = [c1, mixHex(c1, c2), c2];
    const tiles = project.moodboard && project.moodboard.length
      ? project.moodboard.map((m) => figureHTML(imageItem(m), { label: m.caption }))
      : [
          ['Shape language', { angle: -14, zoom: 0.9 }],
          ['Material reference', { mode: 'clay', zoom: 1.6 }],
          ['Lighting mood', { light: '#ffb070', zoom: 0.8 }],
          ['Silhouette study', { mode: 'wire', angle: 10 }],
        ].map(([caption, options]) => figureHTML(artItem(caption, options), { label: caption }));

    return `${project.concept ? `<div class="prose"><p>${esc(project.concept)}</p></div>` : ''}
      <div class="moodboard">
        ${tiles[0]}
        <div class="palette">
          <p class="palette-title">Palette</p>
          <ul>${palette.map((c) => `<li><span class="swatch" style="--c: ${c}"></span><code>${c}</code></li>`).join('')}</ul>
        </div>
        ${tiles.slice(1).join('')}
      </div>`;
  }

  function processHTML() {
    const stageLabels = { wireframe: 'Wireframe', clay: 'Clay render', lighting: 'Lighting test' };
    const items = project.wip && project.wip.length
      ? project.wip.map((w) => ({ item: imageItem(w), label: stageLabels[w.stage] || w.stage }))
      : [
          { item: artItem('Topology pass', { mode: 'wire' }), label: 'Wireframe' },
          { item: artItem('Clay render under neutral light', { mode: 'clay' }), label: 'Clay render' },
          { item: artItem('Warm key light', { light: '#ffb070' }), label: 'Lighting test' },
          { item: artItem('Cool rim light', { light: '#7fb2ff' }), label: 'Lighting test' },
        ];

    return `${compareHTML()}
      <div class="wip-grid">
        ${items.map(({ item, label }) => figureHTML(item, { label, caption: item.caption })).join('')}
      </div>`;
  }

  // Wireframe-to-final slider. Uses placeholders, or real images when both exist.
  function compareHTML() {
    let before;
    let after;
    if (project.wip && project.wip.length) {
      const wire = project.wip.find((w) => w.stage === 'wireframe');
      const finalSrc = (project.gallery && project.gallery[0] && project.gallery[0].src) || project.thumb;
      if (!wire || !finalSrc) return '';
      before = `<img src="${esc(wire.src)}" alt="" loading="lazy" decoding="async">`;
      after = `<img src="${esc(finalSrc)}" alt="" loading="lazy" decoding="async">`;
    } else {
      before = art(project, { mode: 'wire', variant: 'compare' });
      after = art(project, { variant: 'compare' });
    }
    return `<div class="compare" data-compare>
      <div class="compare-layer">${after}</div>
      <div class="compare-layer compare-before">${before}</div>
      <div class="compare-handle" aria-hidden="true"></div>
      <span class="compare-tag compare-tag-before" aria-hidden="true">Wireframe</span>
      <span class="compare-tag compare-tag-after" aria-hidden="true">Final</span>
      <input class="compare-range" type="range" min="0" max="100" value="50"
        aria-label="Compare wireframe and final render: amount of wireframe shown">
    </div>`;
  }

  function galleryHTML() {
    const items = project.gallery && project.gallery.length
      ? project.gallery.map(imageItem)
      : [
          artItem('Hero angle', { zoom: 0.9 }),
          artItem('Three-quarter view', { angle: -18, flip: true }),
          artItem('Detail close-up', { zoom: 1.8, angle: 8 }),
          artItem('Side view', { angle: 24 }),
          artItem('High angle', { zoom: 0.7, angle: -30 }),
        ];
    return `<div class="gallery">
      ${items.map((item, i) => figureHTML(item, { caption: item.caption, className: i === 0 ? 'shot-wide' : '' })).join('')}
    </div>`;
  }

  function turntableHTML() {
    if (project.turntable) return videoHTML(project.turntable, `${project.title} turntable`);
    if (project.category !== 'character' && project.category !== 'product') return '';
    return `<div class="turntable" data-turntable tabindex="0" role="group"
        aria-label="3D turntable of ${esc(project.title)}. Drag, or use the left and right arrow keys, to rotate.">
      <div class="turntable-fallback">${art(project, { mode: 'clay', variant: 'turntable' })}</div>
      <canvas></canvas>
      <div class="turntable-ui">
        <div class="seg" role="group" aria-label="Shading">
          <button type="button" data-tt-mode="render" aria-pressed="true">Render</button>
          <button type="button" data-tt-mode="clay" aria-pressed="false">Clay</button>
          <button type="button" data-tt-mode="wire" aria-pressed="false">Wire</button>
        </div>
        <p class="turntable-hint" aria-hidden="true">Drag to rotate</p>
      </div>
    </div>`;
  }

  function breakdownHTML() {
    if (!project.breakdown) return '';
    return videoHTML(project.breakdown, project.breakdown.title || `${project.title} breakdown`);
  }

  function pagerHTML() {
    const n = data.projects.length;
    if (n < 2) return '';
    const prev = data.projects[(index - 1 + n) % n];
    const next = data.projects[(index + 1) % n];
    const link = (p, dir) => `<a class="pager-link pager-${dir}" href="${projectUrl(p)}">
      <span class="pager-thumb">${p.thumb ? `<img src="${esc(p.thumb)}" alt="" loading="lazy" decoding="async">` : art(p, { variant: `pager-${dir}` })}</span>
      <span class="pager-text">
        <span class="pager-dir">${dir === 'prev' ? 'Previous' : 'Next'} project</span>
        <span class="pager-title">${esc(p.title)}</span>
      </span>
    </a>`;
    return `<nav class="container pager" aria-label="More projects">${link(prev, 'prev')}${link(next, 'next')}</nav>`;
  }

  function renderMissing() {
    document.title = `Project not found | ${data.artist.name}`;
    root.innerHTML = `<div class="container not-found">
      <p class="eyebrow">404</p>
      <h1>Project not found</h1>
      <p>That project doesn’t exist or has moved.</p>
      <a class="btn btn-primary" href="index.html#work">Back to all work</a>
    </div>`;
  }

  // Behaviour -----------------------------------------------------------------
  function initCompare() {
    const compare = $('[data-compare]', root);
    if (!compare) return;
    const range = $('.compare-range', compare);
    const update = () => compare.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  }

  function initViewer() {
    if (!viewerItems.length) return;

    const dialog = document.createElement('dialog');
    dialog.className = 'viewer';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = `
      <div class="viewer-stage" data-viewer-stage></div>
      <div class="viewer-bar">
        <p class="viewer-caption" data-viewer-caption></p>
        <span class="viewer-count" data-viewer-count></span>
      </div>
      <button type="button" class="viewer-btn viewer-close" aria-label="Close viewer" data-viewer-close><span aria-hidden="true">&times;</span></button>
      <button type="button" class="viewer-btn viewer-prev" aria-label="Previous image" data-viewer-step="-1"><span aria-hidden="true">&lsaquo;</span></button>
      <button type="button" class="viewer-btn viewer-next" aria-label="Next image" data-viewer-step="1"><span aria-hidden="true">&rsaquo;</span></button>`;
    document.body.append(dialog);

    const stage = $('[data-viewer-stage]', dialog);
    const caption = $('[data-viewer-caption]', dialog);
    const count = $('[data-viewer-count]', dialog);
    let current = 0;

    const show = (i) => {
      current = (i + viewerItems.length) % viewerItems.length;
      const item = viewerItems[current];
      stage.innerHTML = item.full(`m${current}`);
      caption.textContent = item.caption;
      count.textContent = `${current + 1} / ${viewerItems.length}`;
    };

    root.addEventListener('click', (e) => {
      const button = e.target.closest('[data-view]');
      if (!button) return;
      show(Number(button.dataset.view));
      dialog.showModal();
    });
    dialog.addEventListener('click', (e) => {
      const step = e.target.closest('[data-viewer-step]');
      if (step) show(current + Number(step.dataset.viewerStep));
      else if (e.target.closest('[data-viewer-close]') || e.target === dialog || e.target === stage) dialog.close();
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    dialog.addEventListener('close', () => { stage.innerHTML = ''; });
  }

  function initTurntable() {
    const container = $('[data-turntable]', root);
    if (!container) return;
    const mounted = window.mountTurntable && window.mountTurntable(container, project);
    container.classList.toggle('is-static', !mounted);
  }

  // Highlight the section currently in view in the sidebar.
  function initToc() {
    const links = $$('.case-toc a', root);
    const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const link = byId.get(entry.target.id);
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.case-section', root).forEach((s) => observer.observe(s));
  }

  function initHeroVideo() {
    const heroVideo = $('[data-hero-video]', root);
    if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroVideo.play().catch(() => {});
  }

  function mixHex(a, b) {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ch = (shift) => Math.round((((pa >> shift) & 255) + ((pb >> shift) & 255)) / 2);
    return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`;
  }
})();
