/*
   Gunavardhan Tigulla — Portfolio
   Site interactions: mobile menu, smooth anchor scrolling, scroll progress,
   active navigation, back-to-top, copy-email, footer year.
   Scroll animations: js/motion.js. Background: js/ambient.js and js/scene.js.
   Voice introduction and "Ask About Me": js/voice-dock.js.
   No dependencies. Never put API keys or secrets in this file.
*/

(() => {
    'use strict';

    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ---------- 1. Mobile navigation ----------
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');

    const isMenuOpen = () => Boolean(toggle) && toggle.getAttribute('aria-expanded') === 'true';

    const setMenuOpen = (open) => {
        if (!toggle || !nav) return;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        nav.classList.toggle('is-open', open);
    };

    if (toggle && nav) {
        toggle.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

        // Close with Escape and return focus to the toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen()) {
                setMenuOpen(false);
                toggle.focus();
            }
        });

        // Close when clicking outside the open menu
        document.addEventListener('click', (e) => {
            if (isMenuOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setMenuOpen(false);
        });

        // Reset when the viewport grows past the menu breakpoint
        window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
            if (e.matches) setMenuOpen(false);
        });
    }

    // ---------- 2. Smooth anchor scrolling ----------
    // CSS scroll-margin-top keeps targets clear of the sticky header.
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

        const id = link.getAttribute('href').slice(1);
        const target = id && document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        setMenuOpen(false);

        target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });

        // Move keyboard focus to the section without a second jump
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });

        if (history.pushState) history.pushState(null, '', `#${id}`);
    });

    // ---------- 3. Scroll-driven UI: progress bar, back-to-top, active nav ----------
    // One passive scroll listener, batched with requestAnimationFrame. Section
    // offsets are measured only when the layout changes, not on every scroll.
    const progressBar = document.getElementById('scroll-progress');
    const toTop = document.getElementById('to-top');
    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const tracked = navLinks
        .map((link) => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) }))
        .filter((entry) => entry.section);

    let maxScroll = 1;
    let offsets = [];
    let activeIndex = -2;
    let toTopShown = null;
    let ticking = false;

    const measure = () => {
        maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
        offsets = tracked.map(({ section }) => section.getBoundingClientRect().top + window.scrollY);
    };

    const setActive = (index) => {
        if (index === activeIndex) return;
        activeIndex = index;
        tracked.forEach(({ link }, i) => {
            const on = i === index;
            link.classList.toggle('is-active', on);
            if (on) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };

    const update = () => {
        ticking = false;
        const y = window.scrollY;

        if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;

        if (toTop) {
            const show = y > 600;
            if (show !== toTopShown) {
                toTopShown = show;
                // visibility:hidden in CSS also removes it from the tab order
                toTop.classList.toggle('is-visible', show);
            }
        }

        // Active section: the last one whose top has passed a line 35% down the
        // viewport. It depends only on scroll position, so it can't flicker.
        // At the very bottom, the last section wins even if it is short.
        let index = -1;
        if (y >= maxScroll - 2) {
            index = tracked.length - 1;
        } else {
            const line = y + window.innerHeight * 0.35;
            for (let i = 0; i < offsets.length; i++) if (offsets[i] <= line) index = i;
        }
        setActive(index);
    };

    const requestUpdate = () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    };

    const remeasure = () => {
        measure();
        requestUpdate();
    };

    measure();
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', remeasure);
    if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);

    // ---------- 4. Copy email with a clear fallback ----------
    const copyBtn = document.getElementById('copy-email');
    const emailLink = document.getElementById('email-link');
    const copyStatus = document.getElementById('copy-status');

    if (copyBtn) {
        const email = copyBtn.dataset.email;
        const label = copyBtn.textContent;
        let resetTimer;

        const announce = (message, isError = false) => {
            if (!copyStatus) return;
            copyStatus.textContent = message;
            copyStatus.classList.toggle('is-error', isError);
        };

        const legacyCopy = () => {
            const field = document.createElement('textarea');
            field.value = email;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.opacity = '0';
            document.body.appendChild(field);
            field.select();
            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (err) {
                ok = false;
            }
            document.body.removeChild(field);
            return ok;
        };

        const selectEmailText = () => {
            if (!emailLink) return;
            const range = document.createRange();
            range.selectNodeContents(emailLink);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        };

        copyBtn.addEventListener('click', async () => {
            let copied = false;
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(email);
                    copied = true;
                } catch (err) {
                    copied = false;
                }
            }
            if (!copied) copied = legacyCopy();

            clearTimeout(resetTimer);
            if (copied) {
                copyBtn.textContent = 'Copied';
                announce(`Email address copied: ${email}`);
                resetTimer = setTimeout(() => { copyBtn.textContent = label; }, 2500);
            } else {
                selectEmailText();
                announce('Copying isn’t available here. The address is selected, so press Ctrl+C (or ⌘+C) to copy it.', true);
            }
        });
    }

    // ---------- 5. Current year in the footer ----------
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
