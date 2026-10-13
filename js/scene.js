/*
   WebGL depth layer: drifting moonlit particles and floating glass panels that the
   camera glides past as you scroll the page.

   - three.js (assets/vendor/three.min.js) loads only after the page is interactive.
   - Panels stay to the sides so they never sit behind the reading column.
   - Pauses when the tab is hidden; with reduced motion it renders still frames on scroll.
   - No WebGL, or three.js fails to load: html.no-webgl turns on the CSS dust instead.
*/
(() => {
    'use strict';

    const canvas = document.getElementById('scene-canvas');
    if (!canvas) return;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fallback = () => root.classList.add('no-webgl');

    const supportsWebGL = () => {
        try {
            const probe = document.createElement('canvas');
            return Boolean(window.WebGLRenderingContext && (probe.getContext('webgl') || probe.getContext('experimental-webgl')));
        } catch (err) {
            return false;
        }
    };
    if (!supportsWebGL()) {
        fallback();
        return;
    }

    const load = () => {
        const script = document.createElement('script');
        script.src = 'assets/vendor/three.min.js';
        script.async = true;
        script.onload = () => {
            try {
                init(window.THREE);
            } catch (err) {
                fallback();
            }
        };
        script.onerror = fallback;
        document.head.append(script);
    };
    const whenIdle = (fn) => ('requestIdleCallback' in window
        ? window.requestIdleCallback(fn, { timeout: 2000 })
        : window.setTimeout(fn, 600));

    if (document.readyState === 'complete') whenIdle(load);
    else window.addEventListener('load', () => whenIdle(load), { once: true });

    function init(THREE) {
        const DEPTH = 60; // distance the camera travels from the top of the page to the bottom
        const narrow = window.innerWidth < 700;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x070a16, 0.04);
        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);

        // Particles -------------------------------------------------------------
        const sprite = makeSprite(THREE);
        const dust = makePoints(THREE, {
            count: narrow ? 260 : 650, spreadX: 26, spreadY: 16, depth: DEPTH,
            size: 0.1, color: 0xd6dcff, opacity: 0.85, sprite,
        });
        const bokeh = makePoints(THREE, {
            count: narrow ? 18 : 40, spreadX: 30, spreadY: 18, depth: DEPTH,
            size: 0.5, color: 0xa493ff, opacity: 0.22, sprite,
        });
        scene.add(dust, bokeh);

        // Glass panels -----------------------------------------------------------
        const panelGeometry = new THREE.ShapeGeometry(roundedRect(THREE, 2.4, 1.5, 0.18), 6);
        const edgeGeometry = new THREE.EdgesGeometry(panelGeometry);
        const panelMaterial = new THREE.MeshBasicMaterial({
            color: 0x9fb0ff, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide,
        });
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xd6dcff, transparent: true, opacity: 0.16 });

        const panels = [];
        const PANEL_COUNT = 12;
        for (let i = 0; i < PANEL_COUNT; i++) {
            const side = i % 2 ? 1 : -1;
            const group = new THREE.Group();
            group.add(new THREE.Mesh(panelGeometry, panelMaterial));
            group.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));
            const scale = 0.9 + Math.random() * 1.3;
            group.scale.set(scale, scale, scale);
            const panel = {
                group,
                baseX: side * (4.6 + Math.random() * 3.5),
                baseY: (Math.random() - 0.5) * 7,
                baseRotY: -side * (0.45 + Math.random() * 0.35),
                phase: Math.random() * Math.PI * 2,
            };
            group.position.z = -3 - i * (DEPTH / PANEL_COUNT) - Math.random() * 2;
            group.rotation.z = (Math.random() - 0.5) * 0.2;
            panels.push(panel);
            scene.add(group);
        }

        // Input -----------------------------------------------------------------
        let scrollTarget = 0;
        let scrollNow = 0;
        let pointerX = 0;
        let pointerY = 0;
        let targetX = 0;
        let targetY = 0;

        const readScroll = () => {
            const max = Math.max(1, root.scrollHeight - window.innerHeight);
            scrollTarget = Math.min(1, Math.max(0, window.scrollY / max));
        };

        const layout = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            // Narrow screens see less width, so bring the panels in.
            const squeeze = Math.min(1, Math.max(0.5, camera.aspect));
            panels.forEach((p) => { p.group.position.x = p.baseX * squeeze; });
        };

        // Frame -----------------------------------------------------------------
        const clock = new THREE.Clock();
        let elapsed = 0;

        function draw(dt) {
            const still = reduceMotion.matches;
            const ease = still ? 1 : Math.min(1, dt * 4);
            scrollNow += (scrollTarget - scrollNow) * ease;
            pointerX += (targetX - pointerX) * Math.min(1, dt * 2.5);
            pointerY += (targetY - pointerY) * Math.min(1, dt * 2.5);
            if (!still) elapsed += dt;

            camera.position.set(pointerX * 0.6, -pointerY * 0.4 - scrollNow * 2, 5 - scrollNow * DEPTH);
            camera.rotation.set(pointerY * 0.03, -pointerX * 0.05, 0);

            dust.rotation.z = elapsed * 0.012;
            dust.position.y = Math.sin(elapsed * 0.15) * 0.3;
            bokeh.rotation.z = -elapsed * 0.008;
            panels.forEach((p) => {
                p.group.position.y = p.baseY + Math.sin(elapsed * 0.4 + p.phase) * 0.25;
                p.group.rotation.y = p.baseRotY + Math.sin(elapsed * 0.2 + p.phase) * 0.08;
            });

            renderer.render(scene, camera);
        }

        // Continuous drift while visible; still frames on demand with reduced motion.
        let running = false;
        let frameId = 0;
        const tick = () => {
            draw(Math.min(clock.getDelta(), 0.05));
            frameId = window.requestAnimationFrame(tick);
        };
        const sync = () => {
            const shouldRun = !document.hidden && !reduceMotion.matches;
            if (shouldRun === running) return;
            running = shouldRun;
            if (running) {
                clock.getDelta();
                frameId = window.requestAnimationFrame(tick);
            } else {
                window.cancelAnimationFrame(frameId);
            }
        };
        const drawStill = () => { if (!running) draw(0); };

        window.addEventListener('scroll', () => { readScroll(); drawStill(); }, { passive: true });
        window.addEventListener('resize', () => { layout(); readScroll(); drawStill(); });
        if (window.matchMedia('(pointer: fine)').matches) {
            window.addEventListener('pointermove', (e) => {
                targetX = (e.clientX / window.innerWidth) * 2 - 1;
                targetY = (e.clientY / window.innerHeight) * 2 - 1;
            }, { passive: true });
        }
        document.addEventListener('visibilitychange', sync);
        reduceMotion.addEventListener('change', () => { sync(); drawStill(); });

        layout();
        readScroll();
        scrollNow = scrollTarget;
        draw(0);
        canvas.classList.add('is-ready');
        sync();
    }

    function makePoints(THREE, { count, spreadX, spreadY, depth, size, color, opacity, sprite }) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spreadX;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
            positions[i * 3 + 2] = 6 - Math.random() * (depth + 12);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            size, color, opacity, map: sprite,
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
        });
        return new THREE.Points(geometry, material);
    }

    function makeSprite(THREE) {
        const size = 64;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(c);
    }

    function roundedRect(THREE, w, h, r) {
        const x = -w / 2;
        const y = -h / 2;
        const s = new THREE.Shape();
        s.moveTo(x + r, y);
        s.lineTo(x + w - r, y);
        s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + h - r);
        s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        s.lineTo(x + r, y + h);
        s.quadraticCurveTo(x, y + h, x, y + h - r);
        s.lineTo(x, y + r);
        s.quadraticCurveTo(x, y, x + r, y);
        return s;
    }
})();
