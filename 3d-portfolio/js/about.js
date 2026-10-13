/* About page: fills about.html from PORTFOLIO.about. */
(function () {
  'use strict';

  const data = window.PORTFOLIO;
  const site = window.Site;
  if (!data || !data.about || !site) return;

  const { $, esc, softwareBadge } = site;
  const about = data.about;
  const LEVELS = ['', 'Learning', 'Familiar', 'Proficient', 'Advanced', 'Expert'];

  fill('[data-about-photo]', photoHTML());
  fill('[data-about-intro]', esc(about.intro));
  fill('[data-about-bio]', about.bio.map((p) => `<p>${esc(p)}</p>`).join(''));
  fill('[data-about-location]', esc(data.artist.location));
  fill('[data-about-availability]', about.availability.map(availabilityHTML).join(''));
  fill('[data-about-experience]', about.experience.map(experienceHTML).join(''));
  fill('[data-about-skills]', about.skills.map(skillHTML).join(''));
  fill('[data-about-hardware]', about.hardware.map(hardwareHTML).join(''));
  fill('[data-about-process]', about.process.map(processHTML).join(''));
  fill('[data-about-learning]', about.learning.map(learningHTML).join(''));

  function fill(selector, html) {
    const el = $(selector);
    if (el) el.innerHTML = html;
  }

  function photoHTML() {
    if (about.photo) {
      return `<img src="${esc(about.photo)}" alt="Portrait of ${esc(data.artist.name)}" decoding="async">`;
    }
    const initials = data.artist.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Avatar for ${esc(data.artist.name)}">
      <defs>
        <radialGradient id="avatar-bg" cx="50%" cy="35%" r="80%">
          <stop offset="0" stop-color="#ff7a45" stop-opacity=".45"/>
          <stop offset=".6" stop-color="#2a1a2e"/>
          <stop offset="1" stop-color="#0d0c11"/>
        </radialGradient>
        <radialGradient id="avatar-sphere" cx="36%" cy="30%" r="75%">
          <stop offset="0" stop-color="#fff"/>
          <stop offset=".25" stop-color="#ff9a6b"/>
          <stop offset="1" stop-color="#5c160a"/>
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#avatar-bg)"/>
      <circle cx="200" cy="200" r="105" fill="url(#avatar-sphere)"/>
      <ellipse cx="200" cy="335" rx="110" ry="13" fill="#000" opacity=".45"/>
      <text x="200" y="410" text-anchor="middle" fill="#ececf1" font-family="Space Grotesk, sans-serif" font-size="44" font-weight="600" letter-spacing="4">${esc(initials)}</text>
    </svg>`;
  }

  function availabilityHTML(a) {
    return `<li class="avail ${a.open ? 'is-open' : 'is-closed'}">
      <span class="avail-dot" aria-hidden="true"></span>
      <span class="avail-type">${esc(a.type)}</span>
      <span class="avail-status">${a.open ? 'Open' : 'Closed'}</span>
      <span class="avail-note">${esc(a.note)}</span>
    </li>`;
  }

  function experienceHTML(e) {
    return `<li>
      <span class="xp-period">${esc(e.period)}</span>
      <div>
        <h3 class="xp-role">${esc(e.role)} <span class="xp-org">· ${esc(e.org)}</span></h3>
        <p class="xp-note">${esc(e.note)}</p>
      </div>
    </li>`;
  }

  function skillHTML(s) {
    const segments = [1, 2, 3, 4, 5].map((n) => `<span class="${n <= s.level ? 'is-on' : ''}"></span>`).join('');
    return `<li class="skill">
      ${softwareBadge(s.software)}
      <span class="meter" aria-hidden="true">${segments}</span>
      <span class="skill-level">${LEVELS[s.level] || ''}<span class="skill-years"> · ${esc(s.years)} ${s.years === 1 ? 'yr' : 'yrs'}</span></span>
    </li>`;
  }

  function hardwareHTML(h) {
    return `<div class="spec"><dt>${esc(h.label)}</dt><dd>${esc(h.value)}</dd></div>`;
  }

  function processHTML(step, i) {
    return `<li class="step">
      <span class="step-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(step.title)}</h3>
      <p>${esc(step.text)}</p>
    </li>`;
  }

  function learningHTML(item) {
    return `<li class="learn"><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></li>`;
  }
})();
