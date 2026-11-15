// MY FITNESS PROFILE (spec section 4): every answer in groups with an Edit button, a table of
// goal -> how it is measured -> starting value -> target, and the question "Does this describe you?".
import { icon, tile, esc } from '../icons.js';
import { saveProfile, clearDraft } from '../db.js';
import {
  GOALS, LEVELS, ACTIVITY, HORIZONS, TIMES, DAYS, STYLES, LIMITS, SEX, PREFERRED_TIME, labelOf,
} from '../data/questions.js';
import {
  normalise, GROUPS, groupSteps, firstMissingStep, measurementRows, goalLabel, changeLabel, NOT_SET,
  pushupText, repsText, secondsText, minutesText, energyText,
} from '../profile.js';
import { formatWeight, formatLength, isNum } from '../units.js';

const val = (v, fallback = NOT_SET) => (v === null || v === undefined || v === '' ? fallback : v);

function rowsFor(a) {
  const p = a.person, u = a.units, t = a.targets, b = a.baseline, g = a.goals;
  const others = g.selected.filter(i => i !== g.primary).map(i => goalLabel(a, i));
  const limits = a.limitations.none ? ['No known limitations'] : a.limitations.items.map(i => labelOf(LIMITS, i));
  if (a.limitations.other) limits.push(a.limitations.other);
  return {
    goals: [
      [g.selected.length > 1 ? 'Most important goal' : 'Goal', val(g.primary && goalLabel(a, g.primary))],
      ...(g.selected.length > 1 ? [['Other goals', others.join(', ')]] : []),
      ['Wants to change', a.change.selected.map(i => changeLabel(a, i)).join(', ')],
    ],
    level: [['Fitness level', val(labelOf(LEVELS, a.level))], ['Activity level', val(labelOf(ACTIVITY, a.activity))]],
    success: [['Success looks like', val(a.success)], ['Timeline', val(labelOf(HORIZONS, a.horizon))]],
    plan: [['Time per workout', val(labelOf(TIMES, a.time))], ['Days per week', val(labelOf(DAYS, a.days))], ['Training style', val(labelOf(STYLES, a.style))]],
    limits: [['Limitations', limits.join(', ')]],
    person: [
      ['Name', val(p.name)], ['Age', isNum(p.age) ? `${p.age} years` : NOT_SET], ['Sex', val(labelOf(SEX, p.sex))],
      ['Height', formatLength(p.heightCm, u.length)], ['Weight', formatWeight(p.weightKg, u.weight)],
      ['Waist', formatLength(p.waistCm, u.length)], ['Hip', formatLength(p.hipCm, u.length)],
      ['Exercise experience', val(p.experience)], ['Preferred workout time', val(labelOf(PREFERRED_TIME, p.preferredTime))],
      ['Units', `${u.weight}, ${u.length}`],
    ],
    targets: [
      ['Target weight', formatWeight(t.weightKg, u.weight)], ['Target waist', formatLength(t.waistCm, u.length)],
      ['Push-ups in a row', isNum(t.pushups) ? String(t.pushups) : NOT_SET],
      ['Plank time', secondsText(t.plankSeconds)], ['Walking time', minutesText(t.walkingMinutes)],
    ],
    baseline: [
      ['Push-ups', pushupText(b)], ['Squats', repsText(b.squatReps)], ['Plank', secondsText(b.plankSeconds)],
      ['Comfortable walking', minutesText(b.walkingMinutes)], ['Energy today', energyText(b.energy)],
      ['Progress photos', 'Coming in Phase 4'],
    ],
  };
}

export function renderProfile(app, ctx) {
  const confirmed = !!ctx.profile;
  const src = ctx.profile || (ctx.draft && ctx.draft.answers);
  if (!src) { location.hash = '#/welcome'; return { tab: 'home', title: 'Profile' }; }
  const a = normalise(src);
  const missing = firstMissingStep(a);
  if (missing) { location.hash = `#/onboarding/${missing}`; return { tab: 'home', title: 'Profile' }; }

  const rows = rowsFor(a);
  const kv = list => `<dl class="kv">${list.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const groupCard = g => {
    const first = groupSteps(a, g.id)[0];
    return `
      <section class="card group" data-group="${g.id}">
        <div class="group-head"><h2>${esc(g.title)}</h2>
          <a class="edit-btn" href="#/onboarding/${first}?edit=${g.id}" aria-label="Edit ${esc(g.title)}">${icon('pencil', 16)} Edit</a></div>
        ${kv(rows[g.id])}
      </section>`;
  };
  const measure = measurementRows(a).map(r => `
    <article class="measure">
      <h3>${esc(r.goal)}</h3>
      <p class="muted">Measured by: ${esc(r.measure)}</p>
      <div class="measure-vals"><div><small>Starting value</small><b>${esc(r.start)}</b></div><div><small>Target</small><b>${esc(r.target)}</b></div></div>
    </article>`).join('');

  const nextCard = `
    <section class="card next-card" id="next-card">
      ${tile('clock', 40)}
      <div><span class="badge">Profile saved</span><h2>Your programme is next — Step 4</h2>
      <p class="muted">Your 30-day programme will be built from these answers. It is not built yet.</p>
      <a class="btn" href="#/dashboard">Go to Home</a></div>
    </section>`;

  const confirmCard = `
    <section class="card confirm" id="confirm">
      <h2>Does this accurately describe what you want to achieve?</h2>
      <div class="confirm-btns">
        <button type="button" class="btn grow" data-action="yes">Yes, this is me</button>
        <button type="button" class="btn outline grow" data-action="edit">Edit</button>
      </div>
      <div id="edit-list" hidden>
        <p class="muted">What would you like to change?</p>
        <div class="rows">${GROUPS.map(g => `<a class="row link-row" href="#/onboarding/${groupSteps(a, g.id)[0]}?edit=${g.id}"><span class="row-name">${esc(g.title)}</span>${icon('chevron', 18)}</a>`).join('')}</div>
      </div>
      <p class="form-error" id="save-error" role="alert" hidden></p>
    </section>`;

  app.innerHTML = `
    <header class="page-head">
      <p class="eyebrow">MY FITNESS PROFILE</p>
      <h1>${esc(a.person.name)}</h1>
      <p class="muted">${confirmed ? 'Tap Edit on any section to change an answer.' : 'Check your answers. Tap Edit on any section to change it.'}</p>
    </header>
    ${GROUPS.map(groupCard).join('')}
    <h2 class="section-title">How we will measure your goals</h2>
    <div class="measures">${measure}</div>
    <p class="muted foot-note">Anything you skipped shows "${NOT_SET}". We never fill in numbers you did not give us.</p>
    ${confirmed ? nextCard : confirmCard}`;

  if (!confirmed) {
    const list = app.querySelector('#edit-list');
    app.querySelector('[data-action=edit]').addEventListener('click', () => {
      list.hidden = !list.hidden;
      if (!list.hidden) list.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    app.querySelector('[data-action=yes]').addEventListener('click', async e => {
      const btn = e.currentTarget; btn.disabled = true;
      try {
        await saveProfile({ ...a, confirmedAt: new Date().toISOString() });
        await clearDraft();
        // show the confirmation card in place of the question
        app.querySelector('#confirm').outerHTML = nextCard;
        app.querySelector('.page-head .muted').textContent = 'Saved on this phone. Tap Edit on any section to change an answer.';
        app.querySelector('#next-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        console.error(err);
        const box = app.querySelector('#save-error');
        box.textContent = 'We could not save your profile on this phone. Please try again.'; box.hidden = false; btn.disabled = false;
      }
    });
  }
  return { tab: 'home', title: 'My Fitness Profile' };
}
