// MILITARY FIT — app entry: hash router + bottom navigation + service worker.
import { renderHome, renderWorkouts, renderProgress, renderMore } from './views/coming.js';
import { renderLibrary } from './views/library.js';
import { renderExercise } from './views/exercise.js';
import { renderWelcome } from './views/welcome.js';
import { renderOnboarding } from './views/onboarding.js';
import { renderProfile } from './views/myprofile.js';
import { getProfile, getDraft } from './db.js';

// ----- service worker (only on https or localhost) -----
const secure = location.protocol === 'https:' ||
  location.hostname === 'localhost' || location.hostname === '127.0.0.1';
if ('serviceWorker' in navigator && secure) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker not registered:', err));
  });
}

// ----- router -----
const app = document.getElementById('app');
const navLinks = [...document.querySelectorAll('#nav a')];
let current = null;
let token = 0;

function parse() {
  const raw = location.hash.replace(/^#/, '') || '/dashboard';
  const [path, qs = ''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs));
  return { parts: path.split('/').filter(Boolean), query };
}

const redirect = hash => { location.hash = hash; };

function resolve({ parts, query }, ctx) {
  const { profile, draft } = ctx;
  switch (parts[0]) {
    case undefined: case 'dashboard': case 'home':
      if (!profile) { redirect(draft && draft.step && draft.step !== 'intro' ? '#/onboarding' : '#/welcome'); return null; }
      return renderHome(app, ctx);
    case 'welcome':
      if (profile) { redirect('#/dashboard'); return null; }
      return renderWelcome(app, ctx);
    case 'onboarding': {
      if (profile && !query.edit) { redirect('#/dashboard'); return null; }
      if (!parts[1] && !query.edit) {                       // opened without a step: carry on where we stopped
        const s = (draft && draft.step) || 'intro';
        redirect(s === 'profile' ? '#/profile' : `#/onboarding/${s}`); return null;
      }
      return renderOnboarding(app, ctx, parts[1], query);
    }
    case 'profile': return renderProfile(app, ctx);
    case 'workouts': return renderWorkouts(app);
    case 'library': return renderLibrary(app);
    case 'ex': return renderExercise(app, parts[1] || '');
    case 'progress': return renderProgress(app);
    case 'more': return renderMore(app);
    default:
      app.innerHTML = `<header class="page-head"><h1>Page not found</h1></header>
        <section class="card"><a class="btn" href="#/dashboard">Go to Home</a></section>`;
      return { tab: 'home', title: 'Not found' };
  }
}

async function route() {
  const my = ++token;
  if (current && current.destroy) { try { current.destroy(); } catch (e) { console.warn(e); } }
  current = null;
  const r = parse();
  let ctx;
  try {
    ctx = { profile: await getProfile(), draft: await getDraft() };
  } catch (e) {
    console.error(e);
    if (my !== token) return;
    // Storage did not open. The library still works; the profile screens need storage.
    if (['library', 'ex', 'workouts', 'progress', 'more'].includes(r.parts[0])) ctx = { profile: null, draft: null };
    else {
      app.innerHTML = `<header class="page-head"><h1>Storage problem</h1></header>
        <section class="card"><p>We could not open the storage on this phone, so your answers cannot be saved.</p>
        <p class="muted">Close other MILITARY FIT tabs, or turn off private browsing, then try again.</p>
        <button type="button" class="btn" onclick="location.reload()">Try again</button></section>`;
      document.body.classList.add('no-nav');
      return;
    }
  }
  if (my !== token) return;                               // another page was opened while we were loading
  document.body.classList.toggle('no-nav', ['welcome', 'onboarding'].includes(r.parts[0]));
  let res;
  try {
    res = resolve(r, ctx);
  } catch (e) {
    console.error(e);
    app.innerHTML = '<section class="card"><h2>Something went wrong</h2><a class="btn" href="#/dashboard">Go to Home</a></section>';
    res = { tab: 'home', title: 'Error' };
  }
  if (!res) return;                                       // a redirect happened; the next route call draws the page
  current = res;
  document.title = `${res.title} — MILITARY FIT`;
  navLinks.forEach(a => {
    const on = a.dataset.tab === res.tab;
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
