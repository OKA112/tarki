/**
 * TARKI — Welcome screen (first-visit segmentation)
 *
 * Surfaces a full-screen choice on the very first visit, asking the user
 * what they came for. Selection is remembered in localStorage so the
 * screen never shows again (until the user clears storage or opens a
 * new device). The pill in the nav remains the live switch afterwards.
 *
 * Design constraints:
 *   - Only ever shows when there's no `tarki-onboarded` flag yet.
 *   - Hard-skippable via a "show me everything" link.
 *   - The choice maps to the same internal `data-mode` system the rest
 *     of the site already uses (`city` / `country`), so picking a card
 *     == clicking the corresponding pill button.
 *   - SEO-safe: rendered by JS, never present in HTML for crawlers.
 *
 * Usage: include this script on pages where you want the welcome to
 * appear. It only injects itself when the storage flag is missing.
 */
(function () {
  'use strict';

  const ONBOARDED_KEY = 'tarki-onboarded';
  const MODE_KEY      = 'tarki-mode';

  // Hero photos for the two cards — kept on a known-good Unsplash set.
  // The exact images can be swapped without touching markup.
  const CARD_IMG = {
    city:    'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=80',
    country: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=80'
  };

  /** @returns {boolean} */
  function alreadyOnboarded() {
    try { return !!localStorage.getItem(ONBOARDED_KEY); }
    catch (e) { return true; /* private mode → don't nag */ }
  }

  function persistChoice(mode) {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
      if (mode) localStorage.setItem(MODE_KEY, mode);
    } catch (e) { /* non-fatal */ }
  }

  /**
   * Build the welcome DOM. Returns the root element (not yet attached).
   * Markup uses data-ru / data-en attributes so the i18n layer in
   * script.js can swap copy when the user toggles language.
   */
  function buildDOM() {
    const root = document.createElement('div');
    root.className = 'welcome';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'welcome-title');
    root.innerHTML = `
      <div class="welcome-head">
        <a href="#" class="brand" aria-label="TARKI">
          <span class="dot"></span>
          <span>TARKI</span>
        </a>
        <button class="welcome-skip" data-welcome-skip
                data-ru="Показать всё" data-en="Show everything">Показать всё</button>
      </div>

      <div class="welcome-body">
        <div class="welcome-intro">
          <p class="welcome-eyebrow" data-ru="Добро пожаловать" data-en="Welcome">Добро пожаловать</p>
          <h1 class="welcome-title" id="welcome-title"
              data-ru="Что вы <em>ищете</em>?"
              data-en="What are you <em>looking for</em>?">Что вы <em>ищете</em>?</h1>
          <p class="welcome-lead"
             data-ru="Мы покажем подборку под вашу задачу. В любой момент можно переключить режим в шапке сайта."
             data-en="We'll tailor the selection to your goal. You can switch the mode in the header at any time.">
             Мы покажем подборку под вашу задачу. В любой момент можно переключить режим в шапке сайта.
          </p>
        </div>

        <div class="welcome-cards">
          ${cardMarkup({
            mode:  'city',
            tagRu: 'Дизайнерская мебель',
            tagEn: 'Designer pieces',
            titleRu: 'Современный дом',
            titleEn: 'Modern home',
            titleRuC: 'Современный дом',
            titleEnC: 'Modern home',
            descRu: 'Дизайнерские кресла, обеденные группы, текстиль и предметы декора для квартиры или городского интерьера.',
            descEn: 'Designer chairs, dining sets, textiles and decor for an apartment or urban interior.',
            iconPath: 'M3 21h18M6 21V8h6v13M14 21v-8h6v8',
            img: CARD_IMG.city
          })}
          ${cardMarkup({
            mode:  'country',
            tagRu: 'Загородный отдых',
            tagEn: 'Country retreat',
            titleRu: 'Дача и сад',
            titleEn: 'Dacha & garden',
            titleRuC: 'Дача и сад',
            titleEnC: 'Dacha & garden',
            descRu: 'Террасы, лежаки, беседки, обеденные группы для большой семьи и качели — для жизни под открытым небом.',
            descEn: 'Terraces, loungers, pavilions, family-size dining sets and swings — for open-air living.',
            iconPath: 'M3 21h18M4 21l5-9 4 6 3-4 5 7',
            img: CARD_IMG.country
          })}
        </div>
      </div>

      <div class="welcome-foot">
        <span class="toggle-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="9" width="18" height="6" rx="3"/>
            <circle cx="9" cy="12" r="2" fill="currentColor"/>
          </svg>
          <span data-ru="Можно переключиться в любой момент"
                data-en="You can switch any time">Можно переключиться в любой момент</span>
        </span>
      </div>`;
    return root;
  }

  function cardMarkup(c) {
    return `
      <button class="welcome-card" data-welcome-mode="${c.mode}" aria-label="${c.titleRu}">
        <div class="welcome-card-img"><img src="${c.img}" alt="" loading="eager"/></div>
        <span class="welcome-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${c.iconPath}"/></svg>
        </span>
        <span class="welcome-card-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
        <span class="welcome-card-content">
          <span class="welcome-card-tag" data-ru="${c.tagRu}" data-en="${c.tagEn}">${c.tagRu}</span>
          <span class="welcome-card-title" data-ru="${c.titleRu}" data-en="${c.titleEn}">${c.titleRu}</span>
          <span class="welcome-card-desc" data-ru="${c.descRu}" data-en="${c.descEn}">${c.descRu}</span>
        </span>
      </button>`;
  }

  function dismiss(root) {
    root.classList.remove('is-open');
    document.body.classList.remove('welcome-open');
    setTimeout(() => root.remove(), 700);
  }

  function applyMode(mode) {
    // Use the global setMode helper that script.js exposes — keeps the
    // toggle pill, attribute and storage in sync.
    if (typeof window.tarkiSetMode === 'function') {
      window.tarkiSetMode(mode);
    } else {
      // Fallback if script.js exposed nothing — set the attribute directly
      document.documentElement.setAttribute('data-mode', mode);
    }
  }

  function open() {
    const root = buildDOM();
    document.body.appendChild(root);
    document.body.classList.add('welcome-open');

    // Mode card click → persist + dismiss
    root.querySelectorAll('[data-welcome-mode]').forEach((card) => {
      card.addEventListener('click', () => {
        const mode = card.dataset.welcomeMode;
        applyMode(mode);
        persistChoice(mode);
        dismiss(root);
      });
    });

    // Skip → just mark onboarded, keep current (default = city)
    root.querySelector('[data-welcome-skip]').addEventListener('click', (e) => {
      e.preventDefault();
      persistChoice(null);
      dismiss(root);
    });

    // ESC also dismisses (treats as skip)
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key !== 'Escape') return;
      document.removeEventListener('keydown', onEsc);
      persistChoice(null);
      dismiss(root);
    });

    // Trigger transition on next frame
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-open')));
  }

  // Public surface — minimal: just `reset()` for QA / debug.
  window.TARKI_WELCOME = {
    reset() {
      try { localStorage.removeItem(ONBOARDED_KEY); } catch (e) {}
    }
  };

  if (!alreadyOnboarded()) {
    // Defer one tick so other init code (script.js mode loader) has set
    // the document attribute first — otherwise our welcome would flash
    // in city colors before potentially country colors take over.
    requestAnimationFrame(open);
  }
})();
