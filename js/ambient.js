/*
   Background parallax and veil depth.

   Moves the fixed background a few pixels with the pointer and the scroll position,
   and deepens the navy veil once the visitor leaves the hero so the text stays
   readable. Only CSS custom properties change: no layout work, at most one frame
   per change, and nothing at all with reduced motion.
*/
(() => {
    'use strict';

    const root = document.documentElement;
    const image = document.getElementById('bg-image');
    const veil = document.getElementById('bg-veil');
    if (!image || !veil) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;

    const request = () => {
        if (!frame) frame = window.requestAnimationFrame(render);
    };

    function render() {
        frame = 0;
        const viewport = window.innerHeight;

        // 0 on the hero, 1 once the hero has scrolled away.
        const depth = Math.min(1, Math.max(0, window.scrollY / (viewport * 0.9)));
        veil.style.setProperty('--veil', depth.toFixed(3));

        if (reduceMotion.matches) {
            image.style.setProperty('--bg-x', '0px');
            image.style.setProperty('--bg-y', '0px');
            return;
        }

        pointerX += (targetX - pointerX) * 0.08;
        pointerY += (targetY - pointerY) * 0.08;

        const maxScroll = Math.max(1, root.scrollHeight - viewport);
        const drift = (window.scrollY / maxScroll) * -24; // up to 24px over the whole page

        image.style.setProperty('--bg-x', `${(pointerX * -14).toFixed(2)}px`);
        image.style.setProperty('--bg-y', `${(pointerY * -10 + drift).toFixed(2)}px`);

        // Keep easing toward the pointer until it settles.
        if (Math.abs(targetX - pointerX) > 0.002 || Math.abs(targetY - pointerY) > 0.002) request();
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    reduceMotion.addEventListener('change', request);

    if (finePointer.matches) {
        window.addEventListener('pointermove', (e) => {
            targetX = (e.clientX / window.innerWidth) * 2 - 1;
            targetY = (e.clientY / window.innerHeight) * 2 - 1;
            request();
        }, { passive: true });
    }

    render();
})();
