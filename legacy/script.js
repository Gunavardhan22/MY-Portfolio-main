/* 
   Gunavardhan Tigulla - Portfolio Logic
   Animations, Typing Effect, and Navigation
*/

document.addEventListener('DOMContentLoaded', () => {
    // 0. Particles Background
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#3b82f6" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.2, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#3b82f6", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }

    // 1. Typing Animation
    if (document.querySelector('.typing')) {
        new Typed('.typing', {
            strings: [
                'Full-Stack Developer',
                'AI/ML Enthusiast',
                'Problem Solver',
                'Tech Innovator'
            ],
            typeSpeed: 100,
            backSpeed: 60,
            loop: true
        });
    }

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.querySelector('i').classList.toggle('fa-bars');
            navToggle.querySelector('i').classList.toggle('fa-times');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.querySelector('i').classList.add('fa-bars');
                navToggle.querySelector('i').classList.remove('fa-times');
            });
        });
    }

    // 4. Scroll Reveal Animations
    const sr = ScrollReveal({
        origin: 'top',
        distance: '80px',
        duration: 2000,
        reset: false
    });

    // Hero Reveal
    sr.reveal('.hero-subtitle', {});
    sr.reveal('.hero-title', { delay: 200 });
    sr.reveal('.hero-typing', { delay: 400 });
    sr.reveal('.hero-description', { delay: 600 });
    sr.reveal('.hero-btns', { delay: 800 });
    sr.reveal('.hero-img', { delay: 400, origin: 'right' });

    // About Reveal
    sr.reveal('.section-title', { interval: 200 });
    sr.reveal('.about-text', { origin: 'left' });
    sr.reveal('.about-grid', { origin: 'right' });

    // Skills Reveal
    sr.reveal('.skill-card', { interval: 200 });

    // Projects Reveal
    sr.reveal('.project-card', { interval: 200 });

    // Experience Reveal
    sr.reveal('.timeline-item', { interval: 200, origin: 'bottom' });

    // Contact Reveal
    sr.reveal('.contact-info', { origin: 'left' });
    sr.reveal('.contact-form', { origin: 'right' });

    // 5. Smooth Scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. Form Submission (Actual & Mockup)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            const name = contactForm.querySelector('input[placeholder="Name"]').value;
            const email = contactForm.querySelector('input[placeholder="Email"]').value;
            const message = contactForm.querySelector('textarea').value;

            btn.innerText = 'Sending...';
            btn.disabled = true;

            try {
                // Try to send to the local Flask backend
                const response = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (response.ok) {
                    btn.innerText = 'Message Sent!';
                    btn.style.backgroundColor = '#10b981'; // Success Green
                    contactForm.reset();
                } else {
                    throw new Error('Server returned an error');
                }
            } catch (error) {
                // Fallback / Mockup success if server isn't running
                console.warn('Backend not reached, using mock success.', error);

                setTimeout(() => {
                    btn.innerText = 'Message Sent! (Mock)';
                    btn.style.backgroundColor = '#10b981';
                    contactForm.reset();
                }, 1000);
            } finally {
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }
});
