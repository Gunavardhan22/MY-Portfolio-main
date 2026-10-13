/* Procedural stand-in renders, shown until a project has real images.
   placeholderArt(project, options) returns an SVG string. Options:
   - mode:    'render' | 'clay' | 'wire'
   - variant: unique suffix when the same project is drawn more than once on a page
   - angle, zoom, flip, shiftY: fake camera changes for gallery and hero shots
   - light:   key-light colour, for lighting tests */
(function () {
  'use strict';

  const SHAPES = {
    sphere: (p) =>
      `<circle cx="200" cy="140" r="72" fill="${p.main}" ${p.line}/>` +
      (p.wire
        ? [26, 52].map((r) =>
            `<ellipse cx="200" cy="140" rx="72" ry="${r}" fill="none" ${p.line}/>` +
            `<ellipse cx="200" cy="140" rx="${r}" ry="72" fill="none" ${p.line}/>`).join('')
        : ''),

    cube: (p) =>
      `<polygon points="200,58 272,98 200,138 128,98" fill="${p.light}" ${p.line}/>` +
      `<polygon points="128,98 200,138 200,222 128,182" fill="${p.mid}" ${p.line}/>` +
      `<polygon points="272,98 200,138 200,222 272,182" fill="${p.dark}" ${p.line}/>` +
      (p.wire
        ? `<polyline points="164,78 236,118 236,202" fill="none" ${p.line}/><polyline points="236,78 164,118 164,202" fill="none" ${p.line}/>`
        : ''),

    ring: (p) =>
      p.wire
        ? [[101, 69], [86, 54], [71, 39]].map(([rx, ry]) =>
            `<ellipse cx="200" cy="140" rx="${rx}" ry="${ry}" fill="none" ${p.line}/>`).join('')
        : `<ellipse cx="200" cy="140" rx="86" ry="54" fill="none" stroke="${p.main}" stroke-width="30"/>`,

    pillar: (p) =>
      `<rect x="160" y="46" width="80" height="184" rx="40" fill="${p.main}" ${p.line}/>` +
      (p.wire
        ? [86, 118, 150, 182].map((y) => `<ellipse cx="200" cy="${y}" rx="40" ry="10" fill="none" ${p.line}/>`).join('')
        : ''),

    pyramid: (p) =>
      `<polygon points="200,50 120,206 200,230" fill="${p.light}" ${p.line}/>` +
      `<polygon points="200,50 280,206 200,230" fill="${p.dark}" ${p.line}/>`,

    cluster: (p) =>
      `<circle cx="168" cy="162" r="54" fill="${p.main}" ${p.line}/>` +
      `<circle cx="252" cy="118" r="38" fill="${p.main}" ${p.line}/>` +
      `<circle cx="246" cy="198" r="24" fill="${p.main}" ${p.line}/>`,
  };

  window.placeholderArt = function placeholderArt(project, options = {}) {
    const mode = options.mode || 'render';
    const [c1, c2] = project.art.colors;
    const uid = `${project.id}-${mode}-${options.variant || 'a'}`;
    const shape = SHAPES[project.art.shape] || SHAPES.sphere;
    const light = options.light || null;

    const paint = {
      render: { main: `url(#shade-${uid})`, light: c1, mid: mix(c1, c2), dark: c2, line: '', wire: false },
      clay: { main: `url(#shade-${uid})`, light: '#d6d1ca', mid: '#a9a49d', dark: '#7c7771', line: '', wire: false },
      wire: { main: 'none', light: 'none', mid: 'none', dark: 'none', wire: true,
        line: `stroke="${c1}" stroke-width="1.4" stroke-opacity=".85"` },
    }[mode];

    const shadeStops = mode === 'clay'
      ? '<stop offset="0" stop-color="#f1ede7"/><stop offset=".45" stop-color="#b9b4ad"/><stop offset="1" stop-color="#6d6863"/>'
      : `<stop offset="0" stop-color="${light || '#fff'}" stop-opacity=".95"/><stop offset=".22" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>`;

    const backdrop = {
      render: `<radialGradient id="bg-${uid}" cx="50%" cy="38%" r="80%"><stop offset="0" stop-color="${light || c1}" stop-opacity="${light ? '.45' : '.32'}"/><stop offset=".6" stop-color="${c2}" stop-opacity=".25"/><stop offset="1" stop-color="#0b0b0f"/></radialGradient>`,
      clay: `<radialGradient id="bg-${uid}" cx="50%" cy="38%" r="80%"><stop offset="0" stop-color="#3a3a42"/><stop offset="1" stop-color="#141418"/></radialGradient>`,
      wire: `<radialGradient id="bg-${uid}" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#16161d"/><stop offset="1" stop-color="#0b0b0f"/></radialGradient>`,
    }[mode];

    const grid = mode === 'wire'
      ? `<g stroke="#fff" stroke-opacity=".05">${range(0, 400, 25).map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="300"/>`).join('')}${range(0, 300, 25).map((y) => `<line x1="0" y1="${y}" x2="400" y2="${y}"/>`).join('')}</g>`
      : '';

    const ground = mode === 'wire'
      ? `<ellipse cx="200" cy="238" rx="110" ry="14" fill="none" stroke="${c1}" stroke-opacity=".3" stroke-dasharray="4 6"/>`
      : `<ellipse cx="200" cy="238" rx="96" ry="12" fill="#000" opacity=".55" filter="url(#blur-${uid})"/>`;

    return `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        ${backdrop}
        <radialGradient id="shade-${uid}" cx="36%" cy="30%" r="75%">${shadeStops}</radialGradient>
        <filter id="blur-${uid}" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <rect width="400" height="300" fill="url(#bg-${uid})"/>
      ${grid}
      ${ground}
      <g transform="${camera(options)}"><g class="art-shape">${shape(paint)}</g></g>
    </svg>`;
  };

  function camera({ angle = 0, zoom = 1, flip = false, shiftY = 0 }) {
    return `translate(200 ${140 + shiftY}) rotate(${angle}) scale(${flip ? -zoom : zoom} ${zoom}) translate(-200 -140)`;
  }

  function range(start, end, step) {
    const out = [];
    for (let v = start; v <= end; v += step) out.push(v);
    return out;
  }

  // Midpoint of two hex colours, for the cube's middle face.
  function mix(a, b) {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ch = (shift) => Math.round((((pa >> shift) & 255) + ((pb >> shift) & 255)) / 2);
    return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
  }
})();
