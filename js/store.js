'use strict';
/* =========================================================
   Browser storage for things too big for localStorage: the photos, videos
   and voice notes of a game, and the half-made game on the create page.
   Everything stays in this browser (IndexedDB); nothing is uploaded.
   ========================================================= */
const Store = (() => {
  let dbp = null;
  function db() {
    if (!dbp) dbp = new Promise((res, rej) => {
      const r = indexedDB.open('whosent', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('media'); r.result.createObjectStore('drafts'); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode), s = t.objectStore(store);
      const out = fn(s);
      t.oncomplete = () => res(out && 'result' in out ? out.result : out);
      t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  }
  return {
    put: (store, key, val) => tx(store, 'readwrite', s => s.put(val, key)),
    get: (store, key) => tx(store, 'readonly', s => s.get(key)),
    del: (store, key) => tx(store, 'readwrite', s => s.delete(key)),
    /* every key that starts with prefix (e.g. a game's media) */
    keys: (store, prefix = '') => tx(store, 'readonly', s => s.getAllKeys(prefix ? IDBKeyRange.bound(prefix, prefix + '￿') : undefined)),
    async delPrefix(store, prefix) {
      const ks = await this.keys(store, prefix);
      return tx(store, 'readwrite', s => { ks.forEach(k => s.delete(k)); });
    },
    /* how much the browser lets us keep, for the "where is it stored" note */
    async usage() { try { const e = await navigator.storage.estimate(); return e; } catch (e) { return null; } }
  };
})();
