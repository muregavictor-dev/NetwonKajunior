document.addEventListener('DOMContentLoaded', () => {
    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => parent.querySelectorAll(sel);

    // ==============================
    // NAVIGATION
    // ==============================
    const menuToggle = $('.menu-toggle');
    const navLinks = $('.nav-links');
    const header = $('header');
    const scrollIndicator = $('.scroll-indicator');
    const sections = $$('section');
    const navLinksAll = $$('.nav-link');

    if ($$('a[href^="#"]').length) {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const href = anchor.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const target = $(href);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    if (menuToggle && navLinks) {
        const toggleMenu = () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
        };
        menuToggle.addEventListener('click', toggleMenu);
    }

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
            if (scrollY >= section.offsetTop - 150) current = section.id;
        });
        navLinksAll.forEach(link => {
            if (link.getAttribute('href')?.includes(current)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    window.addEventListener('scroll', onScrollHandler);
    onScrollHandler();

    // ==============================
    // COUNTERS
    // ==============================
    $$('.counter').forEach(counter => {
        const update = () => {
            const target = +counter.getAttribute('data-target') || 0;
            const current = +counter.innerText || 0;
            const increment = Math.ceil(target / 200);
            if (current < target) {
                counter.innerText = current + increment;
                setTimeout(update, 20);
            } else {
                counter.innerText = target;
            }
        };
        update();
    });

    // ==============================
    // TYPEWRITER
    // ==============================
    const typewriterElement = $('.typewriter');
    if (typewriterElement) {
        const texts = JSON.parse(typewriterElement.getAttribute('data-texts') || '[]');
        let index = 0, charIndex = 0, deleting = false;
        function type() {
            if (!texts.length) return;
            if (!deleting && charIndex <= texts[index].length) {
                typewriterElement.textContent = texts[index].substring(0, charIndex++);
                setTimeout(type, 120);
            } else if (deleting && charIndex >= 0) {
                typewriterElement.textContent = texts[index].substring(0, charIndex--);
                setTimeout(type, 60);
            } else {
                deleting = !deleting;
                if (!deleting) index = (index + 1) % texts.length;
                setTimeout(type, 800);
            }
        }
        type();
    }

    // ==============================
    // FLOATING SVGs
    // ==============================
    $$('.floating-svg').forEach(svg => {
        let x = 0, y = 0, angle = Math.random() * 360;
        function float() {
            if (!svg) return;
            x += Math.cos(angle) * 0.5;
            y += Math.sin(angle) * 0.5;
            svg.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(float);
        }
        float();
    });

    // ==============================
    // PARTICLES
    // ==============================
    const canvas = $('#particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        const particles = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            r: Math.random() * 2 + 1
        }));
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.dx; p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        animate();
        window.addEventListener('resize', resize);
    }

    // ==============================
    // LIGHTBOX
    // ==============================
    $$('.gallery-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const img = item.querySelector('img');
            if (!img) return;
            const modal = document.createElement('div');
            modal.className = 'lightbox-modal';
            modal.innerHTML = `
                <div class="lightbox-overlay"></div>
                <div class="lightbox-content">
                    <img src="${img.src}" alt="">
                    <button class="lightbox-close">&times;</button>
                </div>
            `;
            document.body.appendChild(modal);
            const close = () => modal.remove();
            modal.querySelector('.lightbox-overlay').addEventListener('click', close);
            modal.querySelector('.lightbox-close').addEventListener('click', close);
        });
    });

    // ==============================
    // CONTACT FORM
    // ==============================
    const contactForm = $('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const name = $('#name')?.value.trim();
            const email = $('#email')?.value.trim();
            const message = $('#message')?.value.trim();
            if (!name || !email || !message) return alert('Please fill all fields.');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Invalid email.');
            alert('Thank you! We will reply soon.');
            contactForm.reset();
        });
    }
});
