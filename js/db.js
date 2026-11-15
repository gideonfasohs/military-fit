// MILITARY FIT — storage on the phone (IndexedDB). No server.
// Values are stored in metric. A missing value is saved as null, never 0.
const DB_NAME = 'militaryfit';
const DB_VERSION = 1;
const STORE = 'kv';

let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('Storage is not available on this browser.')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Could not open storage.'));
    req.onblocked = () => reject(new Error('Storage is blocked by another open tab.'));
  });
  dbPromise.catch(() => { dbPromise = null; });   // allow a retry later
  return dbPromise;
}

function run(mode, action) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    let result;
    const req = action(store);
    if (req) req.onsuccess = () => { result = req.result; };
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Storage write was cancelled.'));
  }));
}

export const getItem = key => run('readonly', s => s.get(key)).then(v => (v === undefined ? null : v));
export const setItem = (key, value) => run('readwrite', s => s.put(value, key));
export const removeItem = key => run('readwrite', s => s.delete(key));
export const clearAll = () => run('readwrite', s => s.clear());

// Ask the browser not to delete our data when the phone is low on space.
let persistAsked = false;
export async function requestPersistence() {
  if (persistAsked) return;
  persistAsked = true;
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (!(await navigator.storage.persisted())) await navigator.storage.persist();
    }
  } catch { /* not supported: carry on */ }
}

export const KEYS = { profile: 'profile', draft: 'onboarding-draft' };

export const getProfile = () => getItem(KEYS.profile);
export async function saveProfile(profile) {
  await requestPersistence();
  const now = new Date().toISOString();
  const out = { ...profile, updatedAt: now, createdAt: profile.createdAt || now };
  await setItem(KEYS.profile, out);
  return out;
}
export const getDraft = () => getItem(KEYS.draft);
export async function saveDraft(draft) {
  await requestPersistence();
  await setItem(KEYS.draft, { ...draft, updatedAt: new Date().toISOString() });
}
export const clearDraft = () => removeItem(KEYS.draft);
