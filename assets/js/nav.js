/* nav.js: mobile menu (aria-expanded, focus trap, Esc) + active link */
(() => {
  'use strict';

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');

  if (toggle && nav) {
    const focusables = () => [toggle, ...nav.querySelectorAll('a')];
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

    document.addEventListener('keydown', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') { setOpen(false); toggle.focus(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* active link follows the section in view */
  const links = Array.from(document.querySelectorAll('[data-nav]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      links.forEach((a) => {
        if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  links.forEach((a) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) io.observe(target);
  });
})();
