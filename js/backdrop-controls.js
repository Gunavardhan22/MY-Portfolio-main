/*
   Background controls (bottom-left): play/pause the animated backdrop and show/hide
   the particles. The choice is remembered on this device.

   State lives on window.backdropState; js/portrait.js and js/scene.js listen for the
   "backdrop:change" event. CSS reads html.motion-paused and html.particles-off.
   Reduced motion starts paused (a still frame); the visitor can still press Play.
*/
(() => {
    'use strict';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionBtn = document.getElementById('motion-toggle');
    const particlesBtn = document.getElementById('particles-toggle');

    const read = (key) => {
        try { return window.localStorage.getItem(key); } catch (err) { return null; }
    };
    const write = (key, value) => {
        try { window.localStorage.setItem(key, value); } catch (err) { /* private mode: not remembered */ }
    };

    const state = {
        playing: !reduceMotion.matches && read('backdrop-playing') !== 'false',
        particles: read('backdrop-particles') !== 'false',
    };
    window.backdropState = state;

    const setTip = (button, text) => {
        const tip = button && button.querySelector('.ctrl-tip');
        if (tip) tip.textContent = text;
    };

    function apply() {
        root.classList.toggle('motion-paused', !state.playing);
        root.classList.toggle('particles-off', !state.particles);
        if (motionBtn) {
            motionBtn.setAttribute('aria-pressed', String(state.playing));
            setTip(motionBtn, state.playing ? 'Pause animation' : 'Play animation');
        }
        if (particlesBtn) {
            particlesBtn.setAttribute('aria-pressed', String(state.particles));
            setTip(particlesBtn, state.particles ? 'Hide particles' : 'Show particles');
        }
        window.dispatchEvent(new CustomEvent('backdrop:change', { detail: { ...state } }));
    }

    if (motionBtn) {
        motionBtn.addEventListener('click', () => {
            state.playing = !state.playing;
            write('backdrop-playing', String(state.playing));
            apply();
        });
    }
    if (particlesBtn) {
        particlesBtn.addEventListener('click', () => {
            state.particles = !state.particles;
            write('backdrop-particles', String(state.particles));
            apply();
        });
    }

    // Turning on reduced motion mid-visit pauses everything (not saved as a preference).
    reduceMotion.addEventListener('change', (e) => {
        if (e.matches && state.playing) {
            state.playing = false;
            apply();
        }
    });

    apply();
})();
