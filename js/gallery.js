// Gallery page. Standalone rather than sharing main.js, because main.js queries
// index-only elements (typewriter, project cards, project modal) unguarded and
// would throw on this page. The shared behaviours below are duplicated
// deliberately; see the note at the bottom of this file.

// Progressive enhancement: content is visible and the native cursor is shown by
// default; these classes opt into JS-driven presentation only once the script runs.
document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ===== CUSTOM CURSOR =====
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (isPointerFine) {
    document.documentElement.classList.add('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        dotX += (mouseX - dotX) * 0.5;
        dotY += (mouseY - dotY) * 0.5;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';

        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .gallery-item, .magnetic').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
    });
});

// ===== SCROLL REVEAL =====
// Elements are hidden for the reveal animation only when the observer is
// actually running (html.js-reveal); otherwise CSS leaves them visible.
if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
}

// ===== NAV SCROLL EFFECT =====
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    nav.style.background = window.pageYOffset > 100
        ? 'rgba(10, 10, 10, 0.95)'
        : 'rgba(10, 10, 10, 0.8)';
});

// ===== LIGHTBOX =====
const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

const items = [...document.querySelectorAll('.gallery-item')];
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const counter = document.getElementById('lightbox-counter');
const btnClose = lightbox.querySelector('.lightbox-close');
const btnPrev = lightbox.querySelector('.lightbox-prev');
const btnNext = lightbox.querySelector('.lightbox-next');

// Everything outside the dialog, so the page behind it is unreachable while open.
const backgroundEls = document.querySelectorAll('body > nav, body > main, body > footer, body > .skip-link');

let currentIndex = 0;
let lastTrigger = null;
let pushedState = false;

function setBackgroundInert(on) {
    backgroundEls.forEach(el => { el.inert = on; });
}

function render(i) {
    const item = items[i];
    lightboxImg.src = item.dataset.full;
    lightboxImg.width = Number(item.dataset.fullW);
    lightboxImg.height = Number(item.dataset.fullH);
    // Carry the grid thumbnail's description across rather than a positional
    // placeholder — the counter already announces position.
    lightboxImg.alt = item.querySelector('img').alt;
    counter.textContent = `${i + 1} / ${items.length}`;
}

function openLightbox(i, trigger) {
    currentIndex = i;
    render(i);
    lastTrigger = trigger || null;
    lightbox.classList.add('active');
    setBackgroundInert(true);
    document.body.style.overflow = 'hidden';
    if (!pushedState) {
        history.pushState({ lightbox: true }, '');
        pushedState = true;
    }
    focusLightboxWhenVisible();
}

// The dialog is visibility:hidden until .active takes effect, and a hidden
// element cannot take focus. Retry briefly rather than assuming the first call
// landed — same approach the project modal on the index page uses.
function focusLightboxWhenVisible(attempt = 0) {
    lightbox.focus({ preventScroll: true });
    if (document.activeElement !== lightbox && attempt < 10) {
        setTimeout(() => focusLightboxWhenVisible(attempt + 1), 50);
    }
}

function closeLightbox() {
    lightbox.classList.remove('active');
    setBackgroundInert(false);
    document.body.style.overflow = '';
    // Drop the source so a large photo isn't held in memory once it's hidden.
    lightboxImg.removeAttribute('src');
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
    if (pushedState) { pushedState = false; history.back(); }
}

function step(delta) {
    currentIndex = (currentIndex + delta + items.length) % items.length;
    render(currentIndex);
}

items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i, item));
});

btnClose.addEventListener('click', closeLightbox);
btnPrev.addEventListener('click', () => step(-1));
btnNext.addEventListener('click', () => step(1));

// Click the backdrop (but not the photo or the controls) to dismiss.
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-figure')) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }

    if (e.key === 'Tab') {
        const focusable = [...lightbox.querySelectorAll(FOCUSABLE)];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

// Back gesture / browser back closes the viewer rather than leaving the page.
window.addEventListener('popstate', () => {
    if (lightbox.classList.contains('active')) {
        pushedState = false;
        closeLightbox();
    }
});

// Swipe to move between photos, swipe down to dismiss.
let touchStartX = 0, touchStartY = 0;
lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        step(dx < 0 ? 1 : -1);
    } else if (dy > 80) {
        closeLightbox();
    }
}, { passive: true });

// ===== MIKO EASTER EGG =====
// Duplicated from main.js so the footer trigger works on this page too. If a
// third page ever needs it, pull this and the shared behaviours above into a
// common file rather than copying again.
document.addEventListener('click', (e) => {
    if (e.target.closest('.miko-trigger')) triggerMikoAnnotation();
});

function triggerMikoAnnotation() {
    if (document.getElementById('miko-stamp')) return;
    const stamp = document.createElement('div');
    stamp.id = 'miko-stamp';
    stamp.className = 'miko-stamp';
    stamp.innerHTML = `<img src="assets/images/mikoSeal_v1.webp" alt="Miko Approved — official portfolio certification mark" draggable="false">`;
    stamp.addEventListener('click', () => {
        if (reducedMotion.matches) {
            stamp.remove();
            return;
        }
        stamp.classList.add('stamp-dismiss');
        stamp.addEventListener('animationend', () => stamp.remove(), { once: true });
    });
    if (isPointerFine) {
        stamp.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        stamp.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    }
    document.body.appendChild(stamp);
}
