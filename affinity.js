/**
 * TARKI — Product affinity scoring
 *
 * Computes how well a product fits each of the two site modes:
 *   - "city"     (Для дома)    designer / aesthetic / urban
 *   - "country"  (Для дачи)    practical / family / village
 *
 * Score is in [0, 1]. Both scores are independent — a product can be
 * 0.9 / 0.9 (universal) or 0.9 / 0.2 (strongly leaning).
 *
 * Pure rules-based: derived from category + materials + a few signal
 * heuristics (price band, isBestseller). No ML, no manual overrides
 * yet — fully reproducible by re-running this script.
 *
 * Public API:
 *   TARKI_AFFINITY.score(product)        → { city: number, country: number }
 *   TARKI_AFFINITY.scoreFor(product, m)  → number  (m = 'city' | 'country')
 *   TARKI_AFFINITY.annotateAll()         → mutates window.TARKI_PRODUCTS to add `.affinity`
 */
(function () {
  'use strict';

  /**
   * Base affinity by category — represents the "default reading" of
   * this product type when the buyer hasn't said anything else.
   */
  const CATEGORY_BASE = {
    // ----- Home / interior categories -----
    armchairs: { city: 0.85, country: 0.55 },  // mostly interior
    sofas:     { city: 0.95, country: 0.20 },  // strongly indoor
    beds:      { city: 0.98, country: 0.10 },  // almost exclusively indoor
    dining:    { city: 0.80, country: 0.70 },  // both, slight lean to indoor
    storage:   { city: 0.90, country: 0.25 },  // interior storage
    // ----- Outdoor / dacha categories -----
    terraces:  { city: 0.40, country: 0.90 },  // strongly outdoor
    loungers:  { city: 0.45, country: 0.85 },  // sun-loungers read as outdoor
    pavilions: { city: 0.20, country: 0.95 },  // exclusively outdoor structure
    swings:    { city: 0.35, country: 0.90 },  // outdoor leisure
    // ----- Universal decor -----
    pillows:   { city: 0.70, country: 0.70 },  // neutral
    rugs:      { city: 0.85, country: 0.50 }   // rugs read indoor
  };

  /**
   * Material modifiers — added on top of the category base.
   * Each modifier is averaged across the product's material list so
   * a product with 3 materials doesn't get triple the effect.
   */
  const MATERIAL_MOD = {
    // Wood
    teak:     { city: +0.10, country:  0.00 },  // exotic, premium → designer
    oak:      { city: +0.05, country: +0.05 },  // works equally
    ash:      { city:  0.00, country: +0.05 },  // light, rustic
    linden:   { city: -0.10, country: +0.10 },  // soft, traditional → dacha
    // Textile
    linen:    { city:  0.00, country:  0.00 },  // universal natural fabric
    wool:     { city: -0.05, country: +0.10 },  // cozy texture
    velour:   { city: +0.10, country: -0.10 },  // city interior signal
    // Metals & outdoor synthetics
    aluminum: { city: -0.05, country: +0.10 },  // lightweight outdoor frame
    steel:    { city:  0.00, country: +0.05 },  // utilitarian, works both
    rattan:   { city: -0.05, country: +0.15 },  // strong resort/garden signal
    polymer:  { city: -0.15, country: +0.10 },  // utilitarian outdoor
    brass:    { city: +0.10, country: -0.05 },  // refined detail → designer
    // Decorative
    ceramic:  { city: -0.05, country: +0.05 },  // craft, slight outdoor
    glass:    { city: +0.05, country:  0.00 }   // refined tabletop signal
  };

  // Price thresholds where buying intent shifts noticeably
  const PRICE_PREMIUM    = 100000;  // ₽ — above this leans designer/interior
  const PRICE_ACCESSIBLE =  20000;  // ₽ — below this leans dacha/practical

  function clamp01(n) {
    if (n < 0) return 0;
    if (n > 1) return 1;
    return n;
  }

  /**
   * Round to 2 decimals — keeps comparisons against thresholds stable
   * across floating-point quirks (0.7 − 0.025 − 0.05 = 0.6499… in JS).
   */
  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /**
   * @param {Object} product — entry from TARKI_PRODUCTS
   * @returns {{city: number, country: number}}
   */
  function score(product) {
    const base = CATEGORY_BASE[product.category] || { city: 0.5, country: 0.5 };
    let city    = base.city;
    let country = base.country;

    // Material modifiers, averaged across the material list
    const materials = product.materials || [];
    if (materials.length > 0) {
      const perMat = 1 / materials.length;
      materials.forEach((m) => {
        const mod = MATERIAL_MOD[m];
        if (!mod) return;
        city    += mod.city    * perMat;
        country += mod.country * perMat;
      });
    }

    // Price signal — premium leans city, accessible leans country
    if (product.price >= PRICE_PREMIUM) {
      city    += 0.05;
      country -= 0.05;
    } else if (product.price <= PRICE_ACCESSIBLE) {
      city    -= 0.05;
      country += 0.05;
    }

    // Bestseller signal — neutral nudge upward for both
    // (popular items deserve to be shown a bit higher in either mode)
    if (product.isBestseller) {
      city    += 0.03;
      country += 0.03;
    }

    return { city: round2(clamp01(city)), country: round2(clamp01(country)) };
  }

  function scoreFor(product, mode) {
    const s = score(product);
    return mode === 'country' ? s.country : s.city;
  }

  /**
   * Annotate every product in TARKI_PRODUCTS with an `affinity` field.
   * Idempotent — safe to call multiple times.
   */
  function annotateAll() {
    const products = window.TARKI_PRODUCTS || [];
    products.forEach((p) => { p.affinity = score(p); });
    return products.length;
  }

  // Counterpart selection thresholds
  const UNIVERSAL_FLOOR  = 0.75;  // both affinities ≥ this → no need to cross-recommend
  const COUNTERPART_MIN  = 0.65;  // counterpart must be at least this strong in the opposite mode

  /**
   * Find a single "other-mode" recommendation for the given product.
   * Used by the product page to soften mis-segmentation: if the user
   * picked one lifestyle but lands on something that has a meaningful
   * alternative for the other lifestyle, we surface that alternative.
   *
   * Logic:
   *   - "Opposite mode" = the one the user isn't currently in.
   *   - Candidate pool: same category, excluding the current product.
   *   - A candidate must be genuinely strong (≥ COUNTERPART_MIN) in
   *     the opposite mode — otherwise the cross-recommendation feels
   *     contrived.
   *   - If the current product is already universal (both modes ≥
   *     UNIVERSAL_FLOOR), we skip the block entirely; the product
   *     itself already speaks to both audiences.
   *
   * Returns null when no meaningful counterpart exists.
   *
   * @param {Object} product           the product currently being viewed
   * @param {'city'|'country'} mode    the active site mode
   * @returns {Object|null}
   */
  function findCounterpart(product, mode) {
    const own = product && product.affinity;
    if (!own) return null;
    if (own.city >= UNIVERSAL_FLOOR && own.country >= UNIVERSAL_FLOOR) return null;

    const opposite = mode === 'country' ? 'city' : 'country';

    const candidates = (window.TARKI_PRODUCTS || []).filter((p) =>
      p.id !== product.id &&
      p.category === product.category &&
      p.affinity && p.affinity[opposite] >= COUNTERPART_MIN
    );
    if (!candidates.length) return null;

    candidates.sort((a, b) => (b.affinity[opposite] || 0) - (a.affinity[opposite] || 0));
    return candidates[0];
  }

  /**
   * Return TARKI_CATEGORIES sorted by their "default reading" affinity
   * for the given mode, descending. Useful for any UI that wants to
   * surface mode-relevant categories first (homepage rail, mega menus, etc.).
   *
   * Uses CATEGORY_BASE directly — that's the canonical signal for what
   * each category means in each mode, before product-level modifiers.
   *
   * @param {'city'|'country'} mode
   * @returns {Object[]}  fresh copy of TARKI_CATEGORIES, sorted
   */
  function categoriesByMode(mode) {
    const cats = (window.TARKI_CATEGORIES || []).slice();
    cats.sort((a, b) => {
      const sa = (CATEGORY_BASE[a.id] || {})[mode] || 0;
      const sb = (CATEGORY_BASE[b.id] || {})[mode] || 0;
      return sb - sa;
    });
    return cats;
  }

  window.TARKI_AFFINITY = {
    score, scoreFor, annotateAll, categoriesByMode, findCounterpart
  };

  // Annotate immediately so by the time catalog/product scripts run,
  // every product already has `.affinity` available.
  if (window.TARKI_PRODUCTS) annotateAll();
})();
