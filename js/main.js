/* ===========================================================
   Utkarsh Sawant — portfolio interactions
   =========================================================== */

(() => {
  'use strict';

  /* ---------- 0. background switcher (A/B test multiple bg styles) ---------- */
  const BG_OPTIONS = ['particles', 'kpi', 'dag2', 'prompt', 'erd'];
  const BG_STORAGE_KEY = 'utkarsh.bg.v2';

  const initBgSwitcher = () => {
    const saved = localStorage.getItem(BG_STORAGE_KEY);
    if (saved && BG_OPTIONS.includes(saved)) {
      document.body.setAttribute('data-bg', saved);
    }
    const current = document.body.getAttribute('data-bg') || 'particles';

    const buttons = document.querySelectorAll('.bg-switcher [data-bg-pick]');
    buttons.forEach((btn) => {
      if (btn.dataset.bgPick === current) btn.classList.add('is-active');
      btn.addEventListener('click', () => {
        const pick = btn.dataset.bgPick;
        document.body.setAttribute('data-bg', pick);
        localStorage.setItem(BG_STORAGE_KEY, pick);
        buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
      });
    });
  };

  /* ---------- 0b. KPI ticker bg: realistic-looking metrics + timestamps ---------- */
  const initKpiBg = () => {
    const streams = document.querySelectorAll('.kpi-stream');
    if (!streams.length) return;

    // generate ~60 lines of realistic kpi log
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    const startTime = new Date('2026-05-25T14:00:00');

    const metrics = [
      () => `orders_today=${240 + Math.floor(Math.random() * 30)} ↑ ${(8 + Math.random() * 8).toFixed(1)}%`,
      () => `revenue_eur=${(7500 + Math.random() * 2000).toFixed(2)}`,
      () => `match_rate=${(89 + Math.random() * 5).toFixed(1)}% (${Math.random() > 0.5 ? '↑' : '↓'} ${(Math.random() * 2.5).toFixed(1)}pp wow)`,
      () => `pipeline_lag=${pad(Math.floor(Math.random() * 6))}m${pad(Math.floor(Math.random() * 60))}s`,
      () => `cost_per_order=€${(1.5 + Math.random() * 0.8).toFixed(2)}`,
      () => `claude_tokens=${(10000 + Math.floor(Math.random() * 8000)).toLocaleString()} · $${(0.3 + Math.random() * 0.3).toFixed(2)}`,
      () => `aov_eur=${(28 + Math.random() * 8).toFixed(2)}`,
      () => `channel_mix=amazon_de:${(40 + Math.random()*15).toFixed(0)}% shopify:${(20 + Math.random()*10).toFixed(0)}% amazon_uk:${(15 + Math.random()*10).toFixed(0)}%`,
      () => `pnl_net_margin=${(8 + Math.random() * 6).toFixed(1)}%`,
      () => `gcs_uploaded=raw/Gmail/2026-05/ +${Math.floor(Math.random() * 30)} PDFs`,
      () => `dag_run=sp_api_orders_ingest … ${Math.random() > 0.1 ? 'success' : 'retry'}`,
      () => `fx_rate=EUR/USD ${(1.07 + Math.random() * 0.04).toFixed(4)}`,
      () => `inventory_alerts=${Math.floor(Math.random() * 4)} sku(s) below reorder point`,
      () => `kpi_app_users_active=${10 + Math.floor(Math.random() * 4)}`,
      () => `sellerboard_ad_spend=€${(120 + Math.random() * 60).toFixed(2)} acos=${(15 + Math.random() * 8).toFixed(1)}%`,
    ];

    const lines = [];
    for (let i = 0; i < 60; i++) {
      const t = new Date(startTime.getTime() + i * 1000);
      const ts = `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
      const metric = metrics[Math.floor(Math.random() * metrics.length)]();
      lines.push(`[${ts}] ${metric}`);
    }
    const blob = lines.join('\n') + '\n';
    streams.forEach((el) => { el.textContent = blob.repeat(2); });
  };

  /* ---------- 0c. prompt bg: type queries, pause, delete, type next ---------- */
  const initPromptBg = () => {
    const typed = document.querySelector('.prompt-typed');
    if (!typed) return;

    const queries = [
      "SELECT month, revenue - cogs - opex AS net_margin\n           FROM   mart_pnl_monthly\n           ORDER  BY month DESC;",
      "SELECT channel, SUM(revenue_eur)\n           FROM   fct_orders\n           WHERE  order_date >= '2026-05-01'\n           GROUP  BY channel;",
      "REFRESH MATERIALIZED VIEW marts.mart_kpi_weekly;",
      "SELECT vendor_name, AVG(match_conf)\n           FROM   fct_invoices\n           WHERE  matched_at >= NOW() - INTERVAL '7 days'\n           GROUP  BY vendor_name\n           HAVING AVG(match_conf) < 0.85;",
    ];

    let qi = 0;

    const type = async (text) => {
      for (let i = 0; i <= text.length; i++) {
        typed.textContent = text.slice(0, i);
        await sleep(28 + Math.random() * 35);
      }
    };
    const erase = async () => {
      const cur = typed.textContent;
      for (let i = cur.length; i >= 0; i--) {
        typed.textContent = cur.slice(0, i);
        await sleep(10);
      }
    };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const loop = async () => {
      while (true) {
        await type(queries[qi]);
        await sleep(2200);
        await erase();
        await sleep(400);
        qi = (qi + 1) % queries.length;
      }
    };
    loop();
  };

  /* ---------- 1. animated background canvas (particles + connections) ---------- */
  const initCanvas = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;
    const COUNT = 50;

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };

    const seed = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
      }));
    };

    let mouse = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX * devicePixelRatio;
      mouse.y = e.clientY * devicePixelRatio;
    });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const linkDist = 140 * devicePixelRatio;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // pulled by mouse slightly
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const md = Math.hypot(dx, dy);
        if (md < 200 * devicePixelRatio) {
          p.x += dx * 0.001;
          p.y += dy * 0.001;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 92, 255, 0.5)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0, 225, 255, ${alpha})`;
            ctx.lineWidth = devicePixelRatio * 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    };

    resize(); seed(); tick();
    window.addEventListener('resize', () => { resize(); seed(); });
  };

  /* ---------- 2. custom cursor ---------- */
  const initCursor = () => {
    const cursor = document.querySelector('.cursor-glow');
    if (!cursor || matchMedia('(max-width: 768px)').matches) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, inside = false;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!inside) {
        inside = true;
        cx = tx; cy = ty; // snap on first move, no jump from 0,0
        cursor.classList.add('is-visible');
        document.body.classList.add('cursor-hidden');
      }
    });

    // when mouse leaves the window, hide the custom dot AND show native cursor again
    document.addEventListener('mouseleave', () => {
      inside = false;
      cursor.classList.remove('is-visible');
      document.body.classList.remove('cursor-hidden');
    });
    document.addEventListener('mouseenter', () => {
      inside = true;
      cursor.classList.add('is-visible');
      document.body.classList.add('cursor-hidden');
    });

    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    document.querySelectorAll('a, button, .stack-card, .project').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  };

  /* ---------- 3. scroll reveal (IntersectionObserver) ---------- */
  const initReveal = () => {
    const els = document.querySelectorAll('[data-animate]');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- 4. nav: active link + mobile toggle ---------- */
  const initNav = () => {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.primary-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      nav.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const links = document.querySelectorAll('[data-nav]');
    const sections = Array.from(links).map((a) => document.querySelector(a.getAttribute('href')));
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          links.forEach((a) => {
            a.classList.toggle('is-active', a.getAttribute('href') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((s) => s && io.observe(s));
  };

  /* ---------- 5. magnetic buttons ---------- */
  const initMagnetic = () => {
    if (matchMedia('(max-width: 768px)').matches) return;
    // subtle: padding 80px, strength 4 (higher = gentler pull). Snap-back on release.
    const PADDING = 80;
    const STRENGTH = 4;
    const ACTIVE_EASE = 'transform 0.3s ease-out';
    const REST_EASE   = 'transform 0.6s ease-in-out';

    document.querySelectorAll('.btn, .magnetic').forEach((el) => {
      el.style.willChange = 'transform';
      let active = false;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const within = Math.abs(dx) < r.width / 2 + PADDING &&
                       Math.abs(dy) < r.height / 2 + PADDING;
        if (within) {
          if (!active) { el.style.transition = ACTIVE_EASE; active = true; }
          el.style.transform = `translate3d(${dx / STRENGTH}px, ${dy / STRENGTH}px, 0)`;
        } else if (active) {
          el.style.transition = REST_EASE;
          el.style.transform = 'translate3d(0,0,0)';
          active = false;
        }
      };
      window.addEventListener('mousemove', onMove, { passive: true });
    });
  };

  /* ---------- 5b. animated text (scroll-lit characters) ---------- */
  const initAnimatedText = () => {
    const targets = document.querySelectorAll('[data-animate-text]');
    if (!targets.length) return;

    targets.forEach((el) => {
      const raw = el.textContent;
      el.textContent = '';
      // wrap each char in a span; preserve whole-word wrapping via word-spans
      const words = raw.split(' ');
      const allChars = [];
      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';
        Array.from(word).forEach((ch) => {
          const charSpan = document.createElement('span');
          charSpan.textContent = ch;
          charSpan.className = 'atxt-char';
          wordSpan.appendChild(charSpan);
          allChars.push(charSpan);
        });
        el.appendChild(wordSpan);
        if (wi < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });

      // tie char opacity to scroll progress between [start 0.8] and [end 0.2]
      // i.e. begins illuminating when top of paragraph passes 80% viewport,
      // finishes when bottom of paragraph passes 20% viewport.
      const update = () => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.8 - r.top;            // distance scrolled past trigger
        const totalRange = (vh * 0.8) + r.height - (vh * 0.2);
        const progress = Math.max(0, Math.min(1, start / totalRange));
        const n = allChars.length;
        allChars.forEach((c, i) => {
          const charStart = i / n;
          const charEnd = charStart + (1 / n);
          // ramp from 0.2 -> 1 within the char's window
          let op;
          if (progress < charStart) op = 0.2;
          else if (progress > charEnd) op = 1;
          else op = 0.2 + 0.8 * ((progress - charStart) / (charEnd - charStart));
          c.style.opacity = op;
        });
      };

      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    });
  };

  /* ---------- 5c. logo marquee (replaces static stack section) ---------- */
  const initLogoMarquee = () => {
    const marquee = document.querySelector('[data-marquee]');
    if (!marquee) return;
    // duplicate the row contents once so the keyframe -50% translate loops seamlessly
    marquee.querySelectorAll('.marquee-row').forEach((row) => {
      row.innerHTML = row.innerHTML + row.innerHTML;
    });
  };

  /* ---------- 6. project card subtle parallax tilt ---------- */
  const initTilt = () => {
    if (matchMedia('(max-width: 768px)').matches) return;
    document.querySelectorAll('.stack-card, .about-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${py * -4}deg) rotateY(${px * 4}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  /* ---------- 7. project filter chips ---------- */
  const initFilters = () => {
    const chips = document.querySelectorAll('.chip-filter');
    const slots = document.querySelectorAll('.project-slot[data-tags]');
    if (!chips.length || !slots.length) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const filter = chip.dataset.filter;
        slots.forEach((s) => {
          const tags = (s.dataset.tags || '').split(' ');
          const show = filter === 'all' || tags.includes(filter);
          s.classList.toggle('is-hidden', !show);
        });
      });
    });
  };

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initBgSwitcher();
    initKpiBg();
    initPromptBg();
    initCanvas();
    initCursor();
    initReveal();
    initNav();
    initMagnetic();
    initAnimatedText();
    initLogoMarquee();
    initTilt();
    initFilters();
  });
})();
