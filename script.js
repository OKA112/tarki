/* ==========================================================================
   TARKI — interactions
   ========================================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ----------------------------------------------------------------
     1. LANGUAGE TOGGLE — swaps text via data-ru / data-en attributes
     ---------------------------------------------------------------- */
  function setLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    const attr = `data-${lang}`;

    $$('[data-ru], [data-en]').forEach((el) => {
      const val = el.getAttribute(attr);
      if (val == null) return;
      // preserve <em> tags
      if (/<em>/.test(val)) el.innerHTML = val;
      else el.textContent = val;
    });

    // title + meta
    const title = document.querySelector(`title`);
    if (title?.getAttribute(attr)) title.textContent = title.getAttribute(attr);
    const desc = document.querySelector('meta[name="description"]');
    if (desc?.getAttribute(attr)) desc.setAttribute('content', desc.getAttribute(attr));

    // toggle button states
    $$('[data-lang-btn]').forEach((btn) => {
      const active = btn.dataset.langBtn === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { localStorage.setItem('tarki-lang', lang); } catch (e) {}
  }

  $$('[data-lang-btn]').forEach((btn) =>
    btn.addEventListener('click', () => setLang(btn.dataset.langBtn))
  );
  try {
    const saved = localStorage.getItem('tarki-lang');
    if (saved) setLang(saved);
  } catch (e) {}

  /* ----------------------------------------------------------------
     1b. MODE TOGGLE — city / country (style switcher)
     ---------------------------------------------------------------- */
  function setMode(mode, animate = true) {
    if (mode !== 'country') mode = 'city';
    document.documentElement.setAttribute('data-mode', mode);
    // toggle button states
    $$('[data-mode-btn]').forEach((btn) => {
      const active = btn.dataset.modeBtn === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // animate sliding pill
    requestAnimationFrame(() => positionPill(animate));
    // swap text on i18n elements that have country-specific copy
    swapModeCopy();
    try { localStorage.setItem('tarki-mode', mode); } catch (e) {}
  }
  function positionPill(animate = true) {
    const grp = $('.mode'); if (!grp) return;
    const pill = grp.querySelector('.mode-pill'); if (!pill) return;
    const active = grp.querySelector('[data-mode-btn].active');
    if (!active) return;
    if (!animate) pill.style.transition = 'none';
    const g = grp.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    pill.style.left  = (a.left - g.left) + 'px';
    pill.style.width = a.width + 'px';
    if (!animate) requestAnimationFrame(() => pill.style.transition = '');
  }
  /* When mode changes, swap copy on elements that carry country-specific text
     Convention: data-ru / data-en (default, city) and data-ru-c / data-en-c (country) */
  function swapModeCopy() {
    const mode = document.documentElement.dataset.mode || 'city';
    const lang = document.documentElement.dataset.lang || 'ru';
    const baseAttr = `data-${lang}`;
    const countryAttr = `data-${lang}-c`;
    $$('[' + countryAttr + ']').forEach((el) => {
      const val = mode === 'country' ? el.getAttribute(countryAttr) : el.getAttribute(baseAttr);
      if (val == null) return;
      if (/<em>/.test(val)) el.innerHTML = val;
      else el.textContent = val;
    });
  }
  // Initial setup — read saved mode (set before transitions kick in)
  document.documentElement.classList.add('no-theme-tx');
  try {
    const savedMode = localStorage.getItem('tarki-mode');
    setMode(savedMode === 'country' ? 'country' : 'city', false);
  } catch (e) { setMode('city', false); }
  // Remove the "no-transition" guard after the first paint so subsequent toggles animate
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('no-theme-tx')));

  $$('[data-mode-btn]').forEach((btn) =>
    btn.addEventListener('click', () => setMode(btn.dataset.modeBtn))
  );
  // Public hook for the welcome screen and any future caller that needs
  // to switch site mode programmatically (analytics-driven prompts, etc.)
  window.tarkiSetMode = setMode;
  // Reposition pill on resize and font-load (font swap can shift button widths)
  window.addEventListener('resize', () => positionPill(false));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => positionPill(false));
  }

  // Bulletproof: any time the active button changes size (font swap,
  // CSS update, lang change altering text width), re-sync the pill.
  if ('ResizeObserver' in window) {
    const modeGrp = $('.mode');
    if (modeGrp) {
      const ro = new ResizeObserver(() => positionPill(false));
      $$('[data-mode-btn]', modeGrp).forEach((btn) => ro.observe(btn));
    }
  }

  // Also re-run swapModeCopy whenever language is changed manually
  const _origSetLang = setLang;
  // Wrap setLang so language change keeps mode-specific copy intact
  window.tarkiSetLang = (l) => { _origSetLang(l); swapModeCopy(); };
  $$('[data-lang-btn]').forEach((btn) =>
    btn.addEventListener('click', () => swapModeCopy())
  );

  /* ----------------------------------------------------------------
     2. CUSTOM CURSOR — magnetic interactions on desktop only
     ---------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    const cursor = $('.cursor');
    const dot = $('.cursor-dot');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my, dx = mx, dy = my;

    // Initial placement so cursor is visible before first move
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dx = mx; dy = my;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      // Direct fallback for the outer ring so it never disappears
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    function tick() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // hover targets
    $$('a, button, [data-magnetic], .product, .cat-card, .show-card, .mat').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });

  }

  /* ----------------------------------------------------------------
     3. MAGNETIC BUTTONS — slight translate on pointermove
     ---------------------------------------------------------------- */
  if (!isTouch && !prefersReduced) {
    $$('[data-magnetic]').forEach((el) => {
      // Subtle pull-toward-cursor effect on the outer button only.
      // Inner content stays put — keeps icon and text stable.
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------------
     4. NAV — background on scroll
     ---------------------------------------------------------------- */
  const nav = $('#nav');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------------
     5. MOBILE MENU
     ---------------------------------------------------------------- */
  const toggle = $('#menuToggle');
  const panel = $('#mobilePanel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('is-mobile-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', panel).forEach((a) =>
      a.addEventListener('click', () => {
        document.body.classList.remove('is-mobile-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  /* ----------------------------------------------------------------
     6. HERO — trigger load animation
     ---------------------------------------------------------------- */
  const hero = $('.hero');
  if (hero) {
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-loaded')));
  }

  /* ----------------------------------------------------------------
     7. INTERSECTION REVEAL
     ---------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '-5% 0px -10% 0px', threshold: 0.05 }
    );
    $$('[data-reveal]').forEach((el) => io.observe(el));

    // Giant wordmark animated reveal
    const wordmark = $('.giant-wordmark');
    if (wordmark) {
      const wmObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const chars = $$('span', wordmark);
              chars.forEach((c, i) => (c.style.transitionDelay = `${i * 90}ms`));
              wordmark.classList.add('in');
              wmObs.unobserve(wordmark);
            }
          });
        },
        { threshold: 0.3 }
      );
      wmObs.observe(wordmark);
    }
  } else {
    $$('[data-reveal]').forEach((el) => el.classList.add('in'));
    $('.giant-wordmark')?.classList.add('in');
  }

  /* ----------------------------------------------------------------
     8. MARQUEE — duplicate set for seamless loop
     ---------------------------------------------------------------- */
  const mq = $('#marqueeTrack');
  if (mq) {
    const set = mq.querySelector('.marquee-set');
    if (set) {
      const clone = set.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      mq.appendChild(clone);
    }
  }

  /* ----------------------------------------------------------------
     9. STATS COUNTERS
     ---------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const counters = $$('[data-counter]');
    const cObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.counter);
          const dur = 1800;
          const start = performance.now();
          const ease = (t) => 1 - Math.pow(1 - t, 3);
          function frame(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(ease(p) * target).toString();
            if (p < 1) requestAnimationFrame(frame);
          }
          if (prefersReduced) {
            el.textContent = target.toString();
          } else {
            requestAnimationFrame(frame);
          }
          cObs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cObs.observe(el));
  }

  /* ----------------------------------------------------------------
     10. PROCESS — sticky image swap based on step in view
     ---------------------------------------------------------------- */
  const processImgs = $('#processImgs');
  if (processImgs && 'IntersectionObserver' in window) {
    const imgs = $$('img', processImgs);
    const steps = $$('.step');

    const stepObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = parseInt(entry.target.dataset.step, 10);
          imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );
    steps.forEach((s) => stepObs.observe(s));
  }

  /* ----------------------------------------------------------------
     11. TESTIMONIALS — auto carousel
     ---------------------------------------------------------------- */
  const tTrack = $('#testimonials');
  const tControls = $('#tControls');
  if (tTrack && tControls) {
    const cards = $$('.t-card', tTrack);
    const dots = $$('.t-dot', tControls);
    let idx = 0;
    let timer;

    function go(n, restart = true) {
      idx = (n + cards.length) % cards.length;
      cards.forEach((c, i) => c.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      if (restart && !prefersReduced) {
        clearTimeout(timer);
        timer = setTimeout(() => go(idx + 1), 7000);
      }
    }
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

    if (!prefersReduced) {
      timer = setTimeout(() => go(idx + 1), 7000);
      tTrack.addEventListener('pointerenter', () => clearTimeout(timer));
      tTrack.addEventListener('pointerleave', () => (timer = setTimeout(() => go(idx + 1), 4000)));
    }
  }

  /* ----------------------------------------------------------------
     12. HERO PARALLAX (subtle, GPU-only)
     ---------------------------------------------------------------- */
  if (!prefersReduced && hero) {
    const heroImg = $('.hero-media img');
    let raf = null;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        if (heroImg) heroImg.style.transform = `scale(1) translate3d(0, ${y * 0.18}px, 0)`;
        raf = null;
      });
    }, { passive: true });
  }

  /* ----------------------------------------------------------------
     13. CATEGORIES RAIL — drag to scroll on desktop
     ---------------------------------------------------------------- */
  const rail = $('[data-drag-rail]');
  const cursorEl = $('.cursor');
  if (rail && !isTouch) {
    let isDown = false, startX = 0, scrollLeft = 0;

    rail.addEventListener('pointerdown', (e) => {
      isDown = true;
      rail.setPointerCapture(e.pointerId);
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
      cursorEl?.classList.add('is-drag');
    });
    rail.addEventListener('pointerleave', () => {
      isDown = false;
      cursorEl?.classList.remove('is-drag');
    });
    rail.addEventListener('pointerup', () => {
      isDown = false;
      cursorEl?.classList.remove('is-drag');
    });
    rail.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      const walk = (x - startX) * 1.6;
      rail.scrollLeft = scrollLeft - walk;
    });
  }

  /* ----------------------------------------------------------------
     14. SMOOTH ANCHOR SCROLL with nav offset
     ---------------------------------------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const off = t.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: off, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ----------------------------------------------------------------
     15. FORM — local validation + WhatsApp handoff
     ---------------------------------------------------------------- */
  const form = $('#ctaForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const cat = (data.get('category') || '').toString();
      const msg = (data.get('message') || '').toString().trim();

      if (!name || !phone) {
        const lang = document.documentElement.dataset.lang || 'ru';
        alert(lang === 'en' ? 'Please fill in your name and phone number.' : 'Пожалуйста, укажите имя и телефон.');
        return;
      }

      const lang = document.documentElement.dataset.lang || 'ru';
      const lead = lang === 'en'
        ? `Hello TARKI! My name is ${name}.\nPhone: ${phone}\nInterested in: ${cat}\n${msg ? 'Comment: ' + msg : ''}`
        : `Здравствуйте, TARKI! Меня зовут ${name}.\nТелефон: ${phone}\nИнтересует: ${cat}\n${msg ? 'Комментарий: ' + msg : ''}`;
      const url = `https://wa.me/79280000000?text=${encodeURIComponent(lead)}`;

      // Soft success feedback then open WA
      const btn = form.querySelector('.submit span');
      const original = btn.textContent;
      btn.textContent = lang === 'en' ? 'Sent — opening WhatsApp…' : 'Отправлено — открываем WhatsApp…';
      setTimeout(() => {
        window.open(url, '_blank', 'noopener');
        btn.textContent = original;
        form.reset();
      }, 600);
    });
  }
})();
