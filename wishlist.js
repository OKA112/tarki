/**
 * TARKI — Wishlist module
 *
 * Persists a list of favorited product ids in localStorage and broadcasts
 * a `tarki:wishlist-change` CustomEvent on the document whenever the list
 * mutates, so any UI surface (badges, drawer items, card hearts) can react
 * without being directly coupled to the consumer that triggered the change.
 *
 * Public API:
 *   TARKI_WISHLIST.all()         → string[]  copy of all saved product ids
 *   TARKI_WISHLIST.has(id)       → boolean   is the product currently saved
 *   TARKI_WISHLIST.toggle(id)    → boolean   new "is saved" state after toggle
 *   TARKI_WISHLIST.remove(id)    → void
 *   TARKI_WISHLIST.count()       → number    total saved products
 *   TARKI_WISHLIST.CHANGE_EVENT  → string    constant for `addEventListener`
 */
(function () {
  'use strict';

  const STORAGE_KEY  = 'tarki-wishlist';
  const CHANGE_EVENT = 'tarki:wishlist-change';

  /**
   * Read the stored id list, defaulting to `[]` if storage is empty,
   * unavailable (private mode), or contains malformed JSON.
   * @returns {string[]}
   */
  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice() : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Persist `ids` and notify listeners. Storage errors (quota, disabled)
   * are swallowed — wishlist is a non-critical convenience feature.
   * @param {string[]} ids
   */
  function write(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) { /* non-fatal */ }
    document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { ids } }));
  }

  function all()    { return read(); }
  function count()  { return read().length; }
  function has(id)  { return read().indexOf(id) >= 0; }

  /**
   * Add the id if missing, otherwise remove it.
   * @param {string} id
   * @returns {boolean} The new "is saved" state.
   */
  function toggle(id) {
    const ids = read();
    const at  = ids.indexOf(id);
    if (at >= 0) ids.splice(at, 1);
    else         ids.push(id);
    write(ids);
    return at < 0;
  }

  function remove(id) {
    write(read().filter((x) => x !== id));
  }

  window.TARKI_WISHLIST = { all, count, has, toggle, remove, CHANGE_EVENT };
})();
