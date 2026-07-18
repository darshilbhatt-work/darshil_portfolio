'use strict';

/* ============================================================
   NAV — scroll state + active link tracking
   ============================================================ */
const nav        = document.getElementById('nav');
const navLinks   = document.querySelectorAll('.nav-links a');
const sections   = document.querySelectorAll('section[id]');

function updateNav() {
  // Frosted-glass scrolled state
  nav.classList.toggle('scrolled', window.scrollY > 20);

  // Highlight active nav link based on scroll position
  let activeId = '';
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 100) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();


/* ============================================================
   MOBILE NAV — hamburger toggle
   ============================================================ */
const hamburger  = document.querySelector('.nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openMobileMenu() {
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMobileMenu() : openMobileMenu();
});

// Close on any menu link click
mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) closeMobileMenu();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});


/* ============================================================
   SCROLL REVEAL — IntersectionObserver fade + slide up
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      // Stagger siblings inside a grid for a cascade effect
      const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
      if (siblings && siblings.length > 1) {
        let index = 0;
        siblings.forEach((el, i) => { if (el === entry.target) index = i; });
        entry.target.style.transitionDelay = `${index * 80}ms`;
      }
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.10, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));


/* ============================================================
   COUNTER ANIMATION — count up when stat enters viewport
   Reads data-count as the target number.
   Suffix ("+", "/100") comes from a .stat-suffix child element
   and is left untouched — only the text node before it animates.
   ============================================================ */
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  if (isNaN(target)) return;

  // Find the direct text node to update (before any child spans)
  let textNode = null;
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      textNode = node;
    }
  });
  if (!textNode) return;

  const isInteger = Number.isInteger(target);
  const duration  = 1200;
  const startTime = performance.now();

  function step(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value    = target * eased;

    textNode.textContent = isInteger
      ? Math.floor(value).toString()
      : value.toFixed(1);

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.6 }
);

// Only observe elements that have a numeric data-count
document.querySelectorAll('.stat-number[data-count]').forEach((el) => {
  const val = parseFloat(el.dataset.count);
  if (!isNaN(val)) counterObserver.observe(el);
});


/* ============================================================
   LIGHTBOX — click any proof screenshot to view full-size
   ============================================================ */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption || '';
  lightboxCaption.textContent = caption || '';
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-lightbox-img]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    openLightbox(trigger.dataset.lightboxImg, trigger.dataset.lightboxCaption);
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') closeLightbox();
});


/* ============================================================
   SMOOTH SCROLL — anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});
