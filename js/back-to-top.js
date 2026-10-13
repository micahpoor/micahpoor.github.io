// ===== BACK TO TOP =====
// Shared by index.html and gallery.html. The button ships with the hidden
// attribute, so without this script it never appears at all; with it, the
// button fades in once the visitor is within reach of the bottom of the page.
(() => {
    const button = document.querySelector('.back-to-top');
    if (!button) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const main = document.getElementById('main');

    button.hidden = false;

    function update() {
        const doc = document.documentElement;
        const distanceFromBottom = doc.scrollHeight - (window.scrollY + window.innerHeight);
        // Within roughly one screen of the end: the Contact section on the
        // home page, the last rows of photos on the gallery.
        const nearBottom = window.scrollY > window.innerHeight
            && distanceFromBottom < window.innerHeight * 0.75;
        button.classList.toggle('visible', nearBottom);
    }

    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
        // The button hides as the page scrolls away, which would strand keyboard
        // focus on an invisible control. Hand it to <main> instead, the same
        // place the skip link sends it, so the next Tab starts from the top.
        if (main) main.focus({ preventScroll: true });
        // It fades out from under the pointer, so mouseleave may never fire:
        // drop the magnetic offset and the enlarged cursor by hand.
        setOffset(0, 0);
        document.querySelector('.cursor')?.classList.remove('hover');
    });

    // Magnetic pull, same 0.3 strength as the .magnetic elements in main.js.
    // That version only reacts while the pointer is over the element, which
    // caps a 48px circle at ~7px of travel -- a twitch next to the wide CTAs.
    // So the field reaches past the button's edge instead, without growing
    // its click target.
    const MAGNET_RADIUS = 80;
    let offsetX = 0, offsetY = 0;

    function setOffset(x, y) {
        if (x === offsetX && y === offsetY) return;
        offsetX = x;
        offsetY = y;
        button.style.transform = x || y ? `translate(${x}px, ${y}px)` : '';
    }

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            if (!button.classList.contains('visible')) return setOffset(0, 0);
            const rect = button.getBoundingClientRect();
            // Measure from the resting position, not wherever the pull has moved it.
            const dx = e.clientX - (rect.left + rect.width / 2 - offsetX);
            const dy = e.clientY - (rect.top + rect.height / 2 - offsetY);
            if (Math.hypot(dx, dy) > MAGNET_RADIUS) return setOffset(0, 0);
            setOffset(dx * 0.3, dy * 0.3);
        }, { passive: true });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    // Lazy-loaded gallery photos grow the page without firing a scroll event.
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(document.body);
    update();
})();
