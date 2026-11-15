// Onboarding: one question at a time (spec sections 2 and 3). Answers are saved after every step,
// so closing the app and opening it again carries on where you stopped.
// Optional items can be skipped; a skipped item is saved as null (never 0).
import { icon, tile, esc } from '../icons.js';
import { saveProfile, saveDraft } from '../db.js';
import {
  GOALS, CHANGES, LEVELS, ACTIVITY, SUCCESS_EXAMPLES, HORIZONS, TIMES, DAYS, STYLES, LIMITS,
  PUSHUP_CHOICES, ENERGY, SEX, PREFERRED_TIME,
} from '../data/questions.js';
import { normalise, stepsFor, countedSteps, groupSteps, goalLabel } from '../profile.js';
import { parseNumber, kgToDisplay, displayToKg, cmToDisplay, displayToCm, RANGES } from '../units.js';

const go = hash => { location.hash = hash; };
const SAFE_NOTE = 'Only do what is comfortable. Stop if you feel pain.';

// ---------- small HTML helpers ----------
function optRows(list, sel, kind) {
  return `<div class="opts" role="${kind === 'radio' ? 'radiogroup' : 'group'}">` + list.map(o => `
    <button type="button" class="opt${sel.has(o.id) ? ' on' : ''}" role="${kind}" aria-checked="${sel.has(o.id)}" data-id="${esc(o.id)}">
      ${tile(o.icon || 'check', 36)}<span class="opt-label">${esc(o.label)}</span><span class="check">${icon('tick', 14)}</span>
    </button>`).join('') + '</div>';
}
const tip = (text, ic = 'sprout') => `<div class="tip">${tile(ic, 34)}<p>${esc(text)}</p></div>`;
const field = (id, label, inner, hint = '') => `
  <div class="field" data-field="${id}">
    <label for="${id}">${esc(label)}</label>${inner}
    ${hint ? `<p class="hint">${esc(hint)}</p>` : ''}<p class="field-error" id="err-${id}" role="alert" hidden></p>
  </div>`;
const input = (id, value, attrs = '') => `<input class="input" id="${id}" value="${esc(value ?? '')}" ${attrs}>`;
const seg = (id, list, current) => `<div class="seg" id="${id}" role="group">${list.map(o =>
  `<button type="button" class="seg-btn${current === o.id ? ' on' : ''}" data-id="${esc(o.id)}" aria-pressed="${current === o.id}">${esc(o.label)}</button>`).join('')}</div>`;

function showErrors(root, errors) {
  root.querySelectorAll('.field-error').forEach(e => { e.hidden = true; e.textContent = ''; });
  let first = null;
  for (const [id, msg] of Object.entries(errors)) {
    const el = root.querySelector('#err-' + id);
    if (el) { el.textContent = msg; el.hidden = false; if (!first) first = id; }
  }
  if (first) { const inp = root.querySelector('#' + first); if (inp) inp.focus(); }
}

// Wire up selectable rows. kind: 'checkbox' (many) or 'radio' (one). exclusive: ids that clear all others.
function bindOptions(root, sel, kind, onChange, exclusive = []) {
  root.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (kind === 'radio') { sel.clear(); sel.add(id); }
    else if (sel.has(id)) sel.delete(id);
    else {
      if (exclusive.includes(id)) sel.clear();
      else exclusive.forEach(x => sel.delete(x));
      sel.add(id);
    }
    root.querySelectorAll('.opt').forEach(b => { const on = sel.has(b.dataset.id); b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
    onChange();
  }));
}

const intIn = (txt, [lo, hi]) => { const n = parseNumber(txt); return n !== null && Number.isInteger(n) && n >= lo && n <= hi ? n : null; };
const numIn = (txt, [lo, hi]) => { const n = parseNumber(txt); return n !== null && n >= lo && n <= hi ? n : null; };

// ---------- the steps ----------
// Each step returns { title, help, body, bind(root, update), valid(), apply(answers), validate?() , skip?(answers), next? }
function buildStep(id, a) {
  switch (id) {
    case 'intro':
      return {
        title: 'Welcome to MILITARY FIT',
        help: 'Your fitness journey starts with understanding what you want to achieve. Everyone has a different goal, a different starting point and a different level of fitness.',
        body: () => '<p class="lead">Let\'s get to know you so we can build a programme that works for you.</p>',
        valid: () => true, apply: () => {}, nextLabel: 'Let\'s begin',
      };

    case 'goals': {
      const sel = new Set(a.goals.selected); const st = { other: a.goals.other || '' };
      return {
        title: 'What is your primary fitness goal?', help: 'Select one or more.',
        body: () => optRows(GOALS, sel, 'checkbox') +
          `<div class="other-box" id="other-wrap" ${sel.has('other') ? '' : 'hidden'}><label class="visually-hidden" for="other-text">Your own goal</label><input class="input" id="other-text" maxlength="120" placeholder="Write your own goal" value="${esc(st.other)}"></div>`,
        bind(root, upd) {
          bindOptions(root, sel, 'checkbox', () => { root.querySelector('#other-wrap').hidden = !sel.has('other'); upd(); });
          root.querySelector('#other-text').addEventListener('input', e => { st.other = e.target.value; upd(); });
        },
        valid: () => sel.size > 0 && (!sel.has('other') || st.other.trim().length > 0),
        apply(x) {
          x.goals.selected = GOALS.map(g => g.id).filter(i => sel.has(i));
          x.goals.other = sel.has('other') ? st.other.trim() : null;
          if (x.goals.selected.length === 1) x.goals.primary = x.goals.selected[0];
          else if (!x.goals.selected.includes(x.goals.primary)) x.goals.primary = null;
        },
      };
    }

    case 'primary': {
      const list = a.goals.selected.map(i => ({ id: i, label: goalLabel(a, i), icon: (GOALS.find(g => g.id === i) || {}).icon }));
      const sel = new Set(a.goals.primary ? [a.goals.primary] : []);
      return {
        title: 'Which goal matters most to you?', help: 'You chose more than one goal. Pick your most important priority.',
        body: () => optRows(list, sel, 'radio'),
        bind: (root, upd) => bindOptions(root, sel, 'radio', upd),
        valid: () => sel.size === 1, apply: x => { x.goals.primary = [...sel][0] || null; },
      };
    }

    case 'change': {
      const sel = new Set(a.change.selected); const st = { other: a.change.other || '' };
      return {
        title: 'What would you most like to change about your body or fitness?', help: 'Choose one or more.',
        body: () => optRows(CHANGES, sel, 'checkbox') +
          `<div class="other-box" id="other-wrap" ${sel.has('else') ? '' : 'hidden'}><label class="visually-hidden" for="other-text">Your own answer</label><input class="input" id="other-text" maxlength="120" placeholder="Write your own answer" value="${esc(st.other)}"></div>`,
        bind(root, upd) {
          bindOptions(root, sel, 'checkbox', () => { root.querySelector('#other-wrap').hidden = !sel.has('else'); upd(); });
          root.querySelector('#other-text').addEventListener('input', e => { st.other = e.target.value; upd(); });
        },
        valid: () => sel.size > 0 && (!sel.has('else') || st.other.trim().length > 0),
        apply(x) { x.change.selected = CHANGES.map(c => c.id).filter(i => sel.has(i)); x.change.other = sel.has('else') ? st.other.trim() : null; },
      };
    }

    case 'level': return single('What is your current fitness level?', '', LEVELS, a.level, (x, v) => { x.level = v; });
    case 'activity': return single('How active are you currently?', '', ACTIVITY, a.activity, (x, v) => { x.activity = v; });

    case 'success': {
      const st = { text: a.success || '' };
      return {
        title: 'What would success look like to you?',
        help: 'Describe it in your own words. You do not have to choose a weight-loss target. You can leave this empty.',
        body: () => `
          <label class="visually-hidden" for="success-text">Your answer</label>
          <textarea class="input area" id="success-text" rows="4" maxlength="400" placeholder="For example: I want to perform 30 proper push-ups.">${esc(st.text)}</textarea>
          <p class="hint">Tap an example to use it:</p>
          <div class="chips-row">${SUCCESS_EXAMPLES.map((t, i) => `<button type="button" class="chip-btn" data-i="${i}">${esc(t)}</button>`).join('')}</div>`,
        bind(root, upd) {
          const ta = root.querySelector('#success-text');
          ta.addEventListener('input', () => { st.text = ta.value; });
          root.querySelectorAll('.chip-btn').forEach(b => b.addEventListener('click', () => {
            const t = SUCCESS_EXAMPLES[+b.dataset.i];
            ta.value = ta.value.trim() ? ta.value.trim() + ' ' + t : t; st.text = ta.value; upd();
          }));
        },
        valid: () => true, apply: x => { x.success = st.text.trim() || null; },
      };
    }

    case 'horizon': {
      const s = single('When would you like to achieve your goal?', '', HORIZONS, a.horizon, (x, v) => { x.horizon = v; });
      const body = s.body;
      s.body = () => body() + tip('These are planning horizons, not promises. Real change takes time, and it is different for every person.', 'clock');
      return s;
    }
    case 'time': return single('How much time can you give to exercise?', 'Per workout.', TIMES, a.time, (x, v) => { x.time = v; });
    case 'days': return single('How many days per week can you realistically train?', '', DAYS, a.days, (x, v) => { x.days = v; });
    case 'style': return single('What type of training do you prefer?', '', STYLES, a.style, (x, v) => { x.style = v; });

    case 'limits': {
      const sel = new Set(a.limitations.none ? ['none'] : a.limitations.items); const st = { other: a.limitations.other || '' };
      return {
        title: 'Do you have any physical limitations or exercises you need to avoid?',
        help: 'Tick everything that applies. We will not give you exercises that could make these worse.',
        body: () => optRows(LIMITS, sel, 'checkbox') + `
          <div id="heart-tip" ${sel.has('heart-bp-breathing') ? '' : 'hidden'}>${tip('Please check with a doctor before you start training. We will keep your programme gentler.', 'heart')}</div>
          <div class="field"><label for="limit-text">Anything else? (injuries, discomfort, movements to avoid)</label>
          <textarea class="input area" id="limit-text" rows="3" maxlength="300" placeholder="Optional">${esc(st.other)}</textarea></div>`,
        bind(root, upd) {
          bindOptions(root, sel, 'checkbox', () => { root.querySelector('#heart-tip').hidden = !sel.has('heart-bp-breathing'); upd(); }, ['none']);
          root.querySelector('#limit-text').addEventListener('input', e => { st.other = e.target.value; upd(); });
        },
        valid: () => sel.size > 0 || st.other.trim().length > 0,
        apply(x) {
          x.limitations.none = sel.has('none');
          x.limitations.items = LIMITS.map(l => l.id).filter(i => i !== 'none' && sel.has(i));
          x.limitations.other = st.other.trim() || null;
        },
      };
    }

    case 'person': return personStep(a);
    case 'targets': return targetsStep(a);

    case 'b-pushups': {
      const sel = new Set(a.baseline.pushupVariation ? [a.baseline.pushupVariation] : []);
      const st = { reps: a.baseline.pushupReps ?? '' };
      return {
        title: 'How many push-ups can you do comfortably?', help: SAFE_NOTE, skippable: true,
        body: () => optRows(PUSHUP_CHOICES, sel, 'radio') + `
          <div id="reps-wrap" ${sel.size && !sel.has('cannot') ? '' : 'hidden'}>${field('b-reps', 'How many in a row?', input('b-reps', st.reps, 'inputmode="numeric" autocomplete="off"'))}</div>`,
        bind(root, upd) {
          bindOptions(root, sel, 'radio', () => { root.querySelector('#reps-wrap').hidden = !sel.size || sel.has('cannot'); upd(); });
          root.querySelector('#b-reps').addEventListener('input', e => { st.reps = e.target.value; upd(); });
        },
        valid: () => sel.size === 1 && (sel.has('cannot') || intIn(st.reps, [1, 200]) !== null),
        apply(x) { const v = [...sel][0]; x.baseline.pushupVariation = v; x.baseline.pushupReps = v === 'cannot' ? null : intIn(st.reps, [1, 200]); },
        skip(x) { x.baseline.pushupVariation = null; x.baseline.pushupReps = null; },
      };
    }
    case 'b-squats': return numberStep('How many squats can you do comfortably?', 'Reps in a row', 'b-squats', a.baseline.squatReps, [1, 200], (x, v) => { x.baseline.squatReps = v; }, 'numeric');
    case 'b-plank': return numberStep('How long can you hold a plank?', 'Seconds (you can use your knees if you prefer)', 'b-plank', a.baseline.plankSeconds, [1, 600], (x, v) => { x.baseline.plankSeconds = v; }, 'numeric');
    case 'b-walk': return numberStep('How long can you walk comfortably without stopping?', 'Minutes', 'b-walk', a.baseline.walkingMinutes, [1, 300], (x, v) => { x.baseline.walkingMinutes = v; }, 'numeric');
    case 'b-energy': {
      const sel = new Set(a.baseline.energy ? [String(a.baseline.energy)] : []);
      return {
        title: 'How is your energy level today?', help: SAFE_NOTE, skippable: true, nextLabel: 'See my profile',
        body: () => `<div class="energy" role="radiogroup" aria-label="Energy level from 1 to 5">${ENERGY.map(e => `
          <button type="button" class="opt energy-btn${sel.has(String(e.id)) ? ' on' : ''}" role="radio" aria-checked="${sel.has(String(e.id))}" data-id="${e.id}"><b>${e.id}</b><span>${esc(e.label)}</span></button>`).join('')}</div>
          <div class="tip">${tile('camera', 34)}<p><b>Progress photos</b><br>Coming in Phase 4</p></div>`,
        bind: (root, upd) => bindOptions(root, sel, 'radio', upd),
        valid: () => sel.size === 1, apply: x => { x.baseline.energy = +[...sel][0]; }, skip: x => { x.baseline.energy = null; },
      };
    }
    default: return null;
  }
}

function single(title, help, list, current, setter) {
  const sel = new Set(current ? [String(current)] : []);
  return {
    title, help,
    body: () => optRows(list, sel, 'radio'),
    bind: (root, upd) => bindOptions(root, sel, 'radio', upd),
    valid: () => sel.size === 1, apply: x => setter(x, [...sel][0]),
  };
}

function numberStep(title, label, id, current, range, setter) {
  const st = { v: current ?? '' };
  return {
    title, help: SAFE_NOTE, skippable: true,
    body: () => field(id, label, input(id, st.v, 'inputmode="numeric" autocomplete="off"')),
    bind(root, upd) { root.querySelector('#' + id).addEventListener('input', e => { st.v = e.target.value; upd(); }); },
    valid: () => intIn(st.v, range) !== null,
    apply: x => setter(x, intIn(st.v, range)),
    skip: x => setter(x, null),
  };
}

// ---------- About you (name, age, height and weight are required) ----------
function personStep(a) {
  const u = { ...a.units }; const p = a.person;
  const st = {
    name: p.name || '', age: p.age ?? '', sex: p.sex, pref: p.preferredTime, exp: p.experience || '',
    height: cmToDisplay(p.heightCm, u.length) ?? '', weight: kgToDisplay(p.weightKg, u.weight) ?? '',
    waist: cmToDisplay(p.waistCm, u.length) ?? '', hip: cmToDisplay(p.hipCm, u.length) ?? '',
  };
  const unitLabel = () => ({ h: u.length, w: u.weight });
  return {
    title: 'Tell us about you', help: 'Name, age, height and weight are needed. Everything else is optional.',
    body: () => `
      ${field('name', 'Name or display name', input('name', st.name, 'maxlength="40" autocomplete="given-name" enterkeyhint="next"'))}
      ${field('age', 'Age (years)', input('age', st.age, 'inputmode="numeric" autocomplete="off"'))}
      <div class="field"><span class="label">Weight unit</span>${seg('u-weight', [{ id: 'kg', label: 'Kilograms (kg)' }, { id: 'lb', label: 'Pounds (lb)' }], u.weight)}</div>
      <div class="field"><span class="label">Height and body measurements</span>${seg('u-length', [{ id: 'cm', label: 'Centimetres (cm)' }, { id: 'in', label: 'Inches (in)' }], u.length)}</div>
      ${field('height', 'Height', input('height', st.height, 'inputmode="decimal" autocomplete="off"'), '')}
      ${field('weight', 'Current weight', input('weight', st.weight, 'inputmode="decimal" autocomplete="off"'))}
      ${field('waist', 'Waist (optional)', input('waist', st.waist, 'inputmode="decimal" autocomplete="off"'), 'Measure around your belly button.')}
      ${field('hip', 'Hip (optional)', input('hip', st.hip, 'inputmode="decimal" autocomplete="off"'))}
      <div class="field"><span class="label">Sex (optional)</span>${seg('sex', SEX, st.sex)}</div>
      ${field('exp', 'Exercise experience (optional)', `<textarea class="input area" id="exp" rows="2" maxlength="200" placeholder="For example: I played football at school.">${esc(st.exp)}</textarea>`)}
      <div class="field"><span class="label">Preferred workout time (optional)</span>${seg('pref', PREFERRED_TIME, st.pref)}</div>`,
    bind(root, upd) {
      const refreshLabels = () => {
        const L = unitLabel();
        root.querySelector('label[for=height]').textContent = `Height (${L.h})`;
        root.querySelector('label[for=weight]').textContent = `Current weight (${L.w})`;
        root.querySelector('label[for=waist]').textContent = `Waist in ${L.h} (optional)`;
        root.querySelector('label[for=hip]').textContent = `Hip in ${L.h} (optional)`;
      };
      refreshLabels();
      ['name', 'age', 'height', 'weight', 'waist', 'hip', 'exp'].forEach(k => root.querySelector('#' + k).addEventListener('input', e => { st[k] = e.target.value; }));
      const toggleSeg = (segId, key, allowOff) => root.querySelector('#' + segId).addEventListener('click', e => {
        const b = e.target.closest('.seg-btn'); if (!b) return;
        st[key] = (allowOff && st[key] === b.dataset.id) ? null : b.dataset.id;
        root.querySelectorAll(`#${segId} .seg-btn`).forEach(x => { const on = st[key] === x.dataset.id; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      });
      toggleSeg('sex', 'sex', true); toggleSeg('pref', 'pref', true);
      // changing units converts what is already typed
      const unitSeg = (segId, group) => root.querySelector('#' + segId).addEventListener('click', e => {
        const b = e.target.closest('.seg-btn'); if (!b || u[group] === b.dataset.id) return;
        const from = u[group], to = b.dataset.id;
        const conv = (txt, toMetric, toDisp) => { const n = parseNumber(txt); return n === null ? txt : toDisp(toMetric(n, from), to); };
        if (group === 'weight') st.weight = conv(st.weight, (n, f) => displayToKg(n, f), kgToDisplay);
        else for (const k of ['height', 'waist', 'hip']) st[k] = conv(st[k], (n, f) => displayToCm(n, f), cmToDisplay);
        u[group] = to;
        for (const k of ['height', 'weight', 'waist', 'hip']) root.querySelector('#' + k).value = st[k];
        root.querySelectorAll(`#${segId} .seg-btn`).forEach(x => { const on = x.dataset.id === to; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
        refreshLabels();
      });
      unitSeg('u-weight', 'weight'); unitSeg('u-length', 'length');
    },
    valid: () => true,   // validated with messages when you press Next
    validate() {
      const errors = {}; const out = {};
      const name = st.name.trim();
      if (!name) errors.name = 'Please enter your name.'; else out.name = name;
      out.age = intIn(st.age, RANGES.age); if (out.age === null) errors.age = `Please enter your age, between ${RANGES.age[0]} and ${RANGES.age[1]}.`;
      const h = numIn(st.height, RANGES.height[u.length]); if (h === null) errors.height = `Please enter your height, between ${RANGES.height[u.length].join(' and ')} ${u.length}.`; else out.heightCm = displayToCm(h, u.length);
      const w = numIn(st.weight, RANGES.weight[u.weight]); if (w === null) errors.weight = `Please enter your weight, between ${RANGES.weight[u.weight].join(' and ')} ${u.weight}.`; else out.weightKg = displayToKg(w, u.weight);
      for (const [k, key, rng] of [['waist', 'waistCm', RANGES.waist], ['hip', 'hipCm', RANGES.hip]]) {
        if (String(st[k]).trim() === '') out[key] = null;
        else { const v = numIn(st[k], rng[u.length]); if (v === null) errors[k] = `Enter a number between ${rng[u.length].join(' and ')} ${u.length}, or leave it empty.`; else out[key] = displayToCm(v, u.length); }
      }
      return { errors, out };
    },
    applyValidated(x, out) {
      Object.assign(x.person, { name: out.name, age: out.age, heightCm: out.heightCm, weightKg: out.weightKg, waistCm: out.waistCm, hipCm: out.hipCm,
        sex: st.sex || null, experience: st.exp.trim() || null, preferredTime: st.pref || null });
      x.units = { ...u };
    },
  };
}

// ---------- Targets (all optional) ----------
function targetsStep(a) {
  const u = a.units; const t = a.targets;
  const st = { weight: kgToDisplay(t.weightKg, u.weight) ?? '', waist: cmToDisplay(t.waistCm, u.length) ?? '', pushups: t.pushups ?? '', plank: t.plankSeconds ?? '', walk: t.walkingMinutes ?? '' };
  return {
    title: 'Do you have any targets?', help: 'All optional. Leave a box empty to skip it. You can change these later.', skippable: true,
    body: () => `
      ${field('t-weight', `Target weight (${u.weight})`, input('t-weight', st.weight, 'inputmode="decimal" autocomplete="off"'))}
      ${field('t-waist', `Target waist (${u.length})`, input('t-waist', st.waist, 'inputmode="decimal" autocomplete="off"'))}
      ${field('t-pushups', 'Push-ups in a row', input('t-pushups', st.pushups, 'inputmode="numeric" autocomplete="off"'))}
      ${field('t-plank', 'Plank time (seconds)', input('t-plank', st.plank, 'inputmode="numeric" autocomplete="off"'))}
      ${field('t-walk', 'Comfortable walking time (minutes)', input('t-walk', st.walk, 'inputmode="numeric" autocomplete="off"'))}`,
    bind(root) {
      for (const [k, id] of [['weight', 't-weight'], ['waist', 't-waist'], ['pushups', 't-pushups'], ['plank', 't-plank'], ['walk', 't-walk']])
        root.querySelector('#' + id).addEventListener('input', e => { st[k] = e.target.value; });
    },
    valid: () => true,
    validate() {
      const errors = {}; const out = {};
      const opt = (k, id, parse, rng, label) => {
        if (String(st[k]).trim() === '') return null;
        const v = parse(st[k], rng); if (v === null) errors[id] = `Enter ${label}, or leave it empty.`; return v;
      };
      const w = opt('weight', 't-weight', numIn, RANGES.weight[u.weight], `a number between ${RANGES.weight[u.weight].join(' and ')} ${u.weight}`);
      out.weightKg = w === null ? null : displayToKg(w, u.weight);
      const wa = opt('waist', 't-waist', numIn, RANGES.waist[u.length], `a number between ${RANGES.waist[u.length].join(' and ')} ${u.length}`);
      out.waistCm = wa === null ? null : displayToCm(wa, u.length);
      out.pushups = opt('pushups', 't-pushups', intIn, [1, 500], 'a whole number from 1 to 500');
      out.plankSeconds = opt('plank', 't-plank', intIn, [1, 1800], 'a whole number from 1 to 1800');
      out.walkingMinutes = opt('walk', 't-walk', intIn, [1, 600], 'a whole number from 1 to 600');
      return { errors, out };
    },
    applyValidated(x, out) { Object.assign(x.targets, out); },
    skip(x) { x.targets = { weightKg: null, waistCm: null, pushups: null, plankSeconds: null, walkingMinutes: null }; },
  };
}

// ---------- the screen ----------
export function renderOnboarding(app, ctx, stepId, query = {}) {
  const source = ctx.profile ? 'profile' : 'draft';
  const a = normalise(ctx.profile || (ctx.draft && ctx.draft.answers));
  const edit = query.edit && (ctx.profile || ctx.draft) ? query.edit : null;
  const list = edit ? groupSteps(a, edit) : stepsFor(a);
  const step = list.includes(stepId) ? stepId : list[0];
  if (!step) { go('#/profile'); return { tab: 'home', title: 'Profile' }; }
  const def = buildStep(step, a);
  const idx = list.indexOf(step);
  const editQ = edit ? `?edit=${edit}` : '';
  const counted = countedSteps(a);
  const pos = counted.indexOf(step) + 1;
  const percent = edit ? Math.round(((idx + 1) / list.length) * 100) : Math.round((Math.max(pos, 0) / counted.length) * 100);
  const isLast = idx === list.length - 1;
  const label = edit ? 'Editing your answer' : (step === 'intro' ? 'Welcome' : `Step ${pos} of ${counted.length}`);
  const nextLabel = def.nextLabel || (isLast ? (edit ? 'Save' : 'See my profile') : 'Next');

  app.innerHTML = `
    <div class="onb" data-step="${step}">
      <div class="onb-top">
        <button type="button" class="icon-btn" data-action="back" aria-label="Back">${icon('back', 20)}</button>
        <div class="onb-prog">
          <span class="onb-prog-label">${esc(label)}</span>
          <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><div class="fill" style="width:${step === 'intro' ? 0 : percent}%"></div></div>
        </div>
      </div>
      <h1 class="onb-title">${esc(def.title)}</h1>
      ${def.help ? `<p class="onb-help">${esc(def.help)}</p>` : ''}
      <div class="onb-body" id="onb-body">${def.body()}</div>
      <p class="form-error" id="form-error" role="alert" hidden></p>
      <div class="onb-footer">
        ${def.skippable ? '<button type="button" class="btn outline" data-action="skip">Skip</button>' : ''}
        <button type="button" class="btn grow" data-action="next">${esc(nextLabel)} ${isLast && !edit ? '' : icon('arrow', 22)}</button>
      </div>
    </div>`;

  const root = app.querySelector('#onb-body');
  const nextBtn = app.querySelector('[data-action=next]');
  const errBox = app.querySelector('#form-error');
  const update = () => { const ok = def.validate ? true : def.valid(); nextBtn.disabled = !ok; nextBtn.setAttribute('aria-disabled', String(!ok)); };
  if (def.bind) def.bind(root, update);
  update();

  async function persist(x, nextStepId) {
    if (source === 'profile') await saveProfile(x);
    else await saveDraft({ answers: x, step: edit ? 'profile' : (nextStepId || 'profile') });
  }

  async function commit(mutate) {
    const x = normalise(JSON.parse(JSON.stringify(a)));
    mutate(x);
    // the list of steps can change (for example, picking only one goal removes the "most important" step)
    const newList = edit ? groupSteps(x, edit) : stepsFor(x);
    const after = newList[newList.indexOf(step) + 1] || null;
    nextBtn.disabled = true; errBox.hidden = true;
    try {
      await persist(x, after);
      go(after ? `#/onboarding/${after}${editQ}` : '#/profile');
    } catch (e) {
      console.error(e);
      errBox.textContent = 'We could not save your answer on this phone. Please try again.';
      errBox.hidden = false; nextBtn.disabled = false;
    }
  }

  app.querySelector('[data-action=back]').addEventListener('click', () => {
    const prev = list[idx - 1];
    go(prev ? `#/onboarding/${prev}${editQ}` : (edit ? '#/profile' : '#/welcome'));
  });
  nextBtn.addEventListener('click', () => {
    if (def.validate) {
      const { errors, out } = def.validate();
      if (Object.keys(errors).length) { showErrors(root, errors); return; }
      commit(x => def.applyValidated(x, out));
    } else if (def.valid()) commit(x => def.apply(x));
  });
  const skipBtn = app.querySelector('[data-action=skip]');
  if (skipBtn) skipBtn.addEventListener('click', () => commit(x => def.skip(x)));

  return { tab: 'home', title: 'Get started' };
}

