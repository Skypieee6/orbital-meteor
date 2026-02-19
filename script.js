/* ============================================================
   script.js  –  OrbitalMeteor animated site
   ============================================================ */

// ──────────────────────────────────────────────────────────────
// 1. STARFIELD + METEOR CANVAS
// ──────────────────────────────────────────────────────────────
(function initStarfield() {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], meteors = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => { resize(); buildStars(); });

    function buildStars() {
        stars = [];
        const count = Math.floor((W * H) / 2400);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.6 + 0.3,
                alpha: Math.random(),
                speed: Math.random() * 0.4 + 0.1,
                drift: (Math.random() - 0.5) * 0.15,
            });
        }
    }

    function spawnMeteor() {
        meteors.push({
            x: Math.random() * W,
            y: Math.random() * (H * 0.5),
            len: Math.random() * 180 + 80,
            speed: Math.random() * 8 + 7,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
            alpha: 1,
            width: Math.random() * 1.5 + 0.5,
        });
    }

    function drawStars() {
        stars.forEach(s => {
            s.alpha += s.speed * 0.02;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(241,245,249,${0.3 + 0.7 * Math.abs(Math.sin(s.alpha))})`;
            ctx.fill();
        });
    }

    function drawMeteors() {
        meteors = meteors.filter(m => m.alpha > 0);
        meteors.forEach(m => {
            const dx = Math.cos(m.angle) * m.len;
            const dy = Math.sin(m.angle) * m.len;
            const grad = ctx.createLinearGradient(m.x, m.y, m.x - dx, m.y - dy);
            grad.addColorStop(0, `rgba(168,85,247,${m.alpha})`);
            grad.addColorStop(0.5, `rgba(34,211,238,${m.alpha * 0.6})`);
            grad.addColorStop(1, 'rgba(34,211,238,0)');
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - dx, m.y - dy);
            ctx.strokeStyle = grad;
            ctx.lineWidth = m.width;
            ctx.stroke();
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.alpha -= 0.018;
        });
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        drawStars();
        drawMeteors();
        requestAnimationFrame(frame);
    }

    resize();
    buildStars();
    frame();

    setInterval(spawnMeteor, 2800);
    setTimeout(spawnMeteor, 600);
    setTimeout(spawnMeteor, 1400);
})();


// ──────────────────────────────────────────────────────────────
// 2. NAVBAR SCROLL EFFECT
// ──────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


// ──────────────────────────────────────────────────────────────
// 3. SMOOTH ACTIVE NAV LINKS ON SCROLL
// ──────────────────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function onScroll() {
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
    });
    navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${current}`
            ? 'var(--accent-cyan)'
            : '';
    });
}
window.addEventListener('scroll', onScroll, { passive: true });


// ──────────────────────────────────────────────────────────────
// 4. COUNTER ANIMATION
// ──────────────────────────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
    let start = null;
    function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(el => {
                animateCounter(el, +el.dataset.target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);


// ──────────────────────────────────────────────────────────────
// 5. FEATURE CARDS – SCROLL REVEAL
// ──────────────────────────────────────────────────────────────
const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add('visible'), +delay);
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.feature-card').forEach(card => cardObserver.observe(card));


// ──────────────────────────────────────────────────────────────
// 6. PLANET PARALLAX ON MOUSE MOVE
// ──────────────────────────────────────────────────────────────
const planet = document.getElementById('mainPlanet');
let tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;

document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = ((e.clientX - cx) / cx) * 12;
    targetY = ((e.clientY - cy) / cy) * 12;
});

function lerpPlanet() {
    tiltX += (targetX - tiltX) * 0.07;
    tiltY += (targetY - tiltY) * 0.07;
    if (planet) {
        planet.style.transform = `rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
    }
    requestAnimationFrame(lerpPlanet);
}
lerpPlanet();


// ──────────────────────────────────────────────────────────────
// 7. PLANET CARDS HOVER GLOW
// ──────────────────────────────────────────────────────────────
const glowColors = {
    mercury: '#6b7280', venus: '#fbbf24', earth: '#34d399',
    mars: '#f97316', jupiter: '#d97706', saturn: '#fde68a',
};

document.querySelectorAll('.planet-card').forEach(card => {
    const orb = card.querySelector('.planet-orb');
    const cls = [...orb.classList].find(c => glowColors[c]) || 'earth';
    card.addEventListener('mouseenter', () => {
        orb.style.boxShadow = `0 0 40px ${glowColors[cls]}, 0 0 80px ${glowColors[cls]}44`;
    });
    card.addEventListener('mouseleave', () => { orb.style.boxShadow = ''; });
});


// ──────────────────────────────────────────────────────────────
// 8. SUBSCRIBE FORM
// ──────────────────────────────────────────────────────────────
const form = document.getElementById('subscribeForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('emailInput');
    if (!input.value) return;
    form.style.cssText = 'opacity:0;transform:translateY(-10px);transition:all 0.4s ease;';
    setTimeout(() => {
        form.style.display = 'none';
        successMsg.classList.add('show');
    }, 400);
});


// ──────────────────────────────────────────────────────────────
// 9. BUTTON RIPPLE EFFECT
// ──────────────────────────────────────────────────────────────
document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.style.cssText = `
      position:absolute;width:8px;height:8px;border-radius:50%;
      background:rgba(255,255,255,0.5);pointer-events:none;
      left:${e.clientX - rect.left - 4}px;top:${e.clientY - rect.top - 4}px;
      transform:scale(0);animation:rippleAnim 0.6s ease-out forwards;
    `;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
    });
});

const style = document.createElement('style');
style.textContent = `@keyframes rippleAnim{to{transform:scale(35);opacity:0;}}`;
document.head.appendChild(style);


// ──────────────────────────────────────────────────────────────
// 10. PAGE LOAD ENTRANCE
// ──────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    });
});
