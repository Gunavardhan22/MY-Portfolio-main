/* All site content lives here. Replace the placeholder artist, projects and
   links with your own; every page reads from this one object. */
window.PORTFOLIO = {
  artist: {
    name: 'Nova Reyes',
    title: '3D Artist & Animator',
    tagline: 'I build characters, worlds and products in 3D, from first blockout to final frame.',
    location: 'Lisbon, Portugal',
    email: 'hello@novareyes.example',
    socials: [
      { label: 'ArtStation', handle: 'novareyes', url: 'https://www.artstation.com/' },
      { label: 'Behance', handle: 'novareyes', url: 'https://www.behance.net/' },
      { label: 'Instagram', handle: '@novareyes.3d', url: 'https://www.instagram.com/' },
      { label: 'Discord', handle: 'Render Club', url: 'https://discord.com/' },
    ],
  },

  contact: {
    // status: 'open', 'limited' or 'closed'
    commission: {
      status: 'open',
      label: 'Open for commissions',
      note: 'Two project slots available this quarter.',
      responseTime: 'I reply within two working days.',
    },
    discord: {
      name: 'Render Club',
      url: 'https://discord.com/',
      text: 'A friendly server for sharing work in progress, getting feedback and joining monthly render challenges.',
    },
    projectTypes: ['Character', 'Environment', 'Product visualization', 'Motion graphics', 'Something else'],
    budgets: ['Under €1,000', '€1,000 – €5,000', '€5,000 – €15,000', '€15,000+', 'Not sure yet'],
    rates: {
      // Set `file` to a PDF path to offer a download; otherwise visitors can save the table as a PDF.
      file: null,
      note: 'Starting prices in euros, excluding VAT. Final quotes depend on scope, deadline and usage rights.',
      items: [
        { service: 'Game-ready character', price: 'from €1,800', unit: 'per character', details: 'Sculpt, retopology, UVs and PBR textures' },
        { service: 'Environment scene', price: 'from €2,500', unit: 'per scene', details: 'Modular kit, set dressing and lighting' },
        { service: 'Product visualization', price: 'from €900', unit: 'per product', details: 'Model, materials and three hero stills' },
        { service: 'Animation & motion', price: 'from €350', unit: 'per finished second', details: 'Animation, simulation, render and composite' },
        { service: 'Turntable add-on', price: 'from €250', unit: 'per asset', details: '360° loop in clay, wireframe and final' },
        { service: 'Day rate', price: '€450', unit: 'per day', details: 'For studio support and open-ended work' },
      ],
    },
  },

  // Items with `url: null` show as "Coming soon".
  resources: {
    intro: 'Free models, tutorials and notes on technique. Use them in your own work, and tag me when you do.',
    models: [
      { title: 'Stylized Rock Kit', format: 'BLEND · FBX', license: 'CC0', size: '48 MB', contents: '24 pieces', url: null, art: { shape: 'pyramid', colors: ['#9aa3b5', '#2a2f3a'] } },
      { title: 'Studio Lighting Rig', format: 'BLEND', license: 'CC0', size: '6 MB', contents: '3 lighting setups', url: null, art: { shape: 'sphere', colors: ['#ffd9a0', '#3a2a1a'] } },
      { title: 'Turntable Template', format: 'BLEND · C4D', license: 'CC BY 4.0', size: '3 MB', contents: 'Camera, plate and 4K preset', url: null, art: { shape: 'ring', colors: ['#ff7a45', '#3a1408'] } },
      { title: 'Low-poly Props Pack', format: 'FBX · GLB', license: 'CC0', size: '22 MB', contents: '40 props', url: null, art: { shape: 'cube', colors: ['#8bd17c', '#173b22'] } },
    ],
    tutorials: [
      { title: 'Sculpting readable silhouettes in ZBrush', platform: 'YouTube', duration: '24 min', level: 'Beginner', url: null },
      { title: 'Clean retopology for game characters', platform: 'YouTube', duration: '41 min', level: 'Intermediate', url: null },
      { title: 'Three-point lighting for product renders', platform: 'ArtStation Learning', duration: '18 min', level: 'Beginner', url: null },
      { title: 'Procedural fluid type in Houdini', platform: 'YouTube', duration: '56 min', level: 'Advanced', url: null },
    ],
    posts: [
      { title: 'Why I block out everything in grey first', date: '2026-09-02', readTime: '6 min read', tag: 'Workflow', excerpt: 'Colour and texture hide problems. A grey blockout shows you whether the shapes and composition work before you spend days on detail.', url: null },
      { title: 'Lighting a product shot in five passes', date: '2026-07-14', readTime: '9 min read', tag: 'Lighting', excerpt: 'Key, fill, rim, kicker and a reflection card: how I build up light on glossy products, one pass at a time.', url: null },
      { title: 'What I learned from 100 daily renders', date: '2026-04-28', readTime: '7 min read', tag: 'Personal', excerpt: 'Speed, scope and the value of finishing things. Notes from a hundred days of making one render every day.', url: null },
    ],
  },

  // Set `video` (and optionally `poster`) to a looping render to replace the WebGL hero.
  hero: {
    video: null,
    poster: null,
  },

  // provider: 'youtube' or 'vimeo'. `id` is the video id from the share URL.
  showreel: {
    title: 'Showreel 2026',
    provider: 'youtube',
    id: 'eRsGyueVLvQ',
    note: 'Placeholder video: "Sintel" by the Blender Foundation (CC BY 3.0). Replace with your own reel.',
    chapters: [
      { time: '0:04', project: 'ember-warden' },
      { time: '0:18', project: 'last-light-station' },
      { time: '0:31', project: 'aurora-headphones' },
      { time: '0:45', project: 'pulse-ident' },
      { time: '0:58', project: 'mossback' },
    ],
  },

  /* Software shown as badges on project pages and the About page.
     `short` and `color` draw a monogram badge; set `icon` to an SVG path to use a real logo. */
  software: {
    blender: { name: 'Blender', short: 'Bl', color: '#f5792a' },
    maya: { name: 'Maya', short: 'Ma', color: '#37b6c9' },
    c4d: { name: 'Cinema 4D', short: 'C4D', color: '#5b8cff' },
    zbrush: { name: 'ZBrush', short: 'Zb', color: '#d6d6de' },
    'substance-painter': { name: 'Substance 3D Painter', short: 'Pt', color: '#ff5c7a' },
    houdini: { name: 'Houdini', short: 'Hou', color: '#ff6a2b' },
    unreal: { name: 'Unreal Engine', short: 'UE', color: '#e8e8ee' },
    'after-effects': { name: 'After Effects', short: 'Ae', color: '#a5a5ff' },
    redshift: { name: 'Redshift', short: 'Rs', color: '#ff5a5f' },
    arnold: { name: 'Arnold', short: 'Ar', color: '#6cc7b2' },
    photoshop: { name: 'Photoshop', short: 'Ps', color: '#4cb4ff' },
  },

  about: {
    photo: null, // path to a portrait; a generated avatar is shown until you set one
    intro: 'I’m a 3D generalist who loves the whole pipeline, from the first silhouette sketch to the last render pass.',
    bio: [
      'For eight years I’ve made characters, environments and product films for game studios, agencies and brands. I started out sculpting creatures for tabletop miniatures, moved into game art, and now split my time between client work and personal projects that let me try new techniques.',
      'I care about readable shapes, honest materials and lighting that tells you where to look. Most of my work is made in Blender and ZBrush, with Houdini for anything that needs to be simulated.',
    ],
    experience: [
      { period: '2023 – now', role: 'Freelance 3D Artist', org: 'Independent', note: 'Product films, game assets and motion work for studios and brands.' },
      { period: '2020 – 2023', role: 'Senior 3D Artist', org: 'Northwind Games', note: 'Led character art on two console titles.' },
      { period: '2018 – 2020', role: '3D Artist', org: 'Fieldwork Studio', note: 'Environments and look-dev for animated commercials.' },
      { period: '2014 – 2017', role: 'BA Animation', org: 'School of Arts and Design', note: 'Graduated with a short film selected for three festivals.' },
    ],
    // level: 1 Learning, 2 Familiar, 3 Proficient, 4 Advanced, 5 Expert
    skills: [
      { software: 'blender', level: 5, years: 8 },
      { software: 'zbrush', level: 5, years: 7 },
      { software: 'substance-painter', level: 4, years: 6 },
      { software: 'maya', level: 4, years: 6 },
      { software: 'houdini', level: 3, years: 3 },
      { software: 'unreal', level: 3, years: 3 },
      { software: 'c4d', level: 3, years: 4 },
      { software: 'after-effects', level: 4, years: 7 },
    ],
    hardware: [
      { label: 'CPU', value: 'AMD Ryzen 9 9950X, 16 cores' },
      { label: 'GPU', value: 'NVIDIA GeForce RTX 5090, 32 GB' },
      { label: 'Memory', value: '128 GB DDR5' },
      { label: 'Storage', value: '4 TB NVMe for projects and cache, 16 TB NAS for archive' },
      { label: 'Display', value: '32" 4K, calibrated to DCI-P3' },
      { label: 'Input', value: 'Wacom Cintiq Pro 24, 3Dconnexion SpaceMouse' },
      { label: 'Rendering', value: 'Local GPU for stills, cloud render farm for animation' },
    ],
    process: [
      { title: 'Brief & reference', text: 'Agree goals, deliverables and style, then gather reference into a shared mood board.' },
      { title: 'Blockout', text: 'Rough primitives to lock proportions, camera and composition before any detail.' },
      { title: 'Model & sculpt', text: 'High-poly sculpting, clean retopology and UVs ready for texturing or rigging.' },
      { title: 'Texture & look-dev', text: 'Physically based materials, tested under neutral and final lighting.' },
      { title: 'Light & animate', text: 'Lighting passes, animation and simulation, reviewed in playblasts.' },
      { title: 'Render & deliver', text: 'Final renders, compositing and every format the project needs.' },
    ],
    learning: [
      { title: 'Gaussian splatting', text: 'Capturing real places and mixing them with CG environments.' },
      { title: 'Houdini FLIP & Vellum', text: 'Fluids and cloth for product films.' },
      { title: 'Unreal virtual production', text: 'Real-time lighting and camera work for cinematics.' },
      { title: 'Substance 3D Designer', text: 'Fully procedural, tileable materials.' },
    ],
    availability: [
      { type: 'Freelance', open: true, note: 'Taking on new projects' },
      { type: 'Full-time', open: false, note: 'Not looking right now' },
      { type: 'Collaborations', open: true, note: 'Short films, game jams and open-source assets' },
    ],
  },

  categories: [
    { id: 'all', label: 'All Work' },
    { id: 'character', label: 'Character Design' },
    { id: 'environment', label: 'Environment Art' },
    { id: 'product', label: 'Product Visualization' },
    { id: 'motion', label: 'Motion Graphics' },
    { id: 'personal', label: 'Personal Projects' },
  ],

  /* Each project:
     - thumb:     hero render for the grid (export ~1600x1200, WebP or JPG)
     - preview:   optional GIF, MP4 or WebM that plays on hover
     - art:       colours and shape for the procedural placeholder shown until real images are set
     - client:    leave null for personal work

     Optional project page fields (placeholders are shown for any you leave out;
     Ember Warden below has the text fields filled in as an example):
     - hero:       { image } or { video, poster }, shown at the top of the page
     - overview:   array of paragraphs (falls back to `summary`)
     - concept:    paragraph about ideas and reference
     - moodboard:  [{ src, caption }]
     - wip:        [{ src, stage: 'wireframe' | 'clay' | 'lighting', caption }]
     - gallery:    [{ src, full, caption }], where `full` is the high-resolution file opened in the viewer
     - turntable:  { provider: 'youtube' | 'vimeo', id } or { src, poster }
     - breakdown:  same format as turntable, plus an optional `title` */
  projects: [
    {
      id: 'ember-warden',
      title: 'Ember Warden',
      category: 'character',
      year: 2026,
      client: null,
      software: ['zbrush', 'maya', 'substance-painter', 'arnold'],
      roles: ['Modeling', 'Texturing', 'Lighting'],
      summary: 'A fire-forged sentinel sculpted for a fantasy card game pitch.',
      thumb: null,
      preview: null,
      art: { shape: 'pillar', colors: ['#ff7a45', '#5c160a'] },
      overview: [
        'Ember Warden began as a pitch piece for a fantasy card game: a guardian whose armour is cooling slag, still glowing at the seams. The brief asked for a silhouette that reads at thumbnail size and holds up as a full-screen splash.',
        'I sculpted the body and armour in ZBrush, retopologised in Maya to a 40k-triangle game mesh, and baked the high-poly detail down. The glowing cracks are driven by a single mask, so the effect can be animated in-engine.',
      ],
      concept: 'Reference came from volcanic rock, blacksmith forges and Gothic reliquaries. I kept the shapes heavy at the base and narrow toward the head, so the figure feels rooted and tall.',
      breakdown: { provider: 'youtube', id: 'eRsGyueVLvQ', title: 'Breakdown (placeholder video)' },
    },
    {
      id: 'mossback',
      title: 'Mossback',
      category: 'character',
      year: 2025,
      client: null,
      software: ['blender', 'zbrush', 'substance-painter'],
      roles: ['Modeling', 'Texturing', 'Animation'],
      summary: 'A stylized forest creature, sculpted, groomed and rigged for a short walk cycle.',
      thumb: null,
      preview: null,
      art: { shape: 'sphere', colors: ['#8bd17c', '#173b22'] },
    },
    {
      id: 'last-light-station',
      title: 'Last Light Station',
      category: 'environment',
      year: 2026,
      client: null,
      software: ['blender', 'unreal', 'substance-painter'],
      roles: ['Modeling', 'Texturing', 'Lighting'],
      summary: 'A lonely refuelling stop on the edge of a desert planet, built in Unreal Engine 5.',
      thumb: null,
      preview: null,
      art: { shape: 'cube', colors: ['#ffb35c', '#2b2f5a'] },
    },
    {
      id: 'sunken-archive',
      title: 'Sunken Archive',
      category: 'environment',
      year: 2025,
      client: null,
      software: ['maya', 'unreal', 'photoshop'],
      roles: ['Modeling', 'Lighting'],
      summary: 'A flooded library lit by caustics and bioluminescent coral.',
      thumb: null,
      preview: null,
      art: { shape: 'pyramid', colors: ['#4fd1c5', '#0b2a3c'] },
    },
    {
      id: 'aurora-headphones',
      title: 'Aurora Headphones',
      category: 'product',
      year: 2026,
      client: 'Lumen Audio',
      software: ['c4d', 'redshift', 'after-effects'],
      roles: ['Modeling', 'Texturing', 'Lighting', 'Animation'],
      summary: 'Launch film and hero stills for a premium wireless headphone.',
      thumb: null,
      preview: null,
      art: { shape: 'ring', colors: ['#c7b8ff', '#2e2459'] },
    },
    {
      id: 'kiko-watch',
      title: 'Kiko Smartwatch',
      category: 'product',
      year: 2025,
      client: 'Kiko Wearables',
      software: ['blender', 'substance-painter'],
      roles: ['Modeling', 'Texturing', 'Lighting'],
      summary: 'Photoreal e-commerce renders across six colourways.',
      thumb: null,
      preview: null,
      art: { shape: 'cube', colors: ['#9ad0ff', '#1a2c4a'] },
    },
    {
      id: 'pulse-ident',
      title: 'Pulse Festival Ident',
      category: 'motion',
      year: 2026,
      client: 'Pulse Festival',
      software: ['houdini', 'c4d', 'after-effects'],
      roles: ['Animation', 'Lighting'],
      summary: 'A ten-second procedural ident for an electronic music festival.',
      thumb: null,
      preview: null,
      art: { shape: 'cluster', colors: ['#ff4fa3', '#2a0b3d'] },
    },
    {
      id: 'liquid-type',
      title: 'Liquid Type',
      category: 'motion',
      year: 2025,
      client: null,
      software: ['houdini', 'redshift'],
      roles: ['Animation', 'Lighting'],
      summary: 'A fluid-simulated typography loop exploring viscosity and surface tension.',
      thumb: null,
      preview: null,
      art: { shape: 'ring', colors: ['#6aa8ff', '#0d1b40'] },
    },
    {
      id: 'tiny-planets',
      title: 'Tiny Planets',
      category: 'personal',
      year: 2026,
      client: null,
      software: ['blender'],
      roles: ['Modeling', 'Texturing', 'Lighting'],
      summary: 'A series of miniature worlds, each built in a single weekend.',
      thumb: null,
      preview: null,
      art: { shape: 'sphere', colors: ['#ffd166', '#4a2c0a'] },
    },
    {
      id: 'daily-renders',
      title: 'Daily Renders',
      category: 'personal',
      year: 2025,
      client: null,
      software: ['blender', 'photoshop'],
      roles: ['Modeling', 'Lighting'],
      summary: 'One hundred days, one hundred renders: studies in light and form.',
      thumb: null,
      preview: null,
      art: { shape: 'cluster', colors: ['#b8b8c8', '#22222c'] },
    },
  ],
};
