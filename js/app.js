// MILITARY FIT — app entry: hash router + bottom navigation + service worker.
import { renderHome, renderWorkouts, renderProgress, renderMore } from './views/coming.js';
import { renderLibrary } from './views/library.js';
import { renderExercise } from './views/exercise.js';

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

function resolve(path) {
  const parts = path.split('/').filter(Boolean);
  switch (parts[0]) {
    case undefined: case 'dashboard': case 'home': return renderHome(app);
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

function route() {
  if (current && current.destroy) { try { current.destroy(); } catch (e) { console.warn(e); } }
  const path = location.hash.replace(/^#/, '') || '/dashboard';
  try {
    current = resolve(path);
  } catch (e) {
    console.error(e);
    app.innerHTML = '<section class="card"><h2>Something went wrong</h2><a class="btn" href="#/dashboard">Go to Home</a></section>';
    current = { tab: 'home', title: 'Error' };
  }
  document.title = `${current.title} — MILITARY FIT`;
  navLinks.forEach(a => {
    const on = a.dataset.tab === current.tab;
    on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();
