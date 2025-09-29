document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==============================
    // GLOBAL HELPERS
    // ==============================
    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => parent.querySelectorAll(sel);

    // requestAnimationFrame scroll handler
    let ticking = false;
    function onScrollThrottled(callback) {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                callback();
                ticking = false;
            });
            ticking = true;
        }
    }

    // ==============================
    // MODULE 1: NAVIGATION + SCROLLING
    // ==============================
    const menuToggle = $('.menu-toggle');
    const navLinks = $('.nav-links');
    const header = $('header');
    const scrollIndicator = $('.scroll-indicator');
    const sections = $$('section');
    const navLinksAll = $$('.nav-link');

    // Smooth scroll for internal links
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const targetElement = $(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // Close mobile nav
            if (document.body.classList.contains('menu-open') && menuToggle && navLinks) {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Mobile menu toggle (click + keyboard)
    if (menuToggle && navLinks) {
        const toggleMenu = () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        };
        menuToggle.addEventListener('click', toggleMenu);
        menuToggle.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }

    // Scroll effects + active link
    function onScrollHandler() {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
            scrollIndicator?.classList.add('hidden');
        } else {
            header?.classList.remove('scrolled');
            scrollIndicator?.classList.remove('hidden');
        }

        let current = '';
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            if (scrollY >= section.offsetTop - 150) {
                current = section.id;
            }
        });

        navLinksAll.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').includes(current));
        });
    }
    window.addEventListener('scroll', () => onScrollThrottled(onScrollHandler));
    onScrollHandler(); // initial

    // ==============================
    // MODULE 2: SCROLL ANIMATIONS
    // ==============================
    function animateOnScroll(selector) {
        $$(selector).forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -100px 0px' });

    [
        '.section', '.highlight-card', '.value-card', '.initiative',
        '.gallery-item', '.testimonial', '.policy-card', '.endorsement-card',
        '.timeline-item', '.cta-banner', '.news-item'
    ].forEach(sel => animateOnScroll(sel));

    // ==============================
    // MODULE 3: COUNTERS
    // ==============================
    function animateCounter(el) {
        if (prefersReducedMotion) {
            el.textContent = el.dataset.target + (el.dataset.unit || '');
            return;
        }
        const target = parseInt(el.dataset.target, 10);
        const unit = el.dataset.unit || '';
        const duration = 2000;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            el.textContent = Math.floor(percentage * target) + unit;
            if (percentage < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.8 });

    $$('.count').forEach(c => counterObserver.observe(c));

    // ==============================
    // MODULE 4: TYPEWRITER EFFECT
    // ==============================
    const sloganContainer = $('.slogan.typewriter');
    if (sloganContainer) {
        const slogans = Array.from(sloganContainer.querySelectorAll('span')).map(s => s.textContent.trim());
        sloganContainer.innerHTML = '';
        let currentSloganIndex = 0;

        const typeEffect = (text, el, cb) => {
            let i = 0;
            el.textContent = '';
            (function typing() {
                if (i < text.length) {
                    el.textContent += text[i++];
                    setTimeout(typing, 75);
                } else cb && setTimeout(cb, 1000);
            })();
        };

        const eraseEffect = (el, cb) => {
            let text = el.textContent;
            (function erasing() {
                if (text.length > 0) {
                    text = text.slice(0, -1);
                    el.textContent = text;
                    setTimeout(erasing, 40);
                } else cb && cb();
            })();
        };

        const startTypewriter = () => {
            if (!slogans.length) return;
            const sloganText = slogans[currentSloganIndex];
            const span = document.createElement('span');
            sloganContainer.appendChild(span);

            typeEffect(sloganText, span, () => {
                eraseEffect(span, () => {
                    span.remove();
                    currentSloganIndex = (currentSloganIndex + 1) % slogans.length;
                    setTimeout(startTypewriter, 500);
                });
            });
        };

        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) startTypewriter();
        }, { threshold: 0.5 }).observe(sloganContainer);
    }

    // ==============================
    // MODULE 6: FLOATING SVG ELEMENTS
    // ==============================
    const FloatingSVG = (() => {
        function createFloatingElements(container, count = 5) {
            if (prefersReducedMotion) return;
            for (let i = 0; i < count; i++) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.classList.add('floating-svg-element');
                svg.style.left = Math.random() * 100 + '%';
                svg.style.top = Math.random() * 100 + '%';
                svg.style.width = '30px';
                svg.style.height = '30px';
                svg.setAttribute('viewBox', '0 0 24 24');

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                if (Math.random() > 0.5) {
                    path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 ...');
                    path.setAttribute('fill', 'rgba(255, 215, 0, 0.6)');
                } else {
                    path.setAttribute('d', 'M12 2l3.09 6.26L22 9.27 ...');
                    path.setAttribute('fill', 'rgba(76, 175, 80, 0.6)');
                }
                svg.appendChild(path);
                svg.dataset.offset = Math.random() * Math.PI * 2;
                svg.dataset.speed = 0.5 + Math.random() * 0.5;
                container.appendChild(svg);
            }
        }

        function animateFloatingElements() {
            if (prefersReducedMotion) return;
            $$('.floating-svg-element').forEach(svg => {
                const time = Date.now() * 0.001;
                const offset = parseFloat(svg.dataset.offset);
                const speed = parseFloat(svg.dataset.speed);
                const bob = Math.sin(time * speed + offset) * 10;
                const rotate = time * speed * 50 + offset * 10;
                svg.style.transform = `translateY(${bob}px) rotate(${rotate}deg)`;
            });
            requestAnimationFrame(animateFloatingElements);
        }

        function init() {
            ['hero', 'about', 'work', 'contact'].forEach(id => {
                const section = document.getElementById(id);
                if (section) {
                    const floatingContainer = document.createElement('div');
                    floatingContainer.className = 'floating-elements';
                    section.appendChild(floatingContainer);
                    createFloatingElements(floatingContainer, 8);
                }
            });
            animateFloatingElements();
        }

        return { init };
    })();

    // ==============================
    // MODULE 7: PARTICLE CANVAS
    // ==============================
    const ParticleCanvas = (() => {
        let canvas, ctx, particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = Array.from({ length: 100 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: `hsla(${Math.random() * 360}, 80%, 70%, 0.6)`
            }));
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        }

        function init() {
            const particlesDiv = $('.particles');
            if (!particlesDiv) return;
            canvas = document.createElement('canvas');
            canvas.id = 'particle-canvas';
            Object.assign(canvas.style, {
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none'
            });
            particlesDiv.appendChild(canvas);
            ctx = canvas.getContext('2d');
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            createParticles();
            animateParticles();
        }
        return { init };
    })();

    // ==============================
    // MODULE 8: FORM HANDLING
    // ==============================
    const contactForm = $('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = $('#name').value.trim();
            const email = $('#email').value.trim();
            const message = $('#message').value.trim();

            if (!name || !email || !message) return alert('Please fill all required fields.');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Enter a valid email.');

            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // ==============================
    // MODULE 9: LIGHTBOX GALLERY
    // ==============================
    $$('.gallery-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const imgSrc = item.querySelector('img').src;
            const modal = document.createElement('div');
            modal.className = 'lightbox-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.innerHTML = `
                <div class="lightbox-overlay"></div>
                <div class="lightbox-content">
                    <img src="${imgSrc}" alt="Gallery Image" tabindex="0">
                    <button class="lightbox-close" aria-label="Close">&times;</button>
                </div>
            `;
            document.body.appendChild(modal);

            const closeModal = () => modal.remove();
            modal.querySelector('.lightbox-overlay').addEventListener('click', closeModal);
            modal.querySelector('.lightbox-close').addEventListener('click', closeModal);
            document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
        });
    });

    // ==============================
    // INITIALIZE MODULES
    // ==============================
    FloatingSVG.init();
    ParticleCanvas.init();
});
const slides = document.querySelectorAll('.about-slide');
const dots = document.querySelectorAll('.about-dots .dot');
let currentIndex = 0;
let autoPlay = true; // set to false if you only want manual

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    dots[i].classList.remove('active');
  });

  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentIndex = index;
}

// Dot navigation
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
  });
});

// Autoplay every 6s
if (autoPlay) {
  setInterval(() => {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }, 6000);
}
