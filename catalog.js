/* ==========================================================================
   TARKI — Catalog logic
   ========================================================================== */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const PRODUCTS  = window.TARKI_PRODUCTS;
  const CATS      = window.TARKI_CATEGORIES;
  const MATS      = window.TARKI_MATERIALS;
  const PRICE_MIN = window.TARKI_PRICE_MIN;
  const PRICE_MAX = window.TARKI_PRICE_MAX;
  const t = window.TARKI_T;

  // ----- STATE -----
  // Per-page is mode-aware: country mode shows a 4-col denser grid so
  // more items per page makes sense; city mode is a 3-col gallery so
  // fewer items breathe better.
  const PER_PAGE_BY_MODE = { city: 9, country: 12 };
  const perPage = () => PER_PAGE_BY_MODE[currentMode()] || 12;

  const state = {
    search: '',
    categories: new Set(),
    materials: new Set(),
    capacities: new Set(),  // values: 1, 2, 4, 8, 12, 20
    scenarios: new Set(),   // values: intimate | family | gathering | dining | garden — country mode only
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
    isNew: false,
    isBest: false,
    sort: 'featured',
    page: 1
  };

  // ----- URL HASH SYNC -----
  function readHash() {
    const h = window.location.hash.replace(/^#\/?(catalog)?\??/, '');
    if (!h) return;
    const params = new URLSearchParams(h);
    if (params.has('q'))    state.search = params.get('q');
    if (params.has('cat'))  state.categories = new Set(params.get('cat').split(','));
    // ?parent=furniture expands to all subcategories under that parent
    if (params.has('parent')) {
      params.get('parent').split(',').forEach(pid => {
        window.TARKI_PARENT_CATS(pid).forEach(id => state.categories.add(id));
      });
    }
    if (params.has('mat'))  state.materials = new Set(params.get('mat').split(','));
    if (params.has('cap'))  state.capacities = new Set(params.get('cap').split(',').map(Number));
    if (params.has('scn'))  state.scenarios = new Set(params.get('scn').split(','));
    if (params.has('min'))  state.priceMin = +params.get('min');
    if (params.has('max'))  state.priceMax = +params.get('max');
    if (params.has('new'))  state.isNew = params.get('new') === '1';
    if (params.has('best')) state.isBest = params.get('best') === '1';
    if (params.has('sort')) state.sort = params.get('sort');
  }
  function writeHash() {
    const params = new URLSearchParams();
    if (state.search) params.set('q', state.search);
    if (state.categories.size) params.set('cat', Array.from(state.categories).join(','));
    if (state.materials.size)  params.set('mat', Array.from(state.materials).join(','));
    if (state.capacities.size) params.set('cap', Array.from(state.capacities).join(','));
    if (state.scenarios.size)  params.set('scn', Array.from(state.scenarios).join(','));
    if (state.priceMin !== PRICE_MIN) params.set('min', state.priceMin);
    if (state.priceMax !== PRICE_MAX) params.set('max', state.priceMax);
    if (state.isNew) params.set('new', '1');
    if (state.isBest) params.set('best', '1');
    if (state.sort !== 'featured') params.set('sort', state.sort);
    const s = params.toString();
    history.replaceState(null, '', s ? '#/catalog?' + s : 'catalog.html');
  }

  // ----- WISHLIST UI bindings -----
  // The shared wishlist module (wishlist.js) owns storage + persistence.
  // Here we only react to its CHANGE_EVENT to keep this page's UI in sync.
  const wishlist = window.TARKI_WISHLIST;

  function updateWishlistBadge() {
    const badge = $('#wishCount');
    if (!badge) return;
    const n = wishlist.count();
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  // One central listener — any place that mutates the wishlist triggers this.
  document.addEventListener(wishlist.CHANGE_EVENT, () => {
    updateWishlistBadge();
    updateWishlistDrawer();
  });

  // ----- LANG -----
  function lang() { return document.documentElement.dataset.lang || 'ru'; }

  // ----- FILTERS UI BUILD -----
  function buildFilters() {
    const PARENTS = window.TARKI_PARENTS;
    const cat = $('#filterCategory');
    // Group categories by parent — render each parent as collapsible group
    let html = '';
    PARENTS.forEach(parent => {
      const subs = CATS.filter(c => c.parent === parent.id);
      const subIds = subs.map(s => s.id);
      const selectedInGroup = subIds.filter(id => state.categories.has(id)).length;
      const total = PRODUCTS.filter(p => subIds.includes(p.category)).length;
      const allSelected = selectedInGroup === subIds.length && subIds.length > 0;
      const someSelected = selectedInGroup > 0 && !allSelected;
      html += `<li class="filter-parent">
        <label class="parent-row">
          <input type="checkbox" data-parent="${parent.id}" ${allSelected ? 'checked' : ''} ${someSelected ? 'data-indeterminate="1"' : ''}/>
          <span class="lbl" data-ru="${parent.ru}" data-en="${parent.en}">${parent.ru}</span>
          <span class="count">${total}</span>
        </label>
        <ul class="sub-list">${subs.map(c => {
          const cnt = PRODUCTS.filter(p => p.category === c.id).length;
          return `<li><label><input type="checkbox" data-cat="${c.id}" ${state.categories.has(c.id) ? 'checked' : ''}/><span class="lbl" data-ru="${c.ru}" data-en="${c.en}">${c.ru}</span><span class="count">${cnt}</span></label></li>`;
        }).join('')}</ul>
      </li>`;
    });
    cat.innerHTML = html;
    // Apply indeterminate state after render (DOM property, not attribute)
    $$('input[data-indeterminate="1"]', cat).forEach(inp => { inp.indeterminate = true; });
    const mat = $('#filterMaterial');
    mat.innerHTML = MATS.map(m => {
      const cnt = PRODUCTS.filter(p => p.materials.includes(m.id)).length;
      return `<li><label><input type="checkbox" data-mat="${m.id}" ${state.materials.has(m.id) ? 'checked' : ''}/><span class="lbl" data-ru="${m.ru}" data-en="${m.en}">${m.ru}</span><span class="count">${cnt}</span></label></li>`;
    }).join('');

    // capacity / scenario inputs are already in HTML — just sync state
    $$('#filterCapacity input[data-cap]').forEach(inp => {
      inp.checked = state.capacities.has(+inp.dataset.cap);
    });
    $$('#filterScenario input[data-scn]').forEach(inp => {
      inp.checked = state.scenarios.has(inp.dataset.scn);
    });
    $('#flagNew').checked  = state.isNew;
    $('#flagBest').checked = state.isBest;
  }

  // ----- PRICE RANGE -----
  function initPriceRange() {
    const min = $('#priceMin'), max = $('#priceMax');
    min.min = PRICE_MIN; min.max = PRICE_MAX; min.value = state.priceMin;
    max.min = PRICE_MIN; max.max = PRICE_MAX; max.value = state.priceMax;
    updateRangeUI();
  }
  function updateRangeUI() {
    $('#priceMinVal').textContent = formatPrice(state.priceMin);
    $('#priceMaxVal').textContent = formatPrice(state.priceMax);
    const span = PRICE_MAX - PRICE_MIN;
    const lf = ((state.priceMin - PRICE_MIN) / span) * 100;
    const rf = ((state.priceMax - PRICE_MIN) / span) * 100;
    $('#rangeFill').style.left  = lf + '%';
    $('#rangeFill').style.right = (100 - rf) + '%';
  }
  function formatPrice(n) {
    const l = lang();
    if (l === 'en') return '₽' + n.toLocaleString('en-US');
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  /**
   * Whether a product matches a given scenario tag. Scenarios are
   * derived live from category + capacity so we don't have to maintain
   * a separate hand-curated taxonomy.
   *
   *   intimate    — 1–2 seats, or any pillow/rug (cozy individual touch)
   *   family      — 3–6 seats (a typical family-sized terrace/dining)
   *   gathering   — 7+ seats (pavilions, large dining, big terraces)
   *   dining      — any dining set, or pavilions (which host dinners)
   *   garden      — pavilions, swings, terraces (open-air specifically)
   */
  function matchesScenario(p, scenario) {
    const cap = p.capacity || 0;
    switch (scenario) {
      case 'intimate':  return cap === 1 || cap === 2 || p.category === 'pillows' || p.category === 'rugs';
      case 'family':    return cap >= 3 && cap <= 6;
      case 'gathering': return cap >= 7;
      case 'dining':    return p.category === 'dining' || p.category === 'pavilions';
      case 'garden':    return p.category === 'pavilions' || p.category === 'swings' || p.category === 'terraces';
      default:          return false;
    }
  }

  // ----- FILTER LOGIC -----
  function filterProducts() {
    const q = state.search.trim().toLowerCase();
    return PRODUCTS.filter(p => {
      // search
      if (q) {
        const hay = (p.nameRu + ' ' + p.nameEn + ' ' + p.shortDescRu + ' ' + p.shortDescEn + ' ' +
                     p.materials.map(m => window.TARKI_MAT(m)?.ru + ' ' + window.TARKI_MAT(m)?.en).join(' ') + ' ' +
                     window.TARKI_CAT(p.category)?.ru + ' ' + window.TARKI_CAT(p.category)?.en + ' ' +
                     (p.capacity ? p.capacity + ' чел persons' : '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (state.categories.size && !state.categories.has(p.category)) return false;
      if (state.materials.size && !p.materials.some(m => state.materials.has(m))) return false;
      // Capacity / scenario filters only apply in country mode — keeps
      // city users from being filtered by criteria they can't even see.
      const isCountry = currentMode() === 'country';
      if (isCountry && state.capacities.size) {
        const ok = Array.from(state.capacities).some(c => {
          if (c === 1)  return p.capacity === 1;
          if (c === 2)  return p.capacity === 2;
          if (c === 4)  return p.capacity >= 3 && p.capacity <= 4;
          if (c === 8)  return p.capacity >= 5 && p.capacity <= 8;
          if (c === 12) return p.capacity >= 9 && p.capacity <= 12;
          if (c === 20) return p.capacity >= 13;
          return false;
        });
        if (!ok) return false;
      }
      if (isCountry && state.scenarios.size) {
        const ok = Array.from(state.scenarios).some(scn => matchesScenario(p, scn));
        if (!ok) return false;
      }
      if (p.price < state.priceMin || p.price > state.priceMax) return false;
      if (state.isNew && !p.isNew) return false;
      if (state.isBest && !p.isBestseller) return false;
      return true;
    });
  }

  /**
   * Active "site mode" (city / country) — picked up live from the html attribute
   * the mode toggle writes to. Falls back to 'city' if not set.
   */
  function currentMode() {
    return document.documentElement.dataset.mode === 'country' ? 'country' : 'city';
  }

  function sortProducts(list) {
    const arr = list.slice();
    switch (state.sort) {
      case 'price-asc':  arr.sort((a, b) => a.price - b.price); break;
      case 'price-desc': arr.sort((a, b) => b.price - a.price); break;
      case 'new':        arr.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'name':       arr.sort((a, b) => t(a, lang(), 'name').localeCompare(t(b, lang(), 'name'))); break;
      case 'featured':
      default: {
        // Mode-aware "Featured" — picks up the active mode and shows
        // best-fit products on top. Tie-break by bestseller flag so
        // popular items don't sink even if a niche product scored higher.
        const mode = currentMode();
        arr.sort((a, b) => {
          const da = (a.affinity && a.affinity[mode]) || 0;
          const db = (b.affinity && b.affinity[mode]) || 0;
          if (db !== da) return db - da;
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
        });
      }
    }
    return arr;
  }

  // ----- RENDER GRID -----
  function renderGrid() {
    const list = sortProducts(filterProducts());
    const grid = $('#productGrid');
    const empty = $('#emptyState');
    const more  = $('#loadMoreWrap');
    const pp    = perPage();
    const lim   = state.page * pp;
    const visible = list.slice(0, lim);

    $('#resultCount').textContent = list.length;

    if (!list.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      more.hidden  = true;
      return;
    }
    empty.hidden = true;
    more.hidden  = list.length <= lim;

    const wishIds = wishlist.all();
    grid.innerHTML = visible.map((p, idx) => {
      const cat = window.TARKI_CAT(p.category);
      const isFav = wishIds.includes(p.id);
      const meta = p.capacity ? (p.capacity + (lang() === 'en' ? ' seats' : ' пер.')) : '';
      return `
        <article class="card" style="--i:${idx % pp}">
          <a href="product.html?id=${p.id}" class="card-link" aria-label="${t(p, lang(), 'name')}">
            <div class="card-media">
              <img class="img-1" src="${p.images[0]}" alt="${t(p, lang(), 'name')}" loading="lazy"/>
              <img class="img-2" src="${p.images[1] || p.images[0]}" alt="" loading="lazy"/>
              <div class="card-tags">
                ${p.isNew ? `<span class="card-tag is-new" data-ru="Новинка" data-en="New">${lang() === 'en' ? 'New' : 'Новинка'}</span>` : ''}
                ${p.isBestseller ? `<span class="card-tag is-best" data-ru="Хит" data-en="Bestseller">${lang() === 'en' ? 'Bestseller' : 'Хит'}</span>` : ''}
              </div>
            </div>
          </a>
          <button class="card-fav ${isFav ? 'is-fav' : ''}" data-fav="${p.id}" aria-label="Избранное">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="card-quick" data-quick="${p.id}" aria-label="Быстрый просмотр">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <div class="card-body">
            <a href="product.html?id=${p.id}" class="card-info">
              <div class="card-cat">${t(cat, lang(), '')}</div>
              <div class="card-name">${t(p, lang(), 'name')}</div>
              ${meta ? `<div class="card-meta">${p.sizeRu && lang() !== 'en' ? p.sizeRu : (p.sizeEn || '')} · ${meta}</div>` : ''}
            </a>
            <div class="card-price">${formatPrice(p.price).replace('₽', lang() === 'en' ? '₽' : '₽')}</div>
          </div>
        </article>`;
    }).join('');
  }

  // ----- CHIPS -----
  function renderChips() {
    const chips = $('#chips');
    const items = [];
    state.categories.forEach(id => items.push({ k: 'cat', id, label: t(window.TARKI_CAT(id), lang(), '') }));
    state.materials.forEach(id => items.push({ k: 'mat', id, label: t(window.TARKI_MAT(id), lang(), '') }));
    state.capacities.forEach(c => {
      const labels = { 1: lang() === 'en' ? '1 seat' : '1 место',
                       2: lang() === 'en' ? '2 seats' : '2 места',
                       4: lang() === 'en' ? '3–4 people' : '3–4 персоны',
                       8: lang() === 'en' ? '5–8 people' : '5–8 персон',
                      12: lang() === 'en' ? '9–12 people' : '9–12 персон',
                      20: lang() === 'en' ? '13+ people' : '13+ персон' };
      items.push({ k: 'cap', id: c, label: labels[c] });
    });
    state.scenarios.forEach(scn => {
      const labels = {
        family:    lang() === 'en' ? 'Family'        : 'Для семьи',
        gathering: lang() === 'en' ? 'Large group'   : 'Для компании',
        dining:    lang() === 'en' ? 'Dining'        : 'Для застолий',
        garden:    lang() === 'en' ? 'Garden'        : 'В сад'
      };
      items.push({ k: 'scn', id: scn, label: labels[scn] });
    });
    if (state.isNew)  items.push({ k: 'new',  id: 1, label: lang() === 'en' ? 'New' : 'Новинки' });
    if (state.isBest) items.push({ k: 'best', id: 1, label: lang() === 'en' ? 'Bestseller' : 'Хит сезона' });
    if (state.priceMin !== PRICE_MIN || state.priceMax !== PRICE_MAX) {
      items.push({ k: 'price', id: 0, label: formatPrice(state.priceMin) + ' — ' + formatPrice(state.priceMax) });
    }

    chips.hidden = items.length === 0;
    chips.innerHTML = items.map(i => `<span class="chip">${i.label}<button data-chip="${i.k}" data-id="${i.id}" aria-label="Удалить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>`).join('');

    // active filter count badge
    const cnt = items.length;
    $('#filterCount').textContent = cnt;
    $('#filterCount').hidden = cnt === 0;
  }

  // ----- COMMIT (apply state -> render + url) -----
  function commit() {
    writeHash();
    renderChips();
    renderGrid();
  }

  // ----- BIND -----
  function bind() {
    // search
    const search = $('#searchInput');
    const sc = $('#searchClear');
    search.value = state.search;
    sc.hidden = !state.search;
    let debounce;
    search.addEventListener('input', () => {
      sc.hidden = !search.value;
      clearTimeout(debounce);
      debounce = setTimeout(() => { state.search = search.value; state.page = 1; commit(); }, 200);
    });
    sc.addEventListener('click', () => { search.value = ''; sc.hidden = true; state.search = ''; state.page = 1; commit(); });

    // sort
    const sortSel = $('#sortSelect');
    sortSel.value = state.sort;
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; commit(); });

    // category checkboxes (event delegation) — handles BOTH parent and child
    $('#filterCategory').addEventListener('change', (e) => {
      const target = e.target;
      // Parent click → toggle all children
      if (target.dataset.parent) {
        const subIds = window.TARKI_PARENT_CATS(target.dataset.parent);
        if (target.checked) subIds.forEach(id => state.categories.add(id));
        else                 subIds.forEach(id => state.categories.delete(id));
        state.page = 1; buildFilters(); commit();
        return;
      }
      // Child click
      const id = target.dataset.cat; if (!id) return;
      if (target.checked) state.categories.add(id); else state.categories.delete(id);
      // re-render to update parent indeterminate state
      state.page = 1; buildFilters(); commit();
    });
    $('#filterMaterial').addEventListener('change', (e) => {
      const id = e.target.dataset.mat; if (!id) return;
      if (e.target.checked) state.materials.add(id); else state.materials.delete(id);
      state.page = 1; commit();
    });
    $('#filterCapacity').addEventListener('change', (e) => {
      const c = +e.target.dataset.cap; if (!c) return;
      if (e.target.checked) state.capacities.add(c); else state.capacities.delete(c);
      state.page = 1; commit();
    });
    $('#filterScenario').addEventListener('change', (e) => {
      const scn = e.target.dataset.scn; if (!scn) return;
      if (e.target.checked) state.scenarios.add(scn); else state.scenarios.delete(scn);
      state.page = 1; commit();
    });
    $('#flagNew').addEventListener('change', (e) => { state.isNew = e.target.checked; state.page = 1; commit(); });
    $('#flagBest').addEventListener('change', (e) => { state.isBest = e.target.checked; state.page = 1; commit(); });

    // price slider
    const pmin = $('#priceMin'), pmax = $('#priceMax');
    function onPrice() {
      let a = +pmin.value, b = +pmax.value;
      if (a > b - 1000) { if (this === pmin) a = b - 1000; else b = a + 1000; pmin.value = a; pmax.value = b; }
      state.priceMin = a; state.priceMax = b;
      updateRangeUI();
    }
    pmin.addEventListener('input', onPrice);
    pmax.addEventListener('input', onPrice);
    pmin.addEventListener('change', () => { state.page = 1; commit(); });
    pmax.addEventListener('change', () => { state.page = 1; commit(); });

    // chip removal
    $('#chips').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-chip]'); if (!btn) return;
      const k = btn.dataset.chip; const id = btn.dataset.id;
      if (k === 'cat') state.categories.delete(id);
      else if (k === 'mat') state.materials.delete(id);
      else if (k === 'cap') state.capacities.delete(+id);
      else if (k === 'scn') state.scenarios.delete(id);
      else if (k === 'new') state.isNew = false;
      else if (k === 'best') state.isBest = false;
      else if (k === 'price') { state.priceMin = PRICE_MIN; state.priceMax = PRICE_MAX; pmin.value = PRICE_MIN; pmax.value = PRICE_MAX; updateRangeUI(); }
      state.page = 1;
      buildFilters();
      commit();
    });

    // reset
    $('#resetFilters').addEventListener('click', () => {
      state.search = ''; state.categories.clear(); state.materials.clear();
      state.capacities.clear(); state.scenarios.clear();
      state.priceMin = PRICE_MIN; state.priceMax = PRICE_MAX;
      state.isNew = false; state.isBest = false;
      state.sort = 'featured'; state.page = 1;
      search.value = ''; sc.hidden = true; sortSel.value = 'featured';
      pmin.value = PRICE_MIN; pmax.value = PRICE_MAX; updateRangeUI();
      buildFilters(); commit();
    });

    // load more
    $('#loadMoreBtn').addEventListener('click', () => { state.page += 1; renderGrid(); });

    // grid: fav + quick view (delegated)
    $('#productGrid').addEventListener('click', (e) => {
      const fav = e.target.closest('[data-fav]');
      if (fav) {
        e.preventDefault();
        const isFav = wishlist.toggle(fav.dataset.fav);
        fav.classList.toggle('is-fav', isFav);
        const svg = fav.querySelector('svg');
        if (svg) svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
        return;
      }
      const qv = e.target.closest('[data-quick]');
      if (qv) {
        e.preventDefault();
        openQuickView(qv.dataset.quick);
      }
    });

    // mobile drawer
    const filtersEl = $('#filters'), backdrop = $('#backdrop');
    function openFilters() { filtersEl.classList.add('open'); backdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeFilters() { filtersEl.classList.remove('open'); backdrop.classList.remove('open'); document.body.style.overflow = ''; }
    $('#openFilters').addEventListener('click', openFilters);
    $('#closeFilters').addEventListener('click', closeFilters);
    backdrop.addEventListener('click', closeFilters);

    // wishlist drawer
    const wl = $('#wishlist');
    $('#openWishlist').addEventListener('click', () => { wl.classList.add('open'); wl.setAttribute('aria-hidden', 'false'); updateWishlistDrawer(); document.body.style.overflow = 'hidden'; });
    $('#wlClose').addEventListener('click', () => { wl.classList.remove('open'); wl.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; });
    wl.querySelector('.wl-backdrop').addEventListener('click', () => { wl.classList.remove('open'); document.body.style.overflow = ''; });

    // quick view close
    const qvEl = $('#quickview');
    $('#qvClose').addEventListener('click', closeQuickView);
    qvEl.querySelector('.qv-backdrop').addEventListener('click', closeQuickView);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (qvEl.classList.contains('open')) closeQuickView();
        if (wl.classList.contains('open')) wl.classList.remove('open');
        if (filtersEl.classList.contains('open')) closeFilters();
        document.body.style.overflow = '';
      }
    });

    // language change should re-render
    $$('[data-lang-btn]').forEach(btn => btn.addEventListener('click', () => {
      setTimeout(() => { buildFilters(); commit(); }, 50);
    }));
  }

  // ----- QUICK VIEW -----
  function openQuickView(id) {
    const p = window.TARKI_FIND(id);
    if (!p) return;
    const cat = window.TARKI_CAT(p.category);
    const matLabels = p.materials.map(m => t(window.TARKI_MAT(m), lang(), '')).join(' · ');
    const html = `
      <div class="qv-gallery" id="qvGallery">
        ${p.images.map((img, i) => `<img class="${i === 0 ? 'active' : ''}" src="${img}" alt="${t(p, lang(), 'name')}" loading="lazy"/>`).join('')}
        <div class="qv-dots">${p.images.map((_, i) => `<button class="qv-dot ${i === 0 ? 'active' : ''}" data-dot="${i}" aria-label="${i + 1}"></button>`).join('')}</div>
      </div>
      <div class="qv-cat">${t(cat, lang(), '')}</div>
      <h2 class="qv-name">${t(p, lang(), 'name')}</h2>
      <div class="qv-meta">
        <div class="qv-price">${formatPrice(p.price)}</div>
        <div class="qv-size">${t(p, lang(), 'size')}${p.capacity ? ' · ' + p.capacity + (lang() === 'en' ? ' pers.' : ' пер.') : ''}</div>
      </div>
      <p class="qv-desc">${t(p, lang(), 'shortDesc')}</p>
      <div class="qv-tags">${matLabels.split(' · ').map(m => `<span class="qv-tag">${m}</span>`).join('')}</div>
      <div class="qv-actions">
        <a class="btn-secondary" href="product.html?id=${p.id}" data-ru="Подробнее" data-en="Details">Подробнее</a>
        <a class="btn-primary" href="https://wa.me/79280000000?text=${encodeURIComponent('Здравствуйте! Интересует «' + p.nameRu + '».')}" target="_blank" rel="noopener">
          <span data-ru="Заказать в WhatsApp" data-en="Order via WhatsApp">Заказать в WhatsApp</span>
        </a>
      </div>`;
    $('#qvContent').innerHTML = html;

    // gallery dots
    const gallery = $('#qvGallery');
    gallery.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-dot]'); if (!dot) return;
      const i = +dot.dataset.dot;
      $$('.qv-dot', gallery).forEach((d, j) => d.classList.toggle('active', i === j));
      $$('img', gallery).forEach((im, j) => im.classList.toggle('active', i === j));
    });

    const qv = $('#quickview');
    qv.classList.add('open');
    qv.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeQuickView() {
    const qv = $('#quickview');
    qv.classList.remove('open');
    qv.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ----- WISHLIST DRAWER -----
  function updateWishlistDrawer() {
    const ids = wishlist.all();
    const body = $('#wlBody');
    if (!ids.length) {
      body.innerHTML = `<div class="wl-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="40" height="40"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <h4 class="serif" data-ru="Пока пусто" data-en="Empty for now">${lang() === 'en' ? 'Empty for now' : 'Пока пусто'}</h4>
        <p data-ru="Нажмите ♡ на любой карточке, чтобы добавить товар сюда." data-en="Tap ♡ on any card to add an item here.">${lang() === 'en' ? 'Tap ♡ on any card to add an item here.' : 'Нажмите ♡ на любой карточке, чтобы добавить товар сюда.'}</p>
      </div>`;
      return;
    }
    const items = ids.map(id => window.TARKI_FIND(id)).filter(Boolean);
    body.innerHTML = items.map(p => {
      const cat = window.TARKI_CAT(p.category);
      return `<div class="wl-item">
        <a href="product.html?id=${p.id}" class="img"><img src="${p.images[0]}" alt="${t(p, lang(), 'name')}"/></a>
        <a href="product.html?id=${p.id}" class="meta" style="text-decoration:none;color:inherit;">
          <span class="cat">${t(cat, lang(), '')}</span>
          <span class="name">${t(p, lang(), 'name')}</span>
          <span class="price">${formatPrice(p.price)}</span>
        </a>
        <button class="wl-remove" data-wl-remove="${p.id}" aria-label="Удалить">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
    }).join('');

    body.querySelectorAll('[data-wl-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.wlRemove;
        wishlist.remove(id);
        // also update visible cards
        const card = document.querySelector(`[data-fav="${id}"]`);
        if (card) { card.classList.remove('is-fav'); const s = card.querySelector('svg'); if (s) s.setAttribute('fill','none'); }
      });
    });
  }

  // Populate hero counters from data — keeps the headline honest as the
  // catalog grows without manual HTML updates.
  (function fillHeroCounters() {
    const tc = $('#totalCount');
    const cc = $('#categoriesCount');
    if (tc) tc.textContent = PRODUCTS.length;
    if (cc) cc.textContent = window.TARKI_CATEGORIES.length;
  })();

  // ----- INIT -----
  readHash();
  buildFilters();
  initPriceRange();
  bind();
  renderChips();
  renderGrid();
  updateWishlistBadge();

  // Re-render whenever the site mode changes — only relevant for "Featured"
  // sort (which is mode-aware), but cheap enough to do unconditionally.
  new MutationObserver(() => {
    state.page = 1;
    renderGrid();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  // React to browser back/forward and external hash navigation
  window.addEventListener('hashchange', () => {
    // reset state, then re-read from URL
    state.search = '';
    state.categories = new Set();
    state.materials = new Set();
    state.capacities = new Set();
    state.scenarios  = new Set();
    state.priceMin = PRICE_MIN; state.priceMax = PRICE_MAX;
    state.isNew = false; state.isBest = false;
    state.sort = 'featured'; state.page = 1;
    readHash();
    $('#searchInput').value = state.search;
    $('#searchClear').hidden = !state.search;
    $('#sortSelect').value = state.sort;
    $('#priceMin').value = state.priceMin;
    $('#priceMax').value = state.priceMax;
    updateRangeUI();
    buildFilters();
    renderChips();
    renderGrid();
  });

  // When the user flips from country to city, country-only filter state
  // (capacities, scenarios) should disappear from the chips and URL —
  // not just be hidden in the sidebar. Otherwise the city view is
  // silently filtered by criteria the user can't see.
  new MutationObserver(() => {
    if (currentMode() === 'city') {
      const hadCountryFilters = state.capacities.size || state.scenarios.size;
      state.capacities.clear();
      state.scenarios.clear();
      if (hadCountryFilters) {
        state.page = 1;
        renderChips();
        writeHash();
      }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  // Apply translations to dynamically added elements after language switch
  const observer = new MutationObserver(() => {
    if (window.tarkiSetLang) return; // handled by script.js
  });
})();
