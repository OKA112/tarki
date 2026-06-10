/* ==========================================================================
   TARKI — Product detail page
   ========================================================================== */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const t = window.TARKI_T;
  const lang = () => document.documentElement.dataset.lang || 'ru';

  // -------- find product id from URL --------
  const params = new URLSearchParams(window.location.search);
  let id = params.get('id');
  let product = id && window.TARKI_FIND(id);
  if (!product) {
    // fallback: first bestseller
    product = window.TARKI_PRODUCTS.find(p => p.isBestseller) || window.TARKI_PRODUCTS[0];
    id = product.id;
  }

  /** Active site mode, picked up live from documentElement. */
  function currentMode() {
    return document.documentElement.dataset.mode === 'country' ? 'country' : 'city';
  }

  function formatPrice(n) {
    if (lang() === 'en') return '₽' + n.toLocaleString('en-US');
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  // Wishlist UI — storage lives in wishlist.js
  const wishlist = window.TARKI_WISHLIST;

  function updateBadge() {
    const badge = $('#wishCount');
    if (!badge) return;
    const n = wishlist.count();
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  // Single listener keeps the page in sync regardless of who mutated the list.
  document.addEventListener(wishlist.CHANGE_EVENT, () => {
    updateBadge();
    updateWlDrawer();
  });

  /**
   * Build the cross-mode discovery section. Returns an empty string
   * when no counterpart exists — keeps the render pipeline clean and
   * lets the surrounding template stay declarative.
   *
   * Intentional design: this is a soft suggestion. The headline is
   * conversational ("А вот что мы посоветуем для дачи"), not pushy
   * ("Switch your mode!"). The card links straight to the alternative
   * product — clicking it doesn't change the user's stored mode.
   */
  function buildCrossMode() {
    const mode        = currentMode();
    const counterpart = window.TARKI_AFFINITY.findCounterpart(product, mode);
    if (!counterpart) return '';

    const cat   = window.TARKI_CAT(counterpart.category);
    const en    = lang() === 'en';
    // What context are we suggesting? Opposite of the current mode.
    const isSuggestingDacha = mode === 'city';

    const eyebrow = en
      ? (isSuggestingDacha ? 'For the dacha' : 'For the home')
      : (isSuggestingDacha ? 'Для дачи'       : 'Для дома');

    const headline = en
      ? (isSuggestingDacha
          ? 'And here\'s what we\'d suggest for a <em>country</em> setting'
          : 'And here\'s what we\'d suggest for a <em>home</em> interior')
      : (isSuggestingDacha
          ? 'А вот что мы посоветуем для <em>дачи</em>'
          : 'А вот что мы посоветуем для <em>дома</em>');

    const lead = en
      ? 'Same category, different intent — chosen by how it fits the other context.'
      : 'Та же категория, другая задача — подобрано по тому, как изделие читается в другом сценарии.';

    return `
      <section class="cross-mode">
        <div class="container">
          <div class="cross-mode-grid">
            <div class="cross-mode-intro">
              <p class="eyebrow">${eyebrow}</p>
              <h2 class="serif">${headline}</h2>
              <p>${lead}</p>
            </div>
            <a href="product.html?id=${counterpart.id}" class="cross-mode-card">
              <div class="cm-img"><img src="${counterpart.images[0]}" alt="${t(counterpart, lang(), 'name')}" loading="lazy"/></div>
              <div class="cm-meta">
                <span class="cm-cat">${t(cat, lang(), '')}</span>
                <span class="cm-name">${t(counterpart, lang(), 'name')}</span>
                <span class="cm-foot">
                  <span class="cm-price">${formatPrice(counterpart.price)}</span>
                  <span class="cm-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </span>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>`;
  }

  // -------- DEMO reviews --------
  const REVIEWS = [
    { stars: 5,
      ru: 'Лучше, чем я представляла по фото. Дерево действительно живое.',
      en: 'Better than I imagined from photos. The wood is genuinely alive.',
      nameRu: 'Зарема М.', nameEn: 'Zarema M.',
      cityRu: 'Махачкала', cityEn: 'Makhachkala',
      avatar: 'https://picsum.photos/seed/rev-zarema/100/100' },
    { stars: 5,
      ru: 'Заказывал в подарок на новоселье. Сборка заняла полдня, но качество того стоит.',
      en: 'Ordered as a housewarming gift. Assembly took half a day but the quality is worth it.',
      nameRu: 'Михаил К.', nameEn: 'Mikhail K.',
      cityRu: 'Сочи', cityEn: 'Sochi',
      avatar: 'https://picsum.photos/seed/rev-mikhail/100/100' },
    { stars: 4,
      ru: 'Уже два сезона стоит на открытой террасе — никаких трещин, как обещали.',
      en: 'Two seasons in the open air — no cracks, exactly as promised.',
      nameRu: 'Тимур А.', nameEn: 'Timur A.',
      cityRu: 'Дербент', cityEn: 'Derbent',
      avatar: 'https://picsum.photos/seed/rev-timur/100/100' }
  ];

  // -------- RENDER --------
  function render() {
    const cat = window.TARKI_CAT(product.category);
    const parent = window.TARKI_CAT_PARENT(product.category);
    const isFav = wishlist.has(product.id);
    const finishes = (product.finishes || []).map(id => window.TARKI_FINISHES.find(f => f.id === id)).filter(Boolean);
    const fabrics  = (product.fabrics  || []).map(id => window.TARKI_FABRICS.find(f => f.id === id)).filter(Boolean);

    document.title = t(product, lang(), 'name') + ' · TARKI';

    const main = $('#productMain');
    main.innerHTML = `
      <!-- Breadcrumbs -->
      <nav class="crumbs container" aria-label="Хлебные крошки">
        <ol>
          <li><a href="index.html" data-ru="Главная" data-en="Home">Главная</a></li>
          <li><a href="catalog.html" data-ru="Каталог" data-en="Catalog">Каталог</a></li>
          ${parent ? `<li><a href="catalog.html#/catalog?parent=${parent.id}">${t(parent, lang(), '')}</a></li>` : ''}
          <li><a href="catalog.html#/catalog?cat=${product.category}">${t(cat, lang(), '')}</a></li>
          <li>${t(product, lang(), 'name')}</li>
        </ol>
      </nav>

      <!-- Main product block -->
      <section class="product-main">
        <div class="container">
          <div class="product-grid">
            <!-- gallery -->
            <div class="gallery">
              <div class="thumbs" id="thumbs">
                ${product.images.map((img, i) => `<button class="thumb ${i === 0 ? 'active' : ''}" data-i="${i}"><img src="${img}" alt="" loading="lazy"/></button>`).join('')}
              </div>
              <div class="main-image" id="mainImage">
                ${product.images.map((img, i) => `<img class="${i === 0 ? 'active' : ''}" src="${img}" alt="${t(product, lang(), 'name')}" loading="${i === 0 ? 'eager' : 'lazy'}"/>`).join('')}
                <div class="nav-arrows" aria-hidden="true">
                  <button id="prevImg" aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                  <button id="nextImg" aria-label="Вперёд"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
                <div class="img-count"><span id="curImg">1</span> / ${product.images.length}</div>
              </div>
            </div>

            <!-- info -->
            <div class="info-col">
              <div class="tags-row">
                ${product.isNew ? `<span class="p-tag is-new" data-ru="Новинка" data-en="New">${lang() === 'en' ? 'New' : 'Новинка'}</span>` : ''}
                ${product.isBestseller ? `<span class="p-tag is-best" data-ru="Хит" data-en="Bestseller">${lang() === 'en' ? 'Bestseller' : 'Хит сезона'}</span>` : ''}
              </div>
              <div class="p-cat">${t(cat, lang(), '')}</div>
              <h1 class="p-name">${t(product, lang(), 'name')}</h1>
              <p class="p-short">${t(product, lang(), 'shortDesc')}</p>

              <div class="p-pricerow">
                <span class="from" data-ru="от" data-en="from">${lang() === 'en' ? 'from' : 'от'}</span>
                <span class="price serif" id="livePrice">${formatPrice(product.price)}</span>
              </div>

              ${finishes.length ? `
              <div class="config-section">
                <div class="config-label"><span data-ru="Финиш" data-en="Finish">Финиш</span><span class="pick" id="pickFinish">${t(finishes[0], lang(), '')}</span></div>
                <div class="swatches" id="finishSwatches">
                  ${finishes.map((f, i) => `<button class="swatch ${i === 0 ? 'active' : ''}" data-finish="${f.id}" style="background:${f.swatch}" title="${t(f, lang(), '')}" aria-label="${t(f, lang(), '')}"></button>`).join('')}
                </div>
              </div>` : ''}

              ${fabrics.length ? `
              <div class="config-section">
                <div class="config-label"><span data-ru="Обивка / ткань" data-en="Upholstery / fabric">Обивка / ткань</span><span class="pick" id="pickFabric">${t(fabrics[0], lang(), '')}</span></div>
                <div class="swatches" id="fabricSwatches">
                  ${fabrics.map((f, i) => `<button class="swatch ${i === 0 ? 'active' : ''}" data-fabric="${f.id}" style="background:${f.swatch}" title="${t(f, lang(), '')}" aria-label="${t(f, lang(), '')}"></button>`).join('')}
                </div>
              </div>` : ''}

              <div class="config-section">
                <div class="config-label"><span data-ru="Размер" data-en="Size">Размер</span><span class="pick" id="pickSize">${t(product, lang(), 'size')}</span></div>
                <div class="size-pick" id="sizePick">
                  <button class="size-btn" data-mul="0.8" data-label-ru="S · –10 см" data-label-en="S · –10 cm">S · –10 ${lang() === 'en' ? 'cm' : 'см'}</button>
                  <button class="size-btn active" data-mul="1" data-label-ru="M · стандарт" data-label-en="M · standard">M · ${lang() === 'en' ? 'standard' : 'стандарт'}</button>
                  <button class="size-btn" data-mul="1.18" data-label-ru="L · +15 см" data-label-en="L · +15 cm">L · +15 ${lang() === 'en' ? 'cm' : 'см'}</button>
                  <button class="size-btn" data-mul="1.4" data-label-ru="XL · +30 см" data-label-en="XL · +30 cm">XL · +30 ${lang() === 'en' ? 'cm' : 'см'}</button>
                </div>
              </div>

              <div class="config-section">
                <div class="config-label"><span data-ru="Количество" data-en="Quantity">Количество</span></div>
                <div class="qty-pick">
                  <button id="qtyMinus" aria-label="Меньше">−</button>
                  <span class="val" id="qtyVal">1</span>
                  <button id="qtyPlus" aria-label="Больше">+</button>
                </div>
              </div>

              <div class="p-actions">
                <a class="btn-order" id="orderBtn" href="#" target="_blank" rel="noopener">
                  <span data-ru="Заказать в WhatsApp" data-en="Order via WhatsApp">Заказать в WhatsApp</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </a>
                <button class="btn-fav ${isFav ? 'is-fav' : ''}" id="favBtn" aria-label="Избранное">
                  <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>

              <div class="trust">
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/></svg>
                  <div><strong data-ru="Гарантия 7 лет" data-en="7-year warranty">${lang() === 'en' ? '7-year warranty' : 'Гарантия 7 лет'}</strong>${lang() === 'en' ? 'on frame and joinery' : 'на каркас и соединения'}</div>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <div><strong data-ru="Срок 4–8 недель" data-en="4–8 weeks">${lang() === 'en' ? '4–8 weeks' : 'Срок 4–8 недель'}</strong>${lang() === 'en' ? 'from approval to delivery' : 'от утверждения до сборки'}</div>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M4 4l5 5"/></svg>
                  <div><strong data-ru="Доставка по РФ" data-en="Russia-wide delivery">${lang() === 'en' ? 'Russia-wide delivery' : 'Доставка по РФ'}</strong>${lang() === 'en' ? 'free in Dagestan' : 'бесплатно по Дагестану'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Description + specs -->
      <section class="details-section">
        <div class="container">
          <div class="details-grid">
            <div>
              <h2 data-ru="<em>Подробнее</em> об изделии" data-en="<em>More</em> about this piece">${lang() === 'en' ? '<em>More</em> about this piece' : '<em>Подробнее</em> об изделии'}</h2>
            </div>
            <div>
              <div class="long-desc">
                <p>${t(product, lang(), 'desc')}</p>
                <p data-ru="Каждое изделие проходит шесть стадий шлифовки и финишное масло из ядра грецкого ореха. Соединения собираются на дубовых шкантах — никаких саморезов и ДСП внутри." data-en="Every piece goes through six sanding stages and a walnut-kernel oil finish. Joints are assembled on oak dowels — no screws or particleboard inside.">${lang() === 'en' ? 'Every piece goes through six sanding stages and a walnut-kernel oil finish. Joints are assembled on oak dowels — no screws or particleboard inside.' : 'Каждое изделие проходит шесть стадий шлифовки и финишное масло из ядра грецкого ореха. Соединения собираются на дубовых шкантах — никаких саморезов и ДСП внутри.'}</p>
              </div>

              <h3 class="serif" style="font-size:1.5rem; margin: 2rem 0 1rem;" data-ru="Характеристики" data-en="Specifications">${lang() === 'en' ? 'Specifications' : 'Характеристики'}</h3>
              <div class="specs-table">
                ${product.specs.map(s => `<div class="row"><div class="key">${t(s, lang(), '')}</div><div class="val">${t(s, lang(), 'value')}</div></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reviews -->
      <section class="reviews-section">
        <div class="container">
          <div class="reviews-head">
            <h2 data-ru="Слово <em>заказчикам</em>" data-en="From our <em>clients</em>">${lang() === 'en' ? 'From our <em>clients</em>' : 'Слово <em>заказчикам</em>'}</h2>
            <div class="rating">
              <div class="stars">★★★★★</div>
              <div class="rscore">4.9 / 5</div>
              <div class="rmeta" data-ru="на основе 43 отзывов" data-en="based on 43 reviews">${lang() === 'en' ? 'based on 43 reviews' : 'на основе 43 отзывов'}</div>
            </div>
          </div>
          <div class="reviews-grid">
            ${REVIEWS.map(r => `<div class="review">
              <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
              <blockquote>${lang() === 'en' ? r.en : r.ru}</blockquote>
              <div class="who">
                <div class="ava"><img src="${r.avatar}" alt=""/></div>
                <div>
                  <span class="name">${lang() === 'en' ? r.nameEn : r.nameRu}</span>
                  <span class="city">${lang() === 'en' ? r.cityEn : r.cityRu}</span>
                </div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </section>

      <!-- Cross-mode discovery (only when a meaningful counterpart exists) -->
      ${buildCrossMode()}

      <!-- Related -->
      <section class="related-section">
        <div class="container">
          <div class="related-head">
            <h2 data-ru="<em>Похожие</em> работы" data-en="<em>Related</em> pieces">${lang() === 'en' ? '<em>Related</em> pieces' : '<em>Похожие</em> работы'}</h2>
            <a href="catalog.html#/catalog?cat=${product.category}" data-ru="Все в категории →" data-en="All in category →">${lang() === 'en' ? 'All in category →' : 'Все в категории →'}</a>
          </div>
          <div class="related-grid" id="relatedGrid"></div>
        </div>
      </section>
    `;

    renderRelated();
    bindProductUI();
    renderStickyBar();
    initWlDrawer();
  }

  // ----- RELATED -----
  function renderRelated() {
    const related = window.TARKI_PRODUCTS
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    if (!related.length) {
      $('#relatedGrid').innerHTML = '<p style="color:var(--ink-mute)">—</p>';
      return;
    }
    const wishIds = wishlist.all();
    $('#relatedGrid').innerHTML = related.map((p, i) => {
      const cat = window.TARKI_CAT(p.category);
      const isFav = wishIds.includes(p.id);
      return `<article class="card" style="--i:${i}">
        <a href="product.html?id=${p.id}">
          <div class="card-media">
            <img class="img-1" src="${p.images[0]}" alt="${t(p, lang(), 'name')}" loading="lazy"/>
            <img class="img-2" src="${p.images[1] || p.images[0]}" alt="" loading="lazy"/>
          </div>
        </a>
        <button class="card-fav ${isFav ? 'is-fav' : ''}" data-fav="${p.id}" aria-label="Избранное">
          <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <div class="card-body">
          <a href="product.html?id=${p.id}" class="card-info" style="text-decoration:none;color:inherit;">
            <div class="card-cat">${t(cat, lang(), '')}</div>
            <div class="card-name">${t(p, lang(), 'name')}</div>
          </a>
          <div class="card-price">${formatPrice(p.price)}</div>
        </div>
      </article>`;
    }).join('');

    $('#relatedGrid').addEventListener('click', (e) => {
      const fav = e.target.closest('[data-fav]');
      if (!fav) return;
      e.preventDefault();
      const isFav = wishlist.toggle(fav.dataset.fav);
      fav.classList.toggle('is-fav', isFav);
      const svg = fav.querySelector('svg');
      if (svg) svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
    });
  }

  // ----- BIND UI -----
  let sizeMul = 1;
  let qty = 1;
  let curImg = 0;
  let curFinish = '';
  let curFabric = '';

  function setMainImage(i) {
    const imgs = $$('#mainImage img');
    const thumbs = $$('#thumbs .thumb');
    curImg = (i + imgs.length) % imgs.length;
    imgs.forEach((img, j) => img.classList.toggle('active', j === curImg));
    thumbs.forEach((t, j) => t.classList.toggle('active', j === curImg));
    $('#curImg').textContent = curImg + 1;
  }

  function updatePrice() {
    const base = product.price;
    const finishObj = window.TARKI_FINISHES.find(f => f.id === curFinish);
    const finishCharge = finishObj && curFinish === 'smoked' ? base * 0.08 : 0;
    const fabricObj = window.TARKI_FABRICS.find(f => f.id === curFabric);
    const fabricCharge = fabricObj && (curFabric === 'wool-ochre' || curFabric === 'linen-ink') ? base * 0.05 : 0;
    const total = (base + finishCharge + fabricCharge) * sizeMul * qty;
    $('#livePrice').textContent = formatPrice(Math.round(total));
    updateOrderLink(total);
  }

  function updateOrderLink(total) {
    const fObj = window.TARKI_FINISHES.find(f => f.id === curFinish);
    const fbObj = window.TARKI_FABRICS.find(f => f.id === curFabric);
    const pickedSize = $('#sizePick .size-btn.active');
    const sizeLabel = pickedSize ? pickedSize.textContent.trim() : '';
    const msg = lang() === 'en'
      ? `Hello TARKI! I'd like to order "${product.nameEn}".\nFinish: ${fObj ? fObj.en : '—'}\nFabric: ${fbObj ? fbObj.en : '—'}\nSize: ${sizeLabel}\nQuantity: ${qty}\nApprox. total: ${formatPrice(Math.round(total))}`
      : `Здравствуйте, TARKI! Хочу заказать «${product.nameRu}».\nФиниш: ${fObj ? fObj.ru : '—'}\nТкань: ${fbObj ? fbObj.ru : '—'}\nРазмер: ${sizeLabel}\nКоличество: ${qty}\nОриентир по цене: ${formatPrice(Math.round(total))}`;
    $('#orderBtn').href = 'https://wa.me/79280000000?text=' + encodeURIComponent(msg);
  }

  function bindProductUI() {
    // gallery clicks
    $('#thumbs').addEventListener('click', (e) => {
      const t = e.target.closest('.thumb'); if (!t) return;
      setMainImage(+t.dataset.i);
    });
    $('#prevImg').addEventListener('click', () => setMainImage(curImg - 1));
    $('#nextImg').addEventListener('click', () => setMainImage(curImg + 1));

    // keyboard arrows on main image area
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft')  setMainImage(curImg - 1);
      if (e.key === 'ArrowRight') setMainImage(curImg + 1);
    });

    // finish swatches
    const fs = $('#finishSwatches');
    if (fs) {
      const first = fs.querySelector('.swatch.active');
      curFinish = first ? first.dataset.finish : '';
      fs.addEventListener('click', (e) => {
        const b = e.target.closest('.swatch'); if (!b) return;
        $$('.swatch', fs).forEach(s => s.classList.remove('active'));
        b.classList.add('active');
        curFinish = b.dataset.finish;
        const obj = window.TARKI_FINISHES.find(f => f.id === curFinish);
        $('#pickFinish').textContent = obj ? t(obj, lang(), '') : '';
        updatePrice();
      });
    }
    // fabric swatches
    const fbS = $('#fabricSwatches');
    if (fbS) {
      const first = fbS.querySelector('.swatch.active');
      curFabric = first ? first.dataset.fabric : '';
      fbS.addEventListener('click', (e) => {
        const b = e.target.closest('.swatch'); if (!b) return;
        $$('.swatch', fbS).forEach(s => s.classList.remove('active'));
        b.classList.add('active');
        curFabric = b.dataset.fabric;
        const obj = window.TARKI_FABRICS.find(f => f.id === curFabric);
        $('#pickFabric').textContent = obj ? t(obj, lang(), '') : '';
        updatePrice();
      });
    }
    // size
    $('#sizePick').addEventListener('click', (e) => {
      const b = e.target.closest('.size-btn'); if (!b) return;
      $$('.size-btn', $('#sizePick')).forEach(s => s.classList.remove('active'));
      b.classList.add('active');
      sizeMul = parseFloat(b.dataset.mul);
      $('#pickSize').textContent = b.textContent.trim();
      updatePrice();
    });
    // qty
    $('#qtyMinus').addEventListener('click', () => { if (qty > 1) { qty--; $('#qtyVal').textContent = qty; updatePrice(); } });
    $('#qtyPlus').addEventListener('click', () => { if (qty < 99) { qty++; $('#qtyVal').textContent = qty; updatePrice(); } });

    // favorite
    $('#favBtn').addEventListener('click', () => {
      const isFav = wishlist.toggle(product.id);
      $('#favBtn').classList.toggle('is-fav', isFav);
      $('#favBtn svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
    });

    // initial price update
    updatePrice();
  }

  // ----- STICKY BAR -----
  function renderStickyBar() {
    const bar = document.createElement('div');
    bar.className = 'sticky-bar';
    bar.innerHTML = `
      <div class="sb-info">
        <div class="sb-name">${t(product, lang(), 'name')}</div>
        <div class="sb-price">${formatPrice(product.price)}</div>
      </div>
      <a class="sb-cta" id="sbCta" href="https://wa.me/79280000000" target="_blank" rel="noopener">
        <span data-ru="Заказать" data-en="Order">Заказать</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
      </a>`;
    document.body.appendChild(bar);
    setInterval(() => { const main = $('#orderBtn'); if (main) $('#sbCta').href = main.href; }, 800);
  }

  // ----- WISHLIST DRAWER (shared) -----
  function initWlDrawer() {
    const wl = $('#wishlist');
    $('#openWishlist').addEventListener('click', () => { wl.classList.add('open'); wl.setAttribute('aria-hidden', 'false'); updateWlDrawer(); document.body.style.overflow = 'hidden'; });
    $('#wlClose').addEventListener('click', () => { wl.classList.remove('open'); document.body.style.overflow = ''; });
    wl.querySelector('.wl-backdrop').addEventListener('click', () => { wl.classList.remove('open'); document.body.style.overflow = ''; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && wl.classList.contains('open')) { wl.classList.remove('open'); document.body.style.overflow = ''; } });
    updateBadge();
  }
  function updateWlDrawer() {
    const ids = wishlist.all();
    const body = $('#wlBody');
    if (!body) return;
    if (!ids.length) {
      body.innerHTML = `<div class="wl-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="40" height="40"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <h4 class="serif">${lang() === 'en' ? 'Empty for now' : 'Пока пусто'}</h4>
        <p>${lang() === 'en' ? 'Tap ♡ on any card to add an item here.' : 'Нажмите ♡ на любой карточке, чтобы добавить товар сюда.'}</p>
      </div>`;
      return;
    }
    const items = ids.map(id => window.TARKI_FIND(id)).filter(Boolean);
    body.innerHTML = items.map(p => {
      const cat = window.TARKI_CAT(p.category);
      return `<div class="wl-item">
        <a href="product.html?id=${p.id}" class="img"><img src="${p.images[0]}" alt=""/></a>
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
        if (id === product.id) {
          $('#favBtn').classList.remove('is-fav');
          $('#favBtn svg').setAttribute('fill', 'none');
        }
      });
    });
  }

  // language switcher should re-render (copy varies by lang)
  $$('[data-lang-btn]').forEach(btn => btn.addEventListener('click', () => {
    setTimeout(() => render(), 50);
  }));

  // Site mode change → re-render so the cross-mode block follows the
  // user's new intent. Cheap because the product page is small.
  new MutationObserver(() => render())
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  // Start
  render();
})();
