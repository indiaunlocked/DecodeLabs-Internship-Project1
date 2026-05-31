/* ============================================================
   GreenRoots Plant Nursery — script.js
   Vanilla JavaScript | No Frameworks | ES6+
   Features:
     1. Mobile nav toggle (aria, keyboard, outside-click)
     2. Header scroll shadow
     3. Active nav link highlight (IntersectionObserver)
     4. Scroll-reveal animations (IntersectionObserver)
     5. Plant category filter
     6. Add-to-cart with toast notification + cart count
     7. Back-to-top button
     8. Smooth anchor scrolling
     9. Resize handler
   ============================================================ */

'use strict';

/* ── 1. DOM References ───────────────────────────────────── */
const header      = document.getElementById('site-header');
const navToggle   = document.getElementById('nav-toggle');
const navMenu     = document.getElementById('nav-menu');
const navLinks    = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('main section[id]');
const backToTop   = document.getElementById('back-to-top');
const filterBtns  = document.querySelectorAll('.filter-btn');
const plantItems  = document.querySelectorAll('.plant-item');

/* ── 2. App State ────────────────────────────────────────── */
const state = {
  menuOpen:      false,
  scrolled:      false,
  activeSection: '',
};

/* ── 3. Utility: debounce ────────────────────────────────── */
function debounce(fn, ms = 120) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── 4. Mobile Navigation ────────────────────────────────── */
function openMenu() {
  state.menuOpen = true;
  navMenu.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  state.menuOpen = false;
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  state.menuOpen ? closeMenu() : openMenu();
});

// Close when a nav link is clicked
navLinks.forEach(link => link.addEventListener('click', () => {
  if (state.menuOpen) closeMenu();
}));

// Close on outside tap/click
document.addEventListener('click', (e) => {
  if (
    state.menuOpen &&
    !navMenu.contains(e.target) &&
    !navToggle.contains(e.target)
  ) closeMenu();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.menuOpen) {
    closeMenu();
    navToggle.focus();
  }
});

/* ── 5. Header Scroll Shadow ─────────────────────────────── */
function onScroll() {
  const y = window.scrollY;

  // Header shadow
  if (y > 24 && !state.scrolled) {
    header.classList.add('scrolled');
    state.scrolled = true;
  } else if (y <= 24 && state.scrolled) {
    header.classList.remove('scrolled');
    state.scrolled = false;
  }

  // Back-to-top visibility
  if (y > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }

  updateActiveNav();
}

/* ── 6. Active Nav Link ──────────────────────────────────── */
function updateActiveNav() {
  const mid = window.scrollY + window.innerHeight / 3;
  let current = '';

  sections.forEach(sec => {
    if (mid >= sec.offsetTop && mid < sec.offsetTop + sec.offsetHeight) {
      current = sec.id;
    }
  });

  if (current === state.activeSection) return;
  state.activeSection = current;

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    if (href === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'true');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

// RAF-throttled scroll listener
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => { onScroll(); ticking = false; });
    ticking = true;
  }
}, { passive: true });

/* ── 7. Scroll Reveal (IntersectionObserver) ─────────────── */
const revealTargets = document.querySelectorAll(
  '.plant-item, .service-card, .tip-card, .testimonial-card, ' +
  '.about-grid, .q-card, .value-chip, .hero-trust'
);

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

revealTargets.forEach(el => revealObs.observe(el));

/* ── 8. Plant Category Filter ────────────────────────────── */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update button states
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;

    // Show/hide plant items with a small stagger
    plantItems.forEach((item, i) => {
      const match = filter === 'all' || item.dataset.category === filter;

      if (match) {
        // Remove hidden with a tiny delay for stagger effect
        setTimeout(() => {
          item.classList.remove('hidden');
          item.style.animationDelay = `${i * 0.05}s`;
        }, i * 40);
      } else {
        item.classList.add('hidden');
      }
    });
  });
});


/* ── 10. Back to Top ─────────────────────────────────────── */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 11. Smooth Scroll for Anchor Links ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const offset = header.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });

    // Accessibility: move focus to section
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  });
});

/* ── 12. Resize Handler ──────────────────────────────────── */
const onResize = debounce(() => {
  if (window.innerWidth >= 768 && state.menuOpen) closeMenu();
}, 200);

window.addEventListener('resize', onResize);

/* ── 13. Initialisation ──────────────────────────────────── */
function init() {
  onScroll();

  // Reveal elements already in viewport on load
  revealTargets.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('visible');
    }
  });

  // Console signature
  console.log(
    '%c 🌿 GreenRoots Plant Nursery ',
    'background:#2d5a3d; color:#fff; font-family:serif; padding:4px 10px; border-radius:4px;'
  );
  console.log(
    '%c Built with HTML5 · CSS3 · Vanilla JS | DecodeLabs Project 1 ✓',
    'color:#4a7c59;'
  );
}

document.addEventListener('DOMContentLoaded', init);
