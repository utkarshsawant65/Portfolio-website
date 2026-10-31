/* lineage.js: hover/tap a tool, project cards that use it stay lit; also the work filters */
(() => {
  'use strict';

  const cards = Array.from(document.querySelectorAll('.card[data-tools]'));
  const chips = document.querySelectorAll('.chip[data-tool]');
  const status = document.getElementById('lineage-status');
  let locked = null;

  const titleOf = (c) => c.querySelector('.card-title').textContent.trim();

  const show = (chip) => {
    const t = chip.dataset.tool;
    const used = cards.filter((c) => c.dataset.tools.split(' ').includes(t));
    cards.forEach((c) => c.classList.toggle('is-dim', !used.includes(c)));
    if (!status) return;
    status.innerHTML = used.length
      ? `<strong>${chip.textContent}</strong> &rarr; used in ${used.length} project${used.length > 1 ? 's' : ''}: ${used.map(titleOf).join(' · ')}`
      : `<strong>${chip.textContent}</strong> &rarr; not used in a featured project (research / earlier work)`;
  };
  const clear = () => {
    cards.forEach((c) => c.classList.remove('is-dim'));
    if (status) status.textContent = 'hover or tap a tool to see which projects use it.';
  };

  chips.forEach((chip) => {
    chip.addEventListener('mouseenter', () => { if (!locked) show(chip); });
    chip.addEventListener('focus', () => { if (!locked) show(chip); });
    chip.addEventListener('mouseleave', () => { if (!locked) clear(); });
    chip.addEventListener('blur', () => { if (!locked) clear(); });
    chip.addEventListener('click', () => {
      /* tap toggles a lock, so it also works on touch screens */
      const wasLocked = locked === chip;
      chips.forEach((c) => { c.classList.remove('is-locked'); c.setAttribute('aria-pressed', 'false'); });
      locked = null;
      if (wasLocked) { clear(); return; }
      locked = chip;
      chip.classList.add('is-locked');
      chip.setAttribute('aria-pressed', 'true');
      show(chip);
    });
  });

  /* work filters */
  const filters = document.querySelectorAll('.filter');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const f = btn.dataset.filter;
      cards.forEach((c) => {
        const tags = (c.dataset.tags || '').split(' ');
        c.classList.toggle('is-hidden', f !== 'all' && !tags.includes(f));
      });
    });
  });
})();
