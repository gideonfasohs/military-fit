// The profile model: what we save, the order of the onboarding steps, the "edit" sections,
// and how each goal is measured (spec section 4). A missing value is null, never 0.
import { GOALS, CHANGES, labelOf, PUSHUP_CHOICES, ENERGY } from './data/questions.js';
import { formatWeight, formatLength, isNum } from './units.js';

export const PROFILE_VERSION = 1;

export function emptyAnswers() {
  return {
    version: PROFILE_VERSION,
    goals: { selected: [], other: null, primary: null },
    change: { selected: [], other: null },
    level: null, activity: null, success: null, horizon: null, time: null, days: null, style: null,
    limitations: { items: [], none: false, other: null },
    person: { name: null, age: null, sex: null, heightCm: null, weightKg: null, waistCm: null, hipCm: null, experience: null, preferredTime: null },
    units: { weight: 'kg', length: 'cm' },
    targets: { weightKg: null, waistCm: null, pushups: null, plankSeconds: null, walkingMinutes: null },
    baseline: { pushupVariation: null, pushupReps: null, squatReps: null, plankSeconds: null, walkingMinutes: null, energy: null },
  };
}

// Fill in anything missing (for data saved by an older version of the app)
export function normalise(a) {
  const e = emptyAnswers();
  const out = { ...e, ...(a || {}) };
  for (const k of ['goals', 'change', 'limitations', 'person', 'units', 'targets', 'baseline']) out[k] = { ...e[k], ...((a || {})[k] || {}) };
  return out;
}

// ----- step order -----
export const BASE_STEPS = ['intro', 'goals', 'primary', 'change', 'level', 'activity', 'success', 'horizon', 'time', 'days', 'style',
  'limits', 'person', 'targets', 'b-pushups', 'b-squats', 'b-plank', 'b-walk', 'b-energy'];

export function stepsFor(a) {
  const multi = (a.goals.selected || []).length > 1;
  return BASE_STEPS.filter(s => s !== 'primary' || multi);
}

// Steps that count for the progress bar (the welcome text is not counted)
export const countedSteps = a => stepsFor(a).filter(s => s !== 'intro');

// Sections shown on the profile screen. "Edit" jumps to the first step and returns here after the last one.
export const GROUPS = [
  { id: 'goals', title: 'Your goals', steps: ['goals', 'primary', 'change'] },
  { id: 'level', title: 'Your fitness level', steps: ['level', 'activity'] },
  { id: 'success', title: 'What success looks like', steps: ['success', 'horizon'] },
  { id: 'plan', title: 'Your training time', steps: ['time', 'days', 'style'] },
  { id: 'limits', title: 'Physical limitations', steps: ['limits'] },
  { id: 'person', title: 'About you', steps: ['person'] },
  { id: 'targets', title: 'Your targets', steps: ['targets'] },
  { id: 'baseline', title: 'Your starting fitness check', steps: ['b-pushups', 'b-squats', 'b-plank', 'b-walk', 'b-energy'] },
];
export const groupById = id => GROUPS.find(g => g.id === id) || null;
export const groupSteps = (a, id) => {
  const g = groupById(id);
  return g ? g.steps.filter(s => s !== 'primary' || (a.goals.selected || []).length > 1) : [];
};

// ----- required answers -----
export function stepOk(a, step) {
  switch (step) {
    case 'goals': return a.goals.selected.length > 0 && (!a.goals.selected.includes('other') || !!a.goals.other);
    case 'primary': return a.goals.selected.length < 2 || a.goals.selected.includes(a.goals.primary);
    case 'change': return a.change.selected.length > 0 && (!a.change.selected.includes('else') || !!a.change.other);
    case 'level': return !!a.level;
    case 'activity': return !!a.activity;
    case 'horizon': return !!a.horizon;
    case 'time': return !!a.time;
    case 'days': return !!a.days;
    case 'style': return !!a.style;
    case 'limits': return a.limitations.none || a.limitations.items.length > 0 || !!a.limitations.other;
    case 'person': return !!a.person.name && isNum(a.person.age) && isNum(a.person.heightCm) && isNum(a.person.weightKg);
    default: return true;   // optional steps
  }
}
export const firstMissingStep = a => stepsFor(a).find(s => !stepOk(a, s)) || null;
export const isComplete = a => firstMissingStep(a) === null;

// ----- readable text (everything shows "Not set" when empty) -----
export const NOT_SET = 'Not set';

export function goalLabel(a, id) {
  if (id === 'other') return a.goals.other || 'Other';
  return labelOf(GOALS, id) || id;
}
export const changeLabel = (a, id) => (id === 'else' ? (a.change.other || 'Something else') : (labelOf(CHANGES, id) || id));

export function pushupText(b) {
  if (b.pushupVariation === 'cannot') return 'Cannot do one yet';
  if (!b.pushupVariation || !isNum(b.pushupReps)) return NOT_SET;
  const v = labelOf(PUSHUP_CHOICES, b.pushupVariation).toLowerCase();
  return `${b.pushupReps} ${v}`;
}
export const repsText = n => (isNum(n) ? `${n} reps` : NOT_SET);
export const secondsText = n => (isNum(n) ? `${n} seconds` : NOT_SET);
export const minutesText = n => (isNum(n) ? `${n} minutes` : NOT_SET);
export const energyText = n => (isNum(n) ? `${n} of 5 (${(ENERGY.find(e => e.id === n) || {}).label})` : NOT_SET);

// ----- goal -> how it is measured -> starting value -> target (spec section 4) -----
// Each entry: how it is measured, and functions that give the starting value and the target.
const lc = t => (t === NOT_SET ? 'not set' : t);   // for use in the middle of a sentence
const METRICS = {
  weight: { measure: 'Weight trend', start: a => formatWeight(a.person.weightKg, a.units.weight), target: a => formatWeight(a.targets.weightKg, a.units.weight) },
  waist: { measure: 'Waist trend', start: a => formatLength(a.person.waistCm, a.units.length), target: a => formatLength(a.targets.waistCm, a.units.length) },
  weightWaist: { measure: 'Weight and waist trends',
    start: a => `${formatWeight(a.person.weightKg, a.units.weight)} · waist ${lc(formatLength(a.person.waistCm, a.units.length))}`,
    target: a => `${formatWeight(a.targets.weightKg, a.units.weight)} · waist ${lc(formatLength(a.targets.waistCm, a.units.length))}` },
  pushups: { measure: 'Push-up repetitions and exercise difficulty', start: a => pushupText(a.baseline),
    target: a => (isNum(a.targets.pushups) ? `${a.targets.pushups} push-ups` : NOT_SET) },
  squats: { measure: 'Squat repetitions', start: a => repsText(a.baseline.squatReps), target: () => NOT_SET },
  plank: { measure: 'Valid plank duration', start: a => secondsText(a.baseline.plankSeconds),
    target: a => (isNum(a.targets.plankSeconds) ? `${a.targets.plankSeconds} seconds` : NOT_SET) },
  walking: { measure: 'Walking duration', start: a => minutesText(a.baseline.walkingMinutes),
    target: a => (isNum(a.targets.walkingMinutes) ? `${a.targets.walkingMinutes} minutes` : NOT_SET) },
  military: { measure: 'Push-ups, plank and walking (test performance)',
    start: a => `${pushupText(a.baseline)} · plank ${lc(secondsText(a.baseline.plankSeconds))}`,
    target: a => `${isNum(a.targets.pushups) ? a.targets.pushups + ' push-ups' : 'not set'} · plank ${isNum(a.targets.plankSeconds) ? a.targets.plankSeconds + ' seconds' : 'not set'}` },
  consistency: { measure: 'Weekly workout completion', start: () => 'Starts when your programme starts', target: () => NOT_SET },
  mobility: { measure: 'Movement checks (coming in a later phase)', start: () => NOT_SET, target: () => NOT_SET },
};

const GOAL_METRIC = {
  fat: 'weightWaist', belly: 'waist', muscle: 'pushups', lean: 'weightWaist', strength: 'pushups', endurance: 'walking',
  cardio: 'walking', mobility: 'mobility', general: 'consistency', military: 'military', discipline: 'consistency',
};
const CHANGE_METRIC = { fat: 'weightWaist', abs: 'waist', arms: 'pushups', chest: 'pushups', legs: 'squats', core: 'plank', shape: 'weightWaist', stamina: 'walking' };

export function measurementRows(a) {
  const rows = [];
  const seen = new Set();
  const add = (label, key) => {
    const m = METRICS[key];
    rows.push({ goal: label, measure: m.measure, start: m.start(a), target: m.target(a), key });
  };
  for (const id of a.goals.selected) {
    if (id === 'other') { rows.push({ goal: goalLabel(a, id), measure: 'In your own words (we will agree how to measure it later)', start: NOT_SET, target: NOT_SET, key: 'other' }); continue; }
    const key = GOAL_METRIC[id]; seen.add(key); add(goalLabel(a, id), key);
  }
  // goals picked in "what would you like to change" that add a new way to measure
  for (const id of a.change.selected) {
    const key = CHANGE_METRIC[id];
    if (key && !seen.has(key)) { seen.add(key); add(changeLabel(a, id), key); }
  }
  return rows;
}
