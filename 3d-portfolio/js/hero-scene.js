/* WebGL hero: a slowly turning sculpture with Render / Clay / Wire shading.
   Uses a looping video instead when PORTFOLIO.hero.video is set, and falls back
   to the CSS gradient when WebGL or three.js is unavailable. */
(function () {
  'use strict';

  const stage = document.querySelector('[data-hero-stage]');
  if (!stage) return;

  const root = document.documentElement;
  const hero = stage.closest('.hero');
  const shading = document.querySelector('[data-shading]');
  const heroConfig = (window.PORTFOLIO && window.PORTFOLIO.hero) || {};
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (heroConfig.video) {
    useVideo(heroConfig);
    return;
  }

  const canvas = stage.querySelector('[data-hero-canvas]');
  const THREE = window.THREE;
  if (!canvas || !THREE) {
    root.classList.add('no-webgl');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    root.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const color = (hex) => window.srgbColor(THREE, hex);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  scene.environment = window.createStudioEnvironment(THREE, renderer);

  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(4, 5, 6);
  const rim = new THREE.DirectionalLight(0x6aa8ff, 1.1);
  rim.position.set(-5, 2, -4);
  scene.add(key, rim);

  // Every mesh carries its three shading materials so the toggle can swap them.
  const clayMaterial = new THREE.MeshStandardMaterial({ color: color(0xbab4ab), roughness: 0.85, metalness: 0 });
  const wireMaterial = new THREE.MeshBasicMaterial({ color: color(0xff7a45), wireframe: true, transparent: true, opacity: 0.5, toneMapped: false });
  const meshes = [];
  const rig = new THREE.Group();
  scene.add(rig);

  function addMesh(geometry, material, parent) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.materials = { render: material, clay: clayMaterial, wire: wireMaterial };
    parent.add(mesh);
    meshes.push(mesh);
    return mesh;
  }

  const knot = addMesh(
    new THREE.TorusKnotGeometry(1.3, 0.42, 240, 40, 2, 3),
    new THREE.MeshPhysicalMaterial({ color: color(0xff6a3d), roughness: 0.32, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 }),
    rig
  );

  const satellites = [
    {
      geometry: new THREE.SphereGeometry(0.34, 48, 32),
      material: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, metalness: 1 }),
      radius: 2.3, speed: 0.35, tilt: 0.5, phase: 0,
    },
    {
      geometry: new THREE.BoxGeometry(0.46, 0.46, 0.46, 3, 3, 3),
      material: new THREE.MeshStandardMaterial({ color: color(0x2a2a33), roughness: 0.35, metalness: 0.7 }),
      radius: 2.5, speed: -0.25, tilt: -0.35, phase: 2.1,
    },
    {
      geometry: new THREE.IcosahedronGeometry(0.3, 1),
      material: new THREE.MeshPhysicalMaterial({ color: color(0x6aa8ff), roughness: 0.2, metalness: 0.1, clearcoat: 1, flatShading: true }),
      radius: 2.0, speed: 0.5, tilt: 1.1, phase: 4.2,
    },
  ].map((s) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = s.tilt;
    rig.add(pivot);
    return Object.assign(s, { mesh: addMesh(s.geometry, s.material, pivot) });
  });

  // Pointer parallax ----------------------------------------------------------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
  });
  hero.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
  });

  // Loop ----------------------------------------------------------------------
  const clock = new THREE.Clock();
  let elapsed = 0;
  let running = false;
  let frameId = 0;
  let inView = true;

  function update(dt) {
    elapsed += dt;
    const ease = Math.min(dt * 3, 1);
    pointer.x += (pointer.tx - pointer.x) * ease;
    pointer.y += (pointer.ty - pointer.y) * ease;

    knot.rotation.y = elapsed * 0.25;
    knot.rotation.x = Math.sin(elapsed * 0.3) * 0.25;
    rig.rotation.y = pointer.x * 0.35;
    rig.rotation.x = pointer.y * 0.2;

    satellites.forEach((s) => {
      const a = s.phase + elapsed * s.speed;
      s.mesh.position.set(Math.cos(a) * s.radius, 0, Math.sin(a) * s.radius);
      s.mesh.rotation.x = s.mesh.rotation.y = elapsed * 0.6;
    });
  }

  function renderFrame() {
    renderer.render(scene, camera);
    canvas.classList.add('is-ready');
  }

  function tick() {
    update(Math.min(clock.getDelta(), 0.05));
    renderFrame();
    frameId = requestAnimationFrame(tick);
  }

  function setRunning(next) {
    if (next === running) return;
    running = next;
    if (running) {
      clock.getDelta();
      frameId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frameId);
    }
  }

  const sync = () => setRunning(inView && !document.hidden && !motion.matches);

  // Keep the sculpture clear of the headline: right of centre on wide screens,
  // above the text on narrow ones.
  function layout() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const aspect = camera.aspect;
    if (aspect > 1.1) {
      rig.position.set(1.6 * Math.min(aspect, 1.9), 0.15, 0);
      rig.scale.setScalar(0.82);
    } else {
      rig.position.set(0, aspect < 0.8 ? 1.2 : 0.9, 0);
      rig.scale.setScalar(aspect < 0.8 ? 0.5 : 0.7);
    }
    renderFrame();
  }

  function setMode(mode) {
    meshes.forEach((m) => { m.material = m.userData.materials[mode]; });
    if (shading) {
      shading.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    }
    renderFrame();
  }

  if (shading) {
    shading.addEventListener('click', (e) => {
      const button = e.target.closest('[data-mode]');
      if (button) setMode(button.dataset.mode);
    });
  }

  update(0);
  layout();
  new ResizeObserver(layout).observe(stage);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  sync();

  function useVideo(config) {
    const video = document.createElement('video');
    video.className = 'hero-video';
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = !motion.matches;
    video.setAttribute('muted', '');
    video.setAttribute('aria-hidden', 'true');
    if (config.poster) video.poster = config.poster;
    video.src = config.video;
    video.addEventListener('loadeddata', () => video.classList.add('is-ready'), { once: true });
    stage.replaceChildren(video);
    root.classList.add('has-hero-video');
  }
})();
