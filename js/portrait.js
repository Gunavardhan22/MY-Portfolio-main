/*
   Living portrait: a 2.5D animated version of assets/portrait/poster.jpg.

   One full-screen WebGL quad composites prepared layers (see tools/build_layers.py):
     sky.webp        the background with the character removed (revealed by parallax)
     character.webp  the character with a clean alpha matte
     maps.png        R = depth, G = hair sway weight (zero over the face), B = eye glow

   Layers, back to front: sky → drifting clouds → body → head, hair and hand → eye glow.
   (Particles are the separate js/scene.js canvas on top.)

   10-second loop, seamless because every effect is a periodic function of the phase:
     0–25%  clouds drift, cool rim light rises on the hair edges
     25–55% the eyes slowly brighten, then ease back
     45–85% stronger breeze in the hair, gentle breathing in the clothing
     85–100% idle, back into the start
   Pointer parallax is heavily eased; scrolling pushes the camera in (GSAP scrub).

   Falls back to the static image (html.portrait-static) without WebGL, and renders a
   single still frame when paused or with reduced motion.
*/
(() => {
    'use strict';

    const canvas = document.getElementById('portrait-canvas');
    const still = document.getElementById('bg-image');
    if (!canvas) return;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lite = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;

    const IMAGE = { w: 860, h: 852 };
    const FACE = [0.49, 0.42];          // image-space point the framing and the push centre on
    const LOOP = 10;                    // seconds
    const state = window.backdropState || { playing: !reduceMotion.matches, particles: true };

    // ------------------------------------------------------------------ framing
    // Where the face sits on screen: left of the hero copy on wide screens, high up on
    // portrait screens so the text below never covers it.
    function framing(width, height) {
        const ca = width / height;
        const ia = IMAGE.w / IMAGE.h;
        let sx = ca > ia ? 1 : ca / ia;
        let sy = ca > ia ? ia / ca : 1;
        const f = ca > 1.15 ? { zoom: 1.12, at: [0.38, 0.5] }
            : ca > 0.8 ? { zoom: 1.14, at: [0.5, 0.34] }
                : { zoom: 1.2, at: [0.5, 0.3] };
        sx /= f.zoom;
        sy /= f.zoom;
        const fit = (want, span) => {
            const margin = Math.min(0.02, (1 - span) / 2);
            return Math.min(Math.max(want, margin), 1 - span - margin);
        };
        return { sx, sy, ox: fit(FACE[0] - f.at[0] * sx, sx), oy: fit(FACE[1] - f.at[1] * sy, sy) };
    }

    // The static image under the canvas uses the same framing, so the cross-fade doesn't jump.
    function frameStill() {
        if (!still) return;
        const r = still.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const f = framing(r.width, r.height);
        still.style.backgroundSize = `${(100 / f.sx).toFixed(2)}% ${(100 / f.sy).toFixed(2)}%`;
        const pos = (o, span) => (span >= 1 ? 50 : (o / (1 - span)) * 100);
        still.style.backgroundPosition = `${pos(f.ox, f.sx).toFixed(2)}% ${pos(f.oy, f.sy).toFixed(2)}%`;
    }
    frameStill();
    window.addEventListener('resize', frameStill);

    // ------------------------------------------------------------------ WebGL setup
    const fail = () => {
        root.classList.remove('portrait-ready');
        root.classList.add('portrait-static');
    };

    let gl = null;
    try {
        gl = canvas.getContext('webgl', {
            alpha: false, antialias: false, depth: false, stencil: false,
            premultipliedAlpha: false, powerPreference: lite ? 'low-power' : 'default',
        });
    } catch (err) {
        gl = null;
    }
    if (!gl) return fail();

    const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
    vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); // y down, like the image
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

    const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define LOOP ${LOOP.toFixed(1)}
#define OCTAVES ${lite ? 3 : 5}
#define TAU 6.2831853

varying vec2 vUv;
uniform sampler2D uSky;
uniform sampler2D uChar;
uniform sampler2D uMaps;
uniform vec2 uScale;
uniform vec2 uOffset;
uniform vec2 uFocus;
uniform vec2 uPointer;
uniform float uTime;
uniform float uPush;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
}
vec2 zoomAt(vec2 uv, vec2 c, float z) { return c + (uv - c) / z; }
// Smooth periodic envelope peaking at phase c; higher k = narrower peak.
float envelope(float phase, float c, float k) { return pow(0.5 + 0.5 * cos(TAU * (phase - c)), k); }

void main() {
    vec2 base = vUv * uScale + uOffset;
    float phase = fract(uTime / LOOP);
    float w = TAU / LOOP; // frequencies are multiples of w, so motion repeats exactly every loop

    // 1. Sky (farthest).
    vec2 skyUv = zoomAt(base, uFocus, 1.0 + uPush * 0.04) + uPointer * 0.004;
    vec3 col = texture2D(uSky, skyUv).rgb;

    // 2. Clouds: a drifting veil with its own, slightly nearer parallax.
    vec2 cloudUv = (zoomAt(base, uFocus, 1.0 + uPush * 0.07) + uPointer * 0.007) * vec2(2.2, 3.2)
                 + vec2(uTime * 0.012, uTime * 0.002);
    float cloud = fbm(cloudUv);
    col = mix(col, vec3(0.80, 0.88, 0.98), smoothstep(0.5, 0.85, cloud) * 0.26);
    col *= 0.93 + 0.07 * fbm(cloudUv * 0.45 + 3.0);

    // 3–4. Character: depth-based parallax (head and hand move most).
    vec2 cBase = zoomAt(base, uFocus, 1.0 + uPush * 0.13);
    float depth = texture2D(uMaps, cBase).r;
    vec2 uv = cBase + uPointer * (0.004 + depth * 0.012);
    vec3 maps = texture2D(uMaps, uv).rgb;

    // Hair breeze: only where the sway map allows (tips), never over the face.
    float breeze = 0.45 + 0.55 * envelope(phase, 0.62, 1.5);
    uv.x += maps.g * breeze * (0.0026 * sin(uTime * w * 3.0 + uv.y * 22.0) + 0.0016 * sin(uTime * w * 2.0 + uv.y * 8.0));
    uv.y += maps.g * breeze * 0.0012 * sin(uTime * w * 2.0 + uv.x * 16.0);

    // Clothing: a slow breath (two per loop), lower body only.
    float body = smoothstep(0.58, 0.85, uv.y) * (1.0 - maps.g);
    uv.y += body * 0.0011 * sin(TAU * 2.0 * phase);

    vec4 ch = texture2D(uChar, uv);

    // Cool rim light on the upper-right edges of the head and hair.
    float outside = texture2D(uChar, uv + vec2(0.006, -0.008)).a;
    float rim = ch.a * (1.0 - outside) * smoothstep(0.8, 0.88, depth);
    float rimLight = 0.25 + 0.75 * envelope(phase, 0.12, 3.0);
    vec3 charCol = ch.rgb + vec3(0.55, 0.78, 1.0) * rim * rimLight * 0.45;

    // 5. Eyes: a restrained glow that rises and eases back.
    float eyes = envelope(phase, 0.42, 2.0);
    charCol += vec3(0.5, 0.8, 1.0) * maps.b * (0.12 + 0.5 * eyes) * 0.8;

    col = mix(col, charCol, ch.a);
    col += vec3(0.35, 0.65, 1.0) * maps.b * maps.b * eyes * 0.22; // soft halo past the lashes

    // Grade: cooler, with blacks lifted toward navy and brightness held back for the UI.
    col = mix(vec3(0.03, 0.05, 0.12), col, 0.86);
    col *= vec3(0.93, 0.98, 1.06);
    gl_FragColor = vec4(col, 1.0);
}`;

    function compile(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn('[portrait] shader failed to compile');
            return null;
        }
        return shader;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return fail();
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fail();
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    ['uSky', 'uChar', 'uMaps', 'uScale', 'uOffset', 'uFocus', 'uPointer', 'uTime', 'uPush']
        .forEach((name) => { u[name] = gl.getUniformLocation(program, name); });

    const textures = [];
    function texture(img, unit, uniform) {
        const tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        // Non-power-of-two images: clamp and no mipmaps.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.uniform1i(uniform, unit);
        textures.push(tex);
    }

    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

    // ------------------------------------------------------------------ animation state
    let time = (state.playing ? 0 : 0.42) * LOOP; // paused frames show the eyes lit
    let push = 0;
    let pushTarget = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = 0;
    let last = 0;
    let lastDraw = 0;
    let ready = false;
    let destroyed = false;

    function resize() {
        const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
        // Cap the pixel count: the effect is soft, so extra pixels only cost battery.
        const maxPixels = lite ? 1.2e6 : 2.6e6;
        const scale = Math.min(dpr, Math.sqrt(maxPixels / Math.max(1, window.innerWidth * window.innerHeight)));
        const w = Math.max(1, Math.round(window.innerWidth * scale));
        const h = Math.max(1, Math.round(window.innerHeight * scale));
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
        gl.viewport(0, 0, w, h);
        const f = framing(window.innerWidth, window.innerHeight);
        gl.uniform2f(u.uScale, f.sx, f.sy);
        gl.uniform2f(u.uOffset, f.ox, f.oy);
        gl.uniform2f(u.uFocus, FACE[0], FACE[1]);
    }

    function draw() {
        gl.uniform1f(u.uTime, time);
        gl.uniform1f(u.uPush, push);
        gl.uniform2f(u.uPointer, pointerX, pointerY);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Keeps running while playing, or while the pointer/scroll easing is still settling.
    function tick(now) {
        rafId = 0;
        if (destroyed || document.hidden) return;
        const dt = Math.min((now - last) / 1000 || 0, 0.05);
        last = now;

        if (state.playing) time += dt;
        const ease = 1 - Math.pow(0.0005, dt); // heavy, frame-rate independent smoothing
        pointerX += (targetX - pointerX) * ease * 0.6;
        pointerY += (targetY - pointerY) * ease * 0.6;
        if (!hasGsap) push += (pushTarget - push) * ease;

        const settling = Math.abs(targetX - pointerX) > 0.0005 || Math.abs(targetY - pointerY) > 0.0005
            || (!hasGsap && Math.abs(pushTarget - push) > 0.0005);

        // Phones and tablets: about 30 fps is plenty for slow motion.
        if (!lite || now - lastDraw >= 32) {
            draw();
            lastDraw = now;
        }
        if (state.playing || settling) request();
    }

    function request() {
        if (!rafId && ready && !destroyed) {
            if (!last) last = performance.now();
            rafId = window.requestAnimationFrame(tick);
        }
    }

    // ------------------------------------------------------------------ input
    const allowParallax = () => !reduceMotion.matches;

    if (window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('pointermove', (e) => {
            if (!allowParallax()) return;
            targetX = (e.clientX / window.innerWidth) * 2 - 1;
            targetY = (e.clientY / window.innerHeight) * 2 - 1;
            request();
        }, { passive: true });
        document.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; request(); });
    }

    // Scroll push: GSAP ScrollTrigger scrub (smooth and reversible), or a simple fallback.
    const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
    let pushTween = null;
    function setupScroll() {
        if (pushTween) { pushTween.scrollTrigger && pushTween.scrollTrigger.kill(); pushTween.kill(); pushTween = null; }
        if (!allowParallax()) { push = 0; pushTarget = 0; return; }
        const proxy = { value: push };
        if (hasGsap) {
            window.gsap.registerPlugin(window.ScrollTrigger);
            pushTween = window.gsap.to(proxy, {
                value: 1,
                ease: 'none',
                scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
                onUpdate: () => { push = proxy.value; request(); },
            });
        }
    }
    function onScroll() {
        if (hasGsap || !allowParallax()) return;
        const hero = document.getElementById('hero');
        const h = hero ? hero.offsetHeight : window.innerHeight;
        pushTarget = Math.min(1, Math.max(0, window.scrollY / Math.max(1, h)));
        request();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('resize', () => { if (ready) { resize(); draw(); } });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = 0; request(); } });
    window.addEventListener('backdrop:change', () => { last = 0; draw(); request(); });
    reduceMotion.addEventListener('change', () => {
        if (reduceMotion.matches) { targetX = 0; targetY = 0; pointerX = 0; pointerY = 0; }
        setupScroll();
        if (ready) draw();
    });

    // ------------------------------------------------------------------ lifecycle
    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        ready = false;
        fail();
    });

    // Release the GPU when the page is really unloaded (not when it goes into the back/forward cache).
    window.addEventListener('pagehide', (e) => {
        if (e.persisted) return;
        destroyed = true;
        window.cancelAnimationFrame(rafId);
        if (pushTween) pushTween.kill();
        textures.forEach((t) => gl.deleteTexture(t));
        gl.deleteBuffer(quad);
        gl.deleteProgram(program);
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
    });

    Promise.all([
        loadImage('assets/portrait/sky.webp'),
        loadImage('assets/portrait/character.webp'),
        loadImage('assets/portrait/maps.png'),
    ]).then(([sky, character, maps]) => {
        if (destroyed) return;
        texture(sky, 0, u.uSky);
        texture(character, 1, u.uChar);
        texture(maps, 2, u.uMaps);
        resize();
        setupScroll();
        onScroll();
        push = pushTarget;
        draw();
        ready = true;
        // Fade in only once the first frame exists.
        window.requestAnimationFrame(() => root.classList.add('portrait-ready'));
        request();
    }).catch(fail);
})();
