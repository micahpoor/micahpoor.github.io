// ===== CUSTOM CURSOR =====
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

const isPointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (isPointerFine) {
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Dot follows mouse closely
        dotX += (mouseX - dotX) * 0.5;
        dotY += (mouseY - dotY) * 0.5;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';

        // Ring follows with more delay
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover effect
    const hoverElements = document.querySelectorAll('a, button, .project-card, .magnetic');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    typewriter.addEventListener('mouseenter', () => {
        if (typewriter.classList.contains('miko-clickable')) cursor.classList.add('hover');
    });
    typewriter.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
}

// ===== MAGNETIC BUTTONS =====
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach(el => {
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

// ===== TYPEWRITER EFFECT =====
const phrases = [
    "Building the infrastructure behind content",
    "Editorial judgment at scale",
    "Building communities worth belonging to",
    "Where the mission is the point",
    "Copy that earns its place",
    "Building what needs to exist",
    "Miko approved.",
];

const typewriter = document.querySelector('.typewriter');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 65;
let pillsRevealed = false;

function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typewriter.classList.remove('miko-clickable');
        typewriter.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 30;
    } else {
        typewriter.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 65;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 1200;
        if (currentPhrase === 'Miko approved.') typewriter.classList.add('miko-clickable');
        if (!pillsRevealed) {
            pillsRevealed = true;
            document.querySelector('.hero-roles').classList.add('revealed');
        }
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 250;
    }

    setTimeout(type, typingSpeed);
}

setTimeout(type, 0);

typewriter.addEventListener('click', () => {
    if (typewriter.classList.contains('miko-clickable')) triggerMikoStamp();
});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.scroll-reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== TILT EFFECT =====
const tiltElements = document.querySelectorAll('.tilt-effect');

tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = '';
    });
});

// ===== PROJECT MODALS =====
const projectCards = document.querySelectorAll('.project-card');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalClose = document.querySelector('.modal-close');
const modalEl = document.querySelector('.modal');
const projectData = JSON.parse(document.getElementById('project-data').textContent);

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
let modalTrigger = null;
let modalPushedState = false;

function buildModalHTML(project) {
    const statsHTML = project.stats ? `
        <div class="meta-stats">
            ${project.stats.map(s => `
            <div>
                <span class="stat-value">${s.value}</span>
                <span class="stat-label">${s.label}</span>
            </div>`).join('')}
        </div>` : '';
    return `
        <img src="${project.heroImage}" alt="${project.title}" class="modal-hero">
        <div class="modal-zone-header">
            <h2 class="modal-title" id="modal-title">${project.title}</h2>
            <p class="modal-subtitle">${project.subtitle}</p>
            <div class="header-meta">
                <span class="meta-role">${project.role}</span>
                ${statsHTML}
            </div>
        </div>
        <div class="modal-zone modal-zone-b">
            <div class="zone-left">
                <span class="zone-label">Lede</span>
            </div>
            <div class="zone-right zone-right--lede">
                <p>${project.description}</p>
            </div>
        </div>
        <div class="modal-zone-challenge">
            <h4>Challenge</h4>
            <p>${project.challenge}</p>
        </div>
        <div class="modal-zone modal-zone-c">
            <div class="zone-left">
                <span class="zone-label">System</span>
            </div>
            <div class="zone-right">
                <p>${project.solution}</p>
            </div>
        </div>
        ${(project.examples || []).map((ex, i) => {
            const num = String(i + 1).padStart(2, '0');
            const zoneClass = i % 2 === 0 ? 'modal-zone-b' : 'modal-zone-c';
            const imgHTML = ex.image ? `<img src="${ex.image}" alt="${ex.imageAlt || ''}" class="example-img">` : '';
            const videoHTML = ex.video ? `<div class="video-exhibit"><video controls class="example-video"${ex.poster ? ` poster="${ex.poster}"` : ''}><source src="${ex.video}" type="video/mp4"></video></div>` : '';
            const statHTML = ex.stat ? `<p class="example-stat">${ex.stat}</p>` : '';
            const linkHTML = ex.link ? `<a href="${ex.link}" target="_blank" rel="noopener" class="example-link">${ex.linkLabel || '↗ View post'}</a>` : '';
            return `
        <div class="modal-zone ${zoneClass}">
            <div class="zone-left">
                <span class="zone-label">${num}</span>
            </div>
            <div class="zone-right">
                <p class="example-title">${ex.label}</p>
                ${statHTML}
                <p class="example-body">${ex.body}</p>
                ${imgHTML}
                ${videoHTML}
                ${linkHTML}
            </div>
        </div>`;
        }).join('')}
        <div class="modal-zone modal-zone-b">
            <div class="zone-left">
                <span class="zone-label">Results</span>
            </div>
            <div class="zone-right">
                <p>${project.outcome}</p>
            </div>
        </div>
        <div class="modal-zone modal-zone-c">
            <div class="zone-left">
                <span class="zone-label">Tools</span>
            </div>
            <div class="zone-right">
                <div class="modal-tools">
                    ${project.tools.map(tool => `<span class="modal-tool">${tool}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

projectCards.forEach(card => {
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });

    card.addEventListener('click', () => {
        const projectId = card.dataset.project;
        const project = projectData[projectId];

        if (project) {
            modalContent.innerHTML = buildModalHTML(project);
            modalTrigger = card;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            history.pushState({ modal: true }, '');
            modalPushedState = true;
            requestAnimationFrame(() => modalClose.focus());
        }
    });
});

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (modalTrigger) { modalTrigger.focus(); modalTrigger = null; }
    if (modalPushedState) { modalPushedState = false; history.back(); }
}

function openProject(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    modalContent.innerHTML = buildModalHTML(project);
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    history.pushState({ modal: true }, '');
    modalPushedState = true;
    requestAnimationFrame(() => modalClose.focus());
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab' || !modalOverlay.classList.contains('active')) return;
    const focusable = [...modalEl.querySelectorAll(FOCUSABLE)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
});

// Back gesture closes modal instead of navigating away
window.addEventListener('popstate', () => {
    if (modalOverlay.classList.contains('active')) {
        modalPushedState = false;
        closeModal();
    }
});

// Swipe down from top of modal to close
let touchStartY = 0;
modalEl.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });
modalEl.addEventListener('touchend', (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY > 80 && modalEl.scrollTop === 0) closeModal();
}, { passive: true });

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== EASTER EGG =====
let clickCount = 0;
const heroName = document.querySelector('.hero-name');

heroName.addEventListener('click', () => {
    clickCount++;

    if (clickCount === 5) {
        // Trigger confetti!
        createConfetti();
        clickCount = 0;
    }
});

function createConfetti() {
    const colors = ['#c084fc', '#e879f9', '#f5f5f5', '#22c55e', '#3b82f6'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 9999;
            animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

function triggerMikoStamp() {
    if (document.getElementById('miko-stamp')) return;
    const stamp = document.createElement('div');
    stamp.id = 'miko-stamp';
    stamp.className = 'miko-stamp';
    stamp.innerHTML = `
        <div class="stamp-inner">
            <svg class="stamp-ring" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <path id="stamp-arc" d="M 16,100 A 84,84 0 0,0 184,100"/>
                </defs>
                <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="4"/>
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" stroke-width="2"/>
                <text class="stamp-text">
                    <textPath href="#stamp-arc" startOffset="50%" text-anchor="middle">✦ APPROVED ✦</textPath>
                </text>
                <g transform="rotate(180, 100, 100)">
                    <text class="stamp-text">
                        <textPath href="#stamp-arc" startOffset="50%" text-anchor="middle">CHIEF APPROVAL OFFICER</textPath>
                    </text>
                </g>
            </svg>
            <img src="assets/projects/miko-1.jpg" class="stamp-photo" alt="Miko">
        </div>
    `;
    document.body.appendChild(stamp);
    setTimeout(() => stamp.remove(), 2600);
}

// Add confetti animation to page
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== NAV SCROLL EFFECT =====
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.8)';
    }

    lastScroll = currentScroll;
});

// ===== NAV ACTIVE STATE =====
const navLinks = document.querySelectorAll('.nav-link');
const navSections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const trigger = window.scrollY + window.innerHeight * 0.25;
    let activeId = '';

    navSections.forEach(section => {
        if (section.offsetTop <= trigger) {
            activeId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();
