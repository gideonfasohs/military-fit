// Exercise detail: large animation card with controls, then all 10 fields in clear sections.
import { getExercise, CATEGORIES } from '../data/exercises.js';
import { ANIMATIONS } from '../data/animations.js';
import { mountAnimation } from '../anim.js';
import { icon, tile, esc } from '../icons.js';

const section = (ic, title, body) => `
  <section class="card info">
    <h2 class="info-title">${tile(ic, 34)}<span>${esc(title)}</span></h2>
    ${body}
  </section>`;

const list = (items, cls = '') => `<ul class="plain ${cls}">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;

export function renderExercise(app, id) {
  const ex = getExercise(id);
  if (!ex) {
    app.innerHTML = `
      <header class="page-head"><h1>Not found</h1></header>
      <section class="card"><p class="muted">We could not find that exercise.</p>
      <a class="btn" href="#/library">Back to the library</a></section>`;
    return { tab: 'library', title: 'Not found' };
  }
  const cat = CATEGORIES.find(c => c.id === ex.category).label;
  const link = (otherId, label, ic) => {
    const o = getExercise(otherId);
    return o ? `<a class="alt" href="#/ex/${o.id}">${icon(ic, 18)}<span><small>${label}</small><b>${esc(o.name)}</b></span>${icon('chevron', 18)}</a>` : '';
  };
  const alts = link(ex.easier, 'Easier', 'down') + link(ex.harder, 'Harder', 'up');

  app.innerHTML = `
    <div class="topbar">
      <a class="icon-btn" href="#/library" aria-label="Back to the library">${icon('back', 20)}</a>
      <h1 class="topbar-title">${esc(ex.name)}</h1>
      <span class="icon-btn-spacer"></span>
    </div>

    <div id="player"></div>

    <div class="ex-head">
      <h2 class="ex-title">${esc(ex.name)}</h2>
      <p class="ex-dose">${esc(ex.dose)}</p>
      <p class="ex-tags"><span class="chip">${esc(cat)}</span><span class="chip">${ex.view === 'front' ? 'Front view' : 'Side view'}</span></p>
    </div>

    ${section('target', 'Starting position', `<p>${esc(ex.start)}</p>`)}
    ${section('list', 'How to do it', `<ol class="steps">${ex.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`)}
    ${section('wind', 'Breathing', `<p>${esc(ex.breathing)}</p>`)}
    ${section('repeat', 'Sets, reps or time', `<p class="big-dose">${esc(ex.dose)}</p><p class="muted">This is a starting suggestion. Listen to your body and change it to suit you.</p>`)}
    ${section('pulse', 'Muscles used', `<p class="chips">${ex.muscles.map(m => `<span class="chip">${esc(m)}</span>`).join('')}</p>`)}
    ${section('alert', 'Common mistakes', list(ex.mistakes, 'cross'))}
    ${section('sprout', 'Beginner version', `<p>${esc(ex.beginner)}</p>`)}
    ${section('shield', 'Safety', `<p>${esc(ex.safety)}</p>`)}
    ${section('camera', 'Camera support', `
      <p><span class="badge muted-badge">${ex.camera === 'planned' ? 'Camera counting: planned' : 'Manual only'}</span></p>
      <p class="muted">${esc(ex.cameraNote)}</p>`)}
    ${alts ? `<div class="alts">${alts}</div>` : ''}
  `;

  const player = mountAnimation(app.querySelector('#player'), ANIMATIONS[ex.anim]);
  return { tab: 'library', title: ex.name, destroy: () => player.dispose() };
}
