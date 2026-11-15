// Exercise library: search box, category tabs and a card per exercise with a small looping animation.
import { EXERCISES, CATEGORIES } from '../data/exercises.js';
import { ANIMATIONS } from '../data/animations.js';
import { mountMini } from '../anim.js';
import { icon, esc } from '../icons.js';

const STORE = 'mf-library-state';
function loadState() {
  try { return JSON.parse(sessionStorage.getItem(STORE)) || {}; } catch { return {}; }
}
function saveState(s) {
  try { sessionStorage.setItem(STORE, JSON.stringify(s)); } catch { /* private mode: ignore */ }
}

export function renderLibrary(app) {
  const state = { cat: 'all', q: '', ...loadState() };
  if (state.cat !== 'all' && !CATEGORIES.some(c => c.id === state.cat)) state.cat = 'all';
  const catLabel = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));

  app.innerHTML = `
    <header class="page-head">
      <h1>Exercise library</h1>
      <p class="muted">${EXERCISES.length} exercises with animated demonstrations.</p>
    </header>
    <label class="search">
      <span class="visually-hidden">Search exercises</span>
      ${icon('search', 20)}
      <input type="search" id="q" placeholder="Search exercises or muscles" autocomplete="off" enterkeyhint="search">
    </label>
    <div class="tabs" role="group" aria-label="Filter by category">
      ${[{ id: 'all', label: 'All' }, ...CATEGORIES].map(c =>
        `<button type="button" class="tab" data-cat="${c.id}" aria-pressed="false">${esc(c.label)}</button>`).join('')}
    </div>
    <p class="muted result-count" id="count" aria-live="polite"></p>
    <div class="ex-grid" id="grid">
      ${EXERCISES.map(e => `
        <a class="ex-card" href="#/ex/${e.id}" data-id="${e.id}" aria-label="${esc(e.name)}">
          <div class="ex-thumb"></div>
          <div class="ex-info">
            <span class="ex-name">${esc(e.name)}</span>
            <span class="ex-sub">${esc(catLabel[e.category])} · ${e.view === 'front' ? 'Front' : 'Side'} view</span>
          </div>
        </a>`).join('')}
    </div>
    <p class="empty card" id="empty" hidden>No exercises match your search. Try a different word, or choose "All".</p>`;

  const q = app.querySelector('#q');
  const grid = app.querySelector('#grid');
  const empty = app.querySelector('#empty');
  const count = app.querySelector('#count');
  q.value = state.q;

  // one small looping animation per card (they only run while visible on screen)
  const minis = [];
  grid.querySelectorAll('.ex-card').forEach(card => {
    const ex = EXERCISES.find(e => e.id === card.dataset.id);
    minis.push(mountMini(card.querySelector('.ex-thumb'), ANIMATIONS[ex.anim]));
  });

  function apply() {
    const term = state.q.trim().toLowerCase();
    let shown = 0;
    for (const card of grid.children) {
      const ex = EXERCISES.find(e => e.id === card.dataset.id);
      const hay = [ex.name, catLabel[ex.category], ...ex.muscles].join(' ').toLowerCase();
      const ok = (state.cat === 'all' || ex.category === state.cat) && (!term || hay.includes(term));
      card.hidden = !ok;
      if (ok) shown++;
    }
    empty.hidden = shown !== 0;
    count.textContent = shown === EXERCISES.length ? '' : `${shown} of ${EXERCISES.length} shown`;
    app.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-pressed', String(t.dataset.cat === state.cat)));
    saveState({ cat: state.cat, q: state.q });
  }

  q.addEventListener('input', () => { state.q = q.value; apply(); });
  app.querySelector('.tabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    state.cat = b.dataset.cat; apply();
  });
  apply();

  return { tab: 'library', title: 'Exercise library', destroy: () => minis.forEach(m => m.dispose()) };
}
