/* Interactive turntable: a stand-in model on a rotating plate, used on character
   and product pages until a turntable video is added. Drag or use the arrow keys
   to rotate; Render / Clay / Wire switches shading like a 3D viewport. */
(function () {
  'use strict';

  window.mountTurntable = function mountTurntable(container, project) {
    const THREE = window.THREE;
    const canvas = container.querySelector('canvas');
    if (!THREE || !canvas || !window.createStudioEnvironment) return false;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (err) {
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const color = (hex) => window.srgbColor(THREE, hex);
    const c1 = color(project.art.colors[0]);
    const scene = new THREE.Scene();
    scene.environment = window.createStudioEnvironment(THREE, renderer);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 5, 4);
    scene.add(key);

    const materials = {
      render: new THREE.MeshPhysicalMaterial({ color: c1, roughness: 0.35, metalness: 0.05, clearcoat: 0.6 }),
      clay: new THREE.MeshStandardMaterial({ color: color(0xbab4ab), roughness: 0.85, metalness: 0 }),
      wire: new THREE.MeshBasicMaterial({ color: c1, wireframe: true, toneMapped: false }),
    };

    const turntable = new THREE.Group();
    scene.add(turntable);
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.7, 0.08, 96),
      new THREE.MeshStandardMaterial({ color: color(0x1c1c24), roughness: 0.55, metalness: 0.3 })
    );
    plate.position.y = -0.04;
    turntable.add(plate);

    const model = buildModel(THREE, project.art.shape, materials.render);
    turntable.add(model);

    // Frame the model: look at its middle from slightly above.
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const height = Math.max(size.y, 1.6);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const distance = Math.max(height, size.x, size.z) * 2.4 + 2.2;
    camera.position.set(0, height * 0.75 + 0.6, distance);
    camera.lookAt(0, height * 0.45, 0);

    // Rotation: auto-spin, paused while dragging and briefly after.
    let angle = 0.6;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let resumeAt = 0;
    let running = false;
    let inView = false;
    let frameId = 0;
    let last = 0;

    canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      container.classList.add('is-dragging');
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      angle += dx * 0.012;
      velocity = dx * 0.012;
      draw();
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      resumeAt = performance.now() + 1500;
      container.classList.remove('is-dragging');
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    container.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      angle += e.key === 'ArrowLeft' ? -0.2 : 0.2;
      resumeAt = performance.now() + 1500;
      draw();
    });

    container.querySelectorAll('[data-tt-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.ttMode;
        model.traverse((o) => { if (o.isMesh) o.material = materials[mode]; });
        container.querySelectorAll('[data-tt-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        draw();
      });
    });

    function draw() {
      turntable.rotation.y = angle;
      renderer.render(scene, camera);
    }

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragging) {
        if (now > resumeAt && !motion.matches) angle += dt * 0.5;
        angle += velocity;
        velocity *= 0.9; // coast after a flick
      }
      draw();
      frameId = requestAnimationFrame(tick);
    }

    const sync = () => {
      const next = inView && !document.hidden;
      if (next === running) return;
      running = next;
      if (running) {
        last = performance.now();
        frameId = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(frameId);
      }
    };

    function layout() {
      const w = container.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      draw();
    }

    layout();
    new ResizeObserver(layout).observe(canvas);
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }).observe(container);
    document.addEventListener('visibilitychange', sync);
    return true;
  };

  // Simple stand-in geometry matching the placeholder art's shape; sits on y = 0.
  function buildModel(THREE, shape, material) {
    const group = new THREE.Group();
    const add = (geometry, x, y, z) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      group.add(mesh);
      return mesh;
    };

    switch (shape) {
      case 'cube':
        add(new THREE.BoxGeometry(1.4, 1.4, 1.4, 4, 4, 4), 0, 0.7, 0);
        break;
      case 'ring':
        add(new THREE.TorusGeometry(0.85, 0.3, 32, 96), 0, 1.25, 0).rotation.x = Math.PI / 2.6;
        break;
      case 'pillar':
        add(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 48, 6), 0, 1.3, 0);
        add(new THREE.SphereGeometry(0.5, 48, 24), 0, 2.1, 0);
        add(new THREE.SphereGeometry(0.5, 48, 24), 0, 0.5, 0);
        break;
      case 'pyramid':
        add(new THREE.ConeGeometry(1, 1.8, 4, 4), 0, 0.9, 0);
        break;
      case 'cluster':
        add(new THREE.SphereGeometry(0.7, 48, 24), -0.35, 0.7, 0);
        add(new THREE.SphereGeometry(0.5, 48, 24), 0.6, 1.45, 0.2);
        add(new THREE.SphereGeometry(0.32, 48, 24), 0.6, 0.32, 0.55);
        break;
      default:
        add(new THREE.SphereGeometry(0.9, 64, 32), 0, 0.9, 0);
    }
    return group;
  }
})();
