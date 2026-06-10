/**
 * TARKI — Homepage adaptive sections
 *
 * Renders the "Избранные работы" bento on the homepage from
 * window.TARKI_PRODUCTS, picking items by mode-affinity with a small
 * diversification rule so the showcase doesn't end up as five chairs
 * in a row.
 *
 * The HTML provides five empty slots with the correct bento classes
 * (lg / md / md / wide / narrow). This script populates each slot with
 * a product card and re-runs whenever the site mode flips, with a
 * brief crossfade so the swap doesn't feel abrupt.
 */
(function () {
  'use strict';

  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Soft cap so we don't pick e.g. 5 armchairs even though they all
  // score highest. Two slots per category is enough variety for a
  // 5-card showcase without leaving high-affinity items on the table.
  const MAX_PER_CATEGORY = 2;
  const SLOTS = 5;
  const FADE_MS = 380;

  // One representative image per subcategory. Curated from the working
  // Unsplash set so we never hit a 404.
  const CATEGORY_IMG = {
    // Home
    armchairs: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80',
    sofas:     'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=80',
    beds:      'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=80',
    dining:    'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=900&q=80',
    storage:   'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
    // Garden
    terraces:  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    loungers:  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=80',
    pavilions: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=80',
    swings:    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80',
    // Decor
    pillows:   'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=900&q=80',
    rugs:      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80'
  };

  function currentMode() {
    return document.documentElement.dataset.mode === 'country' ? 'country' : 'city';
  }

  function currentLang() {
    return document.documentElement.dataset.lang === 'en' ? 'en' : 'ru';
  }

  function formatPrice(n, lang) {
    if (lang === 'en') return '₽' + n.toLocaleString('en-US');
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  /**
   * Greedy diversified pick: walk products in affinity-desc order,
   * include if the per-category quota isn't already used up.
   * @param {string} mode  'city' | 'country'
   * @param {number} n     how many to return (defaults to SLOTS)
   * @returns {Object[]}
   */
  function pick(mode, n = SLOTS) {
    const candidates = window.TARKI_PRODUCTS
      .slice()
      .sort((a, b) => {
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

    // Fallback: if diversification left us short of n (very small data
    // set, edge case), pad with the next best by raw affinity.
    if (selected.length < n) {
      for (const p of candidates) {
        if (selected.length >= n) break;
        if (!selected.includes(p)) selected.push(p);
      }
    }
    return selected;
  }

  /**
   * Build the inner HTML for one product card. Markup matches the
   * pattern that styles.css already styles via .product / .meta / etc.
   */
  function cardInner(product, lang) {
    const category = window.TARKI_CAT(product.category);
    const name     = window.TARKI_T(product, lang, 'name');
    const catLabel = window.TARKI_T(category, lang, '');
    const tag = product.isBestseller
      ? `<span class="tag" data-ru="Хит сезона" data-en="Bestseller">${lang === 'en' ? 'Bestseller' : 'Хит сезона'}</span>`
      : product.isNew
        ? `<span class="tag" data-ru="Новинка" data-en="New">${lang === 'en' ? 'New' : 'Новинка'}</span>`
        : '';

    return `
      ${tag}
      <span class="circle-cta" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
      </span>
      <div class="img"><img src="${product.images[0]}" alt="${name}" loading="lazy"/></div>
      <div class="meta">
        <div>
          <h3 class="serif">${name}</h3>
          <p>${catLabel}</p>
        </div>
        <span class="price serif">${lang === 'en' ? 'from ' : 'от '}${formatPrice(product.price, lang)}</span>
      </div>`;
  }

  /**
   * Populate the 5 slots in #featuredGrid with the current mode pick.
   * @param {boolean} animate  use a brief crossfade (default true)
   */
  function render(animate = true) {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    const slots = $$('[data-featured-slot]', grid);
    if (slots.length === 0) return;

    const lang = currentLang();
    const items = pick(currentMode(), slots.length);

    const apply = () => {
      slots.forEach((slot, i) => {
        const product = items[i];
        if (!product) return;
        slot.setAttribute('href', 'product.html?id=' + product.id);
        slot.innerHTML = cardInner(product, lang);
      });
      // re-run reveal animations on the new slots if they're already in view
      slots.forEach((s) => s.classList.add('in'));
    };

    if (!animate) { apply(); return; }

    grid.classList.add('is-swapping');
    setTimeout(() => {
      apply();
      grid.classList.remove('is-swapping');
    }, FADE_MS);
  }

  /* ----------------------------------------------------------------
     CATEGORY RAIL — ordered by mode affinity
     ---------------------------------------------------------------- */

  /**
   * Count products in a given subcategory.
   * @param {string} catId
   * @returns {number}
   */
  function productCount(catId) {
    return window.TARKI_PRODUCTS.filter((p) => p.category === catId).length;
  }

  /**
   * Russian plural picker. Takes three forms: [singular, few, many].
   *   1 → singular  ("модель")
   *   2..4 → few    ("модели")
   *   0, 5..20, 25..30 ... → many ("моделей")
   */
  function pluralRu(n, forms) {
    const abs   = Math.abs(n) % 100;
    const last  = abs % 10;
    if (abs > 10 && abs < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1)           return forms[0];
    return forms[2];
  }

  /** Localized "N models / N items" label, with proper RU plural form. */
  function countLabel(cat, lang) {
    const n = productCount(cat.id);
    if (lang === 'en') {
      // English doesn't need cat.parent check beyond the noun choice
      return n + ' ' + (cat.parent === 'decor'
        ? (n === 1 ? 'item' : 'items')
        : (n === 1 ? 'model' : 'models'));
    }
    // RU
    const noun = cat.parent === 'decor'
      ? pluralRu(n, ['позиция', 'позиции', 'позиций'])
      : pluralRu(n, ['модель', 'модели', 'моделей']);
    return n + ' ' + noun;
  }

  /**
   * Build one category card markup. Matches the .cat-card layout that
   * styles.css already styles.
   */
  function railCardMarkup(cat, index, total, lang) {
    const num = String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    const img = CATEGORY_IMG[cat.id] || CATEGORY_IMG.terraces;
    const name = window.TARKI_T(cat, lang, '');
    return `
      <a href="catalog.html#/catalog?cat=${cat.id}" class="cat-card" data-reveal>
        <span class="num">${num}</span>
        <img src="${img}" alt="${name}" loading="lazy"/>
        <div class="label">
          <h3 class="serif">${name}</h3>
          <small>${countLabel(cat, lang)}</small>
        </div>
      </a>`;
  }

  /**
   * Populate the category rail with all subcategories, ordered by
   * the active mode's affinity.
   */
  function renderRail(animate = true) {
    const rail = document.getElementById('catRail');
    if (!rail) return;

    const mode = currentMode();
    const lang = currentLang();
    const cats = window.TARKI_AFFINITY.categoriesByMode(mode);

    const html = cats
      .map((c, i) => railCardMarkup(c, i, cats.length, lang))
      .join('');

    const apply = () => {
      rail.innerHTML = html;
      // Make sure cards are revealed right away (we're past first scroll).
      rail.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in'));
      // Reset scroll position so user sees the new "first" card.
      rail.scrollLeft = 0;
    };

    if (!animate) { apply(); return; }
    rail.classList.add('is-swapping');
    setTimeout(() => {
      apply();
      rail.classList.remove('is-swapping');
    }, FADE_MS);
  }

  // ----- First paint -----
  render(false);
  renderRail(false);

  // Re-render on mode flip (the toggle pill mutates documentElement[data-mode])
  new MutationObserver(() => {
    render(true);
    renderRail(true);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  // Re-render on language flip — copy needs to match the active lang
  new MutationObserver(() => {
    render(false);
    renderRail(false);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  // Tiny public surface for QA / future use
  window.TARKI_HOMEPAGE = { render, renderRail, pick };
})();
