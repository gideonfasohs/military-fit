// Screens that are not built yet. They say so honestly ("Coming in Phase N") and show no fake data.
import { tile, esc } from '../icons.js';

function comingCard({ phase, title, text }) {
  return `
    <section class="card coming">
      ${tile('clock', 40)}
      <div>
        <span class="badge muted-badge">Coming in Phase ${esc(phase)}</span>
        <h2>${esc(title)}</h2>
        <p class="muted">${esc(text)}</p>
      </div>
    </section>`;
}

export function renderHome(app, ctx = {}) {
  const name = ctx.profile && ctx.profile.person && ctx.profile.person.name;
  app.innerHTML = `
    <header class="page-head"><h1>${name ? `Welcome, ${esc(name)}` : 'Home'}</h1></header>
    ${comingCard({ phase: '1', title: 'Your dashboard', text: 'Your 30-day programme and today\'s workout are the next steps of Phase 1. Nothing is shown here until it is real.' })}
    <section class="card">
      <h2>My Fitness Profile</h2>
      <p class="muted">Your goals, starting point and targets, saved on this phone.</p>
      <a class="btn outline" href="#/profile">Open my profile</a>
    </section>
    <section class="card">
      <h2>You can already use the library</h2>
      <p class="muted">Watch an animated demonstration of any of the 24 exercises and read how to do it safely.</p>
      <a class="btn" href="#/library">Open the exercise library</a>
    </section>`;
  return { tab: 'home', title: 'Home' };
}

export function renderWorkouts(app) {
  app.innerHTML = `
    <header class="page-head"><h1>Workouts</h1></header>
    ${comingCard({ phase: '1', title: 'Your 30-day programme', text: 'The programme that is built from your answers comes in the next steps of Phase 1.' })}
    ${comingCard({ phase: '2', title: 'Guided workouts', text: 'Sets, repetitions, rest timers and workout history come in Phase 2.' })}`;
  return { tab: 'workouts', title: 'Workouts' };
}

export function renderProgress(app) {
  app.innerHTML = `
    <header class="page-head"><h1>Progress</h1></header>
    ${comingCard({ phase: '4', title: 'Track your progress', text: 'Weight, waist, charts and daily records come in Phase 4. Nothing is shown here until you have real records.' })}`;
  return { tab: 'progress', title: 'Progress' };
}

export function renderMore(app) {
  const row = (icon, name, phase) => `
    <li class="row">
      ${tile(icon, 36)}
      <span class="row-name">${esc(name)}</span>
      <span class="badge muted-badge">Coming in Phase ${esc(phase)}</span>
    </li>`;
  app.innerHTML = `
    <header class="page-head"><h1>More</h1></header>
    <ul class="rows">
      ${row('leaf', 'Nutrition and water', '4')}
      ${row('chat', 'Fitness coach', '5')}
      ${row('sliders', 'Settings, backup and your data', '1')}
    </ul>
    <p class="muted foot-note">These sections are not built yet, so they do not open.</p>`;
  return { tab: 'more', title: 'More' };
}
