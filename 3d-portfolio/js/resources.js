/* Resources page: free models, tutorials and blog posts from PORTFOLIO.resources. */
(function () {
  'use strict';

  const data = window.PORTFOLIO;
  const site = window.Site;
  if (!data || !data.resources || !site) return;

  const { $, esc } = site;
  const res = data.resources;

  fill('[data-res-intro]', esc(res.intro));
  fill('[data-res-models]', res.models.map(modelHTML).join(''));
  fill('[data-res-tutorials]', res.tutorials.map(tutorialHTML).join(''));
  fill('[data-res-posts]', res.posts.map(postHTML).join(''));

  const discord = data.contact && data.contact.discord;
  if (discord) {
    fill('[data-res-discord-name]', esc(discord.name));
    const link = $('[data-res-discord-link]');
    if (link) link.href = discord.url;
  }

  function fill(selector, html) {
    const el = $(selector);
    if (el) el.innerHTML = html;
  }

  function soon(label) {
    return `<span class="soon">${esc(label)}<span class="soon-tag">Coming soon</span></span>`;
  }

  function modelHTML(m, i) {
    const art = window.placeholderArt({ id: `resource-${i}`, art: m.art });
    const action = m.url
      ? `<a class="btn btn-small" href="${esc(m.url)}" download>Download<span class="sr-only"> ${esc(m.title)}</span></a>`
      : soon('Download');
    return `<li class="res-card">
      <div class="res-media">${art}<span class="res-license">${esc(m.license)}</span></div>
      <div class="res-body">
        <h3>${esc(m.title)}</h3>
        <p class="res-meta">${esc(m.contents)} · ${esc(m.format)} · ${esc(m.size)}</p>
        ${action}
      </div>
    </li>`;
  }

  function tutorialHTML(t) {
    const title = t.url
      ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.title)}</a>`
      : esc(t.title);
    return `<li class="tut ${t.url ? '' : 'is-soon'}">
      <span class="tut-play" aria-hidden="true"></span>
      <div class="tut-text">
        <h3>${title}</h3>
        <p class="res-meta">${esc(t.platform)} · ${esc(t.duration)}${t.url ? '' : ' · Coming soon'}</p>
      </div>
      <span class="tut-level tut-${esc(t.level.toLowerCase())}">${esc(t.level)}</span>
    </li>`;
  }

  function postHTML(p) {
    const date = new Date(`${p.date}T00:00:00`);
    const pretty = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const title = p.url ? `<a href="${esc(p.url)}">${esc(p.title)}</a>` : esc(p.title);
    return `<li class="post ${p.url ? '' : 'is-soon'}">
      <p class="post-meta"><span class="post-tag">${esc(p.tag)}</span><time datetime="${esc(p.date)}">${pretty}</time> · ${esc(p.readTime)}</p>
      <h3>${title}</h3>
      <p class="post-excerpt">${esc(p.excerpt)}</p>
      ${p.url ? '' : '<p class="soon-tag">Coming soon</p>'}
    </li>`;
  }
})();
