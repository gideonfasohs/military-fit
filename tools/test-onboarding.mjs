// End-to-end test of storage + welcome + onboarding + profile, in headless Chrome.
// Run:  node tools/test-onboarding.mjs [base-url]      (default http://localhost:8000/)
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:8000/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const problems = [];
const check = (name, ok, extra = '') => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (!ok && extra ? '   -> ' + extra : '')); };

async function launch() {
  const prof = mkdtempSync(join(tmpdir(), 'mf-onb-'));
  const port = 9500 + Math.floor(Math.random() * 400);
  const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, '--user-data-dir=' + prof, 'about:blank'], { stdio: 'ignore' });
  await sleep(2200);
  const tabs = await (await fetch(`http://localhost:${port}/json`)).json();
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pend = {};
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
    if (m.method === 'Runtime.exceptionThrown') problems.push('EXC ' + JSON.stringify(m.params.exceptionDetails).slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) problems.push('console.' + m.params.type + ' ' + JSON.stringify(m.params.args.map(a => a.value || a.description)).slice(0, 250));
    if (m.method === 'Log.entryAdded' && ['error', 'warning'].includes(m.params.entry.level)) problems.push('log.' + m.params.entry.level + ' ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => { const r = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result.result.value; };
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  const api = {
    send, ev,
    async open(hash = '') { await send('Page.navigate', { url: BASE + 'index.html' + hash }); await sleep(900); },
    async waitFor(expr, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch { /* page loading */ } await sleep(120); } return false; },
    async step(id) { return api.waitFor(`document.querySelector('.onb[data-step="${id}"]') !== null`); },
    click: sel => ev(`document.querySelector(${JSON.stringify(sel)}).click()`),
    opt: id => ev(`document.querySelector('.opt[data-id="${id}"]').click()`),
    seg: (segId, id) => ev(`document.querySelector('#${segId} .seg-btn[data-id="${id}"]').click()`),
    type: (sel, v) => ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.value = ${JSON.stringify(String(v))}; e.dispatchEvent(new Event('input', { bubbles: true })); })()`),
    next: () => ev(`document.querySelector('[data-action=next]').click()`),
    skip: () => ev(`document.querySelector('[data-action=skip]').click()`),
    text: () => ev(`document.getElementById('app').innerText`),
    hash: () => ev('location.hash'),
    nextDisabled: () => ev(`document.querySelector('[data-action=next]').disabled`),
    db: key => ev(`new Promise(res => { const q = indexedDB.open('militaryfit'); q.onerror = () => res(null); q.onsuccess = () => { const r = q.result.transaction('kv').objectStore('kv').get(${JSON.stringify(key)}); r.onsuccess = () => res(r.result === undefined ? null : r.result); }; })`),
    async goNext(id) { await api.next(); return api.step(id); },
    close: () => { try { ws.close(); } catch { /* ignore */ } chrome.kill(); },
  };
  return api;
}

// =====================================================================
// RUN 1: everything filled in
// =====================================================================
console.log('\n=== RUN 1: everything filled in ===');
let b = await launch();
await b.open();
check('first run opens the Welcome screen', await b.waitFor(`location.hash === '#/welcome' && document.querySelector('.welcome-title')`));
check('welcome hides the bottom navigation', await b.ev(`getComputedStyle(document.getElementById('nav')).display === 'none'`));
await b.click('#start');
check('Get Started opens the first screen', await b.step('intro'));
check('intro shows the spec welcome text', (await b.text()).includes('Your fitness journey starts with understanding'));
check('intro > goals', await b.goNext('goals'));

check('Q1: Next is disabled until something is chosen', await b.nextDisabled());
await b.opt('fat'); await b.opt('strength'); await b.opt('other');
check('Q1: choosing Other needs some text', await b.nextDisabled());
await b.type('#other-text', 'Run the Kilimanjaro marathon');
check('Q1: Next is enabled with text', !(await b.nextDisabled()));
check('Q1 > "most important" question (more than one goal)', await b.goNext('primary'));
check('primary lists the chosen goals incl. the written one', (await b.text()).includes('Run the Kilimanjaro marathon') && (await b.text()).includes('Build strength'));
await b.opt('strength');
check('primary > Q2', await b.goNext('change'));
await b.opt('abs'); await b.opt('legs'); await b.opt('core');
check('Q2 > Q3', await b.goNext('level'));
await b.opt('beginner');
check('Q3 > Q4', await b.goNext('activity'));
await b.opt('light');
check('Q4 > Q5', await b.goNext('success'));
check('Q5: Next works even when empty (optional)', !(await b.nextDisabled()));
await b.ev(`document.querySelector('.chip-btn[data-i="2"]').click()`);
check('Q5: tapping an example fills the box', (await b.ev(`document.getElementById('success-text').value`)).includes('30 proper push-ups'));
check('Q5 > Q6', await b.goNext('horizon'));
check('Q6 explains planning horizons, not promises', (await b.text()).includes('planning horizons, not promises'));
await b.opt('90');
check('Q6 > Q7', await b.goNext('time'));
await b.opt('20-30');

// ---- close and reopen in the middle ----
await b.next(); await b.step('days');
await b.open('');
check('REOPEN mid-way: resumes at the saved question (Q8)', await b.waitFor(`location.hash === '#/onboarding/days' && document.querySelector('.onb[data-step="days"]')`), await b.hash());
check('REOPEN mid-way: earlier answers kept (Back shows Q7 selected)', await (async () => { await b.click('[data-action=back]'); await b.step('time'); return b.ev(`document.querySelector('.opt[data-id="20-30"]').classList.contains('on')`); })());
await b.next(); await b.step('days');
await b.opt('4');
check('Q8 > Q9', await b.goNext('style'));
await b.opt('military');
check('Q9 > Q10', await b.goNext('limits'));
check('Q10: needs a choice or a note', await b.nextDisabled());
await b.opt('knees'); await b.opt('heart-bp-breathing');
check('Q10: heart choice shows a doctor note', (await b.text()).includes('check with a doctor'));
await b.opt('none');
check('Q10: "No known limitations" clears the others', await b.ev(`document.querySelectorAll('.opt.on').length === 1`));
await b.opt('knees'); await b.opt('heart-bp-breathing');
check('Q10: picking a limitation clears "none"', await b.ev(`!document.querySelector('.opt[data-id="none"]').classList.contains('on')`));
await b.type('#limit-text', 'Old ankle injury');
check('Q10 > About you', await b.goNext('person'));

// ---- About you: validation, units ----
await b.next();
check('About you: empty form shows messages and stays', (await b.hash()) === '#/onboarding/person' && (await b.text()).includes('Please enter your name'));
await b.type('#name', 'Test Soldier'); await b.type('#age', '34');
await b.seg('u-weight', 'lb'); await b.seg('u-length', 'in');
await b.type('#height', '70'); await b.type('#weight', '160'); await b.type('#waist', '34'); await b.type('#hip', '38');
await b.seg('sex', 'male'); await b.type('#exp', 'Played football at school'); await b.seg('pref', 'evening');
check('About you > Targets', await b.goNext('targets'));
await b.type('#t-weight', '150'); await b.type('#t-waist', '32'); await b.type('#t-pushups', '30'); await b.type('#t-plank', '120'); await b.type('#t-walk', '45');
check('Targets > push-ups baseline', await b.goNext('b-pushups'));
check('baseline shows the comfort note', (await b.text()).includes('Only do what is comfortable. Stop if you feel pain.'));
check('baseline has a Skip button', await b.ev(`!!document.querySelector('[data-action=skip]')`));
await b.opt('knee'); await b.type('#b-reps', '12');
check('push-ups > squats', await b.goNext('b-squats'));
await b.type('#b-squats', '20');
check('squats > plank', await b.goNext('b-plank'));
await b.type('#b-plank', '25');
check('plank > walking', await b.goNext('b-walk'));
await b.type('#b-walk', '30');
check('walking > energy', await b.goNext('b-energy'));
check('energy screen shows "Progress photos: Coming in Phase 4"', (await b.text()).includes('Coming in Phase 4'));
await b.opt('4');
await b.next();
check('last step > My Fitness Profile', await b.waitFor(`location.hash === '#/profile' && document.querySelector('.group')`));

let txt = await b.text();
check('profile shows the name', txt.includes('Test Soldier'));
check('profile: most important goal', /Most important goal\s*Build strength/.test(txt));
check('profile: weight shown in lb as typed', txt.includes('160 lb'));
check('profile: height shown in inches', txt.includes('70 in'));
check('profile: waist, hip', txt.includes('34 in') && txt.includes('38 in'));
check('profile: limitations list', txt.includes('Knees') && txt.includes('Old ankle injury'));
check('profile: targets', txt.includes('150 lb') && txt.includes('30') && txt.includes('120 seconds') && txt.includes('45 minutes'));
check('profile: baseline', txt.includes('12 knee push-ups') && txt.includes('20 reps') && txt.includes('25 seconds') && txt.includes('30 minutes') && txt.includes('4 of 5 (Good)'));
check('profile: goal table with measure / start / target', txt.includes('Measured by:') && txt.includes('Starting value') && txt.includes('Target'));
check('profile asks the confirmation question', txt.includes('Does this accurately describe what you want to achieve?'));
const draftBefore = await b.db('onboarding-draft');
check('before "Yes": answers are in the draft, no saved profile yet', !!draftBefore && (await b.db('profile')) === null);

// ---- edit an answer from the profile ----
await b.click('[data-group=plan] .edit-btn');
check('Edit opens that question (Q7)', await b.step('time'));
check('Edit mode says "Editing"', (await b.text()).includes('Editing your answer'));
await b.opt('30-45');
await b.next(); await b.step('days'); await b.next(); await b.step('style');
check('Edit last step button says Save', (await b.text()).includes('Save'));
await b.next();
check('Edit returns to the profile', await b.waitFor(`location.hash === '#/profile' && document.querySelector('.group')`));
check('edited answer shows on the profile', (await b.text()).includes('30 to 45 minutes'));
// Edit button of the confirmation question opens a list
await b.click('[data-action=edit]');
check('"Edit" under the question shows a list of sections', await b.ev(`document.getElementById('edit-list').hidden === false && document.querySelectorAll('#edit-list .link-row').length === 8`));

// ---- Yes ----
await b.click('[data-action=yes]');
check('"Yes" shows "Your programme is next — Step 4"', await b.waitFor(`document.getElementById('app').innerText.includes('Your programme is next — Step 4')`));
const p1 = await b.db('profile');
check('profile saved: values stored in metric', p1 && Math.abs(p1.person.weightKg - 72.57) < 0.05 && Math.abs(p1.person.heightCm - 177.8) < 0.1, JSON.stringify(p1 && p1.person));
check('profile saved: targets metric', p1 && Math.abs(p1.targets.weightKg - 68.04) < 0.05 && p1.targets.pushups === 30);
check('profile saved: the edit is included', p1 && p1.time === '30-45' && p1.units.weight === 'lb');
check('draft cleared after Yes', (await b.db('onboarding-draft')) === null);

// ---- reopen after finishing ----
await b.open('');
check('REOPEN after finishing: Home opens with the saved name', await b.waitFor(`document.getElementById('app').innerText.includes('Welcome, Test Soldier')`));
check('REOPEN: bottom navigation is back', await b.ev(`getComputedStyle(document.getElementById('nav')).display !== 'none'`));
await b.open('#/welcome');
check('opening #/welcome with a profile goes to Home', await b.waitFor(`location.hash === '#/dashboard'`));
await b.open('#/profile');
check('profile screen after reopen shows the saved card (no question)', await b.waitFor(`document.getElementById('app').innerText.includes('Your programme is next — Step 4') && !document.getElementById('confirm')`));
// edit from the saved profile
await b.click('[data-group=level] .edit-btn');
await b.step('level'); await b.opt('intermediate'); await b.next(); await b.step('activity'); await b.next();
check('edit of a saved profile returns to the profile', await b.waitFor(`location.hash === '#/profile' && document.querySelector('.group')`));
check('saved profile updated', (await b.db('profile')).level === 'intermediate');

// ---- offline ----
await b.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
await b.open('#/profile');
check('OFFLINE: profile still opens with the saved data', await b.waitFor(`document.getElementById('app').innerText.includes('Test Soldier')`));
await b.open('');
check('OFFLINE: Home opens', await b.waitFor(`document.getElementById('app').innerText.includes('Welcome, Test Soldier')`));
b.close();

// =====================================================================
// RUN 2: everything optional skipped
// =====================================================================
console.log('\n=== RUN 2: every optional item skipped ===');
b = await launch();
await b.open('');
await b.waitFor(`location.hash === '#/welcome'`);
await b.click('#start'); await b.step('intro'); await b.goNext('goals');
await b.opt('general');
check('one goal only: no "most important" question', await b.goNext('change'));
await b.opt('health'); await b.goNext('level');
await b.opt('complete-beginner'); await b.goNext('activity');
await b.opt('sitting'); await b.goNext('success');
check('Q5 left empty', !(await b.nextDisabled()));
await b.goNext('horizon');
await b.opt('none'); await b.goNext('time');
await b.opt('10-15'); await b.goNext('days');
await b.opt('2'); await b.goNext('style');
await b.opt('flexible'); await b.goNext('limits');
await b.opt('none'); await b.goNext('person');
await b.type('#name', 'Asha'); await b.type('#age', '28'); await b.type('#height', '165'); await b.type('#weight', '58.5');
await b.goNext('targets');
await b.skip();
check('Skip works on targets', await b.step('b-pushups'));
for (const s of ['b-squats', 'b-plank', 'b-walk', 'b-energy']) { await b.skip(); await b.step(s); }
await b.skip();
check('after skipping everything: profile screen', await b.waitFor(`location.hash === '#/profile' && document.querySelector('.group')`));
txt = await b.text();
check('skipped values show "Not set"', (txt.match(/Not set/g) || []).length >= 12, 'count ' + (txt.match(/Not set/g) || []).length);
check('no skipped value shows as zero', !/\b0\s?(kg|lb|cm|in|reps|seconds|minutes|push-ups|years)\b/.test(txt) && !/Plank\s*0\b/.test(txt));
check('single-goal table has one row with a measure', txt.includes('Weekly workout completion'));
const d2 = await b.db('onboarding-draft');
const a2 = d2.answers;
check('draft stores skipped numbers as null (not 0)',
  a2.person.waistCm === null && a2.person.hipCm === null && a2.person.sex === null && a2.person.experience === null && a2.person.preferredTime === null &&
  Object.values(a2.targets).every(v => v === null) && Object.values(a2.baseline).every(v => v === null) && a2.success === null, JSON.stringify(a2.targets) + JSON.stringify(a2.baseline));
await b.open('');
check('REOPEN while on the profile screen: still there', await b.waitFor(`location.hash === '#/profile'`));
await b.click('[data-action=yes]');
await b.waitFor(`document.getElementById('app').innerText.includes('Step 4')`);
const p2 = await b.db('profile');
check('saved profile keeps nulls (no zeros)', p2.person.weightKg === 58.5 && p2.person.waistCm === null && Object.values(p2.targets).every(v => v === null) && Object.values(p2.baseline).every(v => v === null));
await b.open('');
check('REOPEN after finishing: Home', await b.waitFor(`document.getElementById('app').innerText.includes('Welcome, Asha')`));
b.close();

console.log(problems.length ? '\nCONSOLE PROBLEMS:\n' + [...new Set(problems)].join('\n') : '\nNo console errors or warnings.');
console.log(fails ? `\n${fails} FAILED` : '\nAll tests passed');
process.exit(fails || problems.length ? 1 : 0);
