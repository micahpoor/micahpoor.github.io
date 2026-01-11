// ===== CUSTOM CURSOR =====
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

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
    "Transforming ideas into stories",
    "Crafting engaging content",
    "Making brands memorable",
    "Telling stories that connect"
];

const typewriter = document.querySelector('.typewriter');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typewriter.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typewriter.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause before deleting
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before typing next
    }

    setTimeout(type, typingSpeed);
}

// Start typewriter after a delay
setTimeout(type, 1000);

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
const projectData = JSON.parse(document.getElementById('project-data').textContent);

projectCards.forEach(card => {
    card.addEventListener('click', () => {
        const projectId = card.dataset.project;
        const project = projectData[projectId];

        if (project) {
            modalContent.innerHTML = `
                <img src="${project.heroImage}" alt="${project.title}" class="modal-hero">
                <h2 class="modal-title">${project.title}</h2>
                <p class="modal-subtitle">${project.subtitle}</p>
                <p class="modal-description">${project.description}</p>

                <div class="modal-section">
                    <h4>Role</h4>
                    <p>${project.role}</p>
                </div>

                <div class="modal-section">
                    <h4>Challenge</h4>
                    <p>${project.challenge}</p>
                </div>

                <div class="modal-section">
                    <h4>Solution</h4>
                    <p>${project.solution}</p>
                </div>

                <div class="modal-section">
                    <h4>Outcome</h4>
                    <p>${project.outcome}</p>
                </div>

                <div class="modal-section">
                    <h4>Tools Used</h4>
                    <div class="modal-tools">
                        ${project.tools.map(tool => `<span class="modal-tool">${tool}</span>`).join('')}
                    </div>
                </div>
            `;

            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

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
