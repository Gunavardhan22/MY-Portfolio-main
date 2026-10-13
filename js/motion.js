/*
   Scroll animations (GSAP + ScrollTrigger, vendored in assets/vendor/).

   - Everything is visible without JavaScript; animations only start from hidden.
   - Animations are scrubbed or reversible, so scrolling up plays them backwards.
   - Nothing hijacks or smooths the native scroll.
   - Reduced motion: no animations at all. No GSAP: a light fade-in fallback.
*/
(() => {
    'use strict';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) {
        fallbackReveal();
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const animated = [];

    // 1. Hero entrance on load.
    animated.push(gsap.from('.hero-anim', {
        opacity: 0,
        y: 28,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.1,
        clearProps: 'opacity,transform',
    }));

    // 2. As you scroll, the hero copy recedes backward into depth.
    animated.push(gsap.to('#hero-inner', {
        opacity: 0,
        z: -320,
        y: -60,
        rotationX: 8,
        transformPerspective: 1000,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 15%', scrub: 0.6 },
    }));
    animated.push(gsap.to('.scroll-cue', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: '25% top', scrub: true },
    }));

    // 3. Section headings and panels rise forward out of depth.
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
        animated.push(gsap.from(el, {
            opacity: 0,
            y: 70,
            z: -140,
            rotationX: 10,
            transformPerspective: 1100,
            transformOrigin: '50% 100%',
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        }));
    });

    // 4. Skills float in as cards, 5. projects swing in with perspective, 6. journey steps.
    batch('.skill-item', { y: 80, z: -200, rotationX: 14 }, 0.1);
    batch('.project-item', { y: 90, z: -220, rotationY: (i) => (i % 2 ? 12 : -12) }, 0.08);
    batch('.timeline > li', { y: 60, z: -120 }, 0.12);

    // 7. Contact: a slow cinematic close.
    animated.push(gsap.from('.contact-panel', {
        opacity: 0,
        scale: 0.92,
        y: 60,
        transformPerspective: 1200,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#contact', start: 'top 80%', toggleActions: 'play none none reverse' },
    }));

    function batch(selector, from, stagger) {
        const items = gsap.utils.toArray(selector);
        if (!items.length) return;
        gsap.set(items, { opacity: 0, transformPerspective: 1200, ...from });
        const shown = { opacity: 1, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0 };
        ScrollTrigger.batch(items, {
            start: 'top 92%',
            onEnter: (group) => gsap.to(group, { ...shown, duration: 1, ease: 'power3.out', stagger, overwrite: true }),
            onLeaveBack: (group) => gsap.to(group, { opacity: 0, ...from, duration: 0.6, ease: 'power2.in', stagger: 0.04, overwrite: true }),
        });
    }

    // Measure again once fonts and the background image have loaded.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

    // Turning on reduced motion mid-visit stops everything and shows all content.
    reduceMotion.addEventListener('change', (e) => {
        if (!e.matches) return;
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        animated.forEach((tween) => tween.kill());
        gsap.set('[data-reveal], .skill-item, .project-item, .timeline > li, .contact-panel, #hero-inner, .hero-anim, .scroll-cue', {
            clearProps: 'all',
        });
    });

    // Without GSAP: a simple fade-up per element, once.
    function fallbackReveal() {
        if (!('IntersectionObserver' in window)) return;
        const els = Array.from(document.querySelectorAll('[data-reveal], .skill-item, .project-item, .timeline > li'));
        const fold = window.innerHeight;
        els.forEach((el) => { if (el.getBoundingClientRect().top < fold) el.classList.add('is-visible'); });
        root.classList.add('reveal-fallback');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        els.forEach((el) => { if (!el.classList.contains('is-visible')) observer.observe(el); });
    }
})();
