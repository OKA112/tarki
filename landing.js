/**
 * TARKI — Landing pages (/home.html, /dacha.html)
 *
 * Both landings share the same skeleton. Each page declares which mode
 * it represents via a `<body data-landing-mode="city|country">` attribute.
 * On load this script:
 *
 *   1. Sets the site mode based on the landing — clicking through to
 *      /catalog or any other page picks up the choice automatically.
 *   2. Marks the user as onboarded so the welcome screen doesn't fire
 *      again (the landing IS the welcome here).
 *   3. Renders the curated collection grid (10 items, mode-affinity
 *      sorted with category diversification) into #lCollectionGrid.
 *
 * The script is intentionally minimal — most landing structure is plain
 * HTML, and dynamic bits reuse the existing TARKI_PRODUCTS / affinity
 * modules to avoid any new data sources.
 */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const LANDING_MODE   = document.body.dataset.landingMode || 'city';
  const COLLECTION_SIZE = 10;
  const MAX_PER_CATEGORY = 2;

  function currentLang() {
    return document.documentElement.dataset.lang === 'en' ? 'en' : 'ru';
  }

  function formatPrice(n, lang) {
    if (lang === 'en') return '₽' + n.toLocaleString('en-US');
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  /* ----------------------------------------------------------------
     Auto-set mode based on landing
     ---------------------------------------------------------------- */
  function applyLandingMode() {
    if (typeof window.tarkiSetMode === 'function') {
      window.tarkiSetMode(LANDING_MODE);
    } else {
      document.documentElement.setAttribute('data-mode', LANDING_MODE);
    }
    // Mark onboarded so the welcome screen never fires from a landing
    try { localStorage.setItem('tarki-onboarded', '1'); } catch (e) {}
    try { localStorage.setItem('tarki-mode', LANDING_MODE); } catch (e) {}
  }

  /* ----------------------------------------------------------------
     Collection picker — same logic as homepage.js but with bigger N
     ---------------------------------------------------------------- */
  function pick(mode, n) {
    const candidates = window.TARKI_PRODUCTS.slice().sort((a, b) => {
      const da = (a.affinity && a.affinity[mode]) || 0;
      const db = (b.affinity && b.affinity[mode]) || 0;
      if (db !== da) return db - da;
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
    const selected = [];
    const perCategory = Object.create(null);
    for (const p of candidates) {
      if (selected.length >= n) break;
      const used = perCategory[p.category] || 0;
      if (used >= MAX_PER_CATEGORY) continue;
      selected.push(p);
      perCategory[p.category] = used + 1;
    }
    // Pad if diversification fell short
    if (selected.length < n) {
      for (const p of candidates) {
        if (selected.length >= n) break;
        if (!selected.includes(p)) selected.push(p);
      }
    }
    return selected;
  }

  function cardMarkup(product, lang) {
    const category = window.TARKI_CAT(product.category);
    const name     = window.TARKI_T(product, lang, 'name');
    const catLabel = window.TARKI_T(category, lang, '');
    const tag = product.isBestseller
      ? `<span class="card-tag is-best">${lang === 'en' ? 'Bestseller' : 'Хит'}</span>`
      : product.isNew
        ? `<span class="card-tag is-new">${lang === 'en' ? 'New' : 'Новинка'}</span>`
        : '';

    return `
      <article class="card">
        <a href="product.html?id=${product.id}" class="card-link">
          <div class="card-media">
            <img class="img-1" src="${product.images[0]}" alt="${name}" loading="lazy"/>
            <img class="img-2" src="${product.images[1] || product.images[0]}" alt="" loading="lazy"/>
            ${tag ? `<div class="card-tags">${tag}</div>` : ''}
          </div>
        </a>
        <div class="card-body">
          <a href="product.html?id=${product.id}" class="card-info">
            <div class="card-cat">${catLabel}</div>
            <div class="card-name">${name}</div>
          </a>
          <div class="card-price">${formatPrice(product.price, lang)}</div>
        </div>
      </article>`;
  }

  function renderCollection() {
    const grid = $('#lCollectionGrid');
    if (!grid) return;
    const items = pick(LANDING_MODE, COLLECTION_SIZE);
    grid.innerHTML = items.map((p) => cardMarkup(p, currentLang())).join('');
  }

  /* ----------------------------------------------------------------
     Year stamp (footer) — keeps copyright fresh
     ---------------------------------------------------------------- */
  function stampYear() {
    const y = $('#lYear');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------------
     INIT
     ---------------------------------------------------------------- */
  applyLandingMode();
  renderCollection();
  stampYear();

  // Re-render the grid when the user toggles language (copy varies).
  new MutationObserver(() => renderCollection())
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
})();
