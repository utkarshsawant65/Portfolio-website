/* copy.js: copy-email button + proof-strip count-up */
(() => {
  'use strict';

  /* copy email */
  const btn = document.querySelector('[data-copy]');
  if (btn) {
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.dataset.state = 'copied';
        btn.textContent = 'copied ✓';
      } catch (_) {
        btn.textContent = 'press Ctrl+C';
      }
      setTimeout(() => { btn.textContent = label; delete btn.dataset.state; }, 1500);
    });
  }

  /* count-up, once, 900 ms (skipped for reduced motion) */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const fmt = (v) => pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 900);
      el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();
