// End-to-end check in headless Chrome. Run:  node tools/test-app.mjs [base-url]
// Default base-url: http://localhost:8000/   (start it with: python3 -m http.server 8000)
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const BASE = process.argv[2] || 'http://localhost:8000/';
const prof = mkdtempSync(join(tmpdir(), 'mf-test-'));
const port = 9400 + Math.floor(Math.random() * 90);
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, '--user-data-dir=' + prof, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
await sleep(2200);
const tabs = await (await fetch(`http://localhost:${port}/json`)).json();
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const pend = {}; const problems = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
  if (m.method === 'Runtime.exceptionThrown') problems.push('EXC ' + JSON.stringify(m.params.exceptionDetails).slice(0, 300));
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) problems.push('console.' + m.params.type + ' ' + JSON.stringify(m.params.args.map(a => a.value || a.description)).slice(0, 250));
  if (m.method === 'Log.entryAdded' && ['error', 'warning'].includes(m.params.entry.level)) problems.push('log.' + m.params.entry.level + ' ' + m.params.entry.text + ' ' + (m.params.entry.url || '')); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return r.result.result.value; };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable'); await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
let fails = 0;
const check = (name, ok, extra = '') => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); };
const go = async hash => { await ev(`location.hash='${hash}'`); await sleep(350); };

await send('Page.navigate', { url: BASE + 'index.html' }); await sleep(3500);
check('SW active', await ev(`navigator.serviceWorker.getRegistration().then(r => !!(r && r.active))`));
const cacheInfo = await ev(`caches.keys().then(async k => { const c = await caches.open(k[0]); return k[0] + ':' + (await c.keys()).length })`);
console.log('INFO cache', cacheInfo);

// routes with "coming soon" content
for (const [hash, text] of [['#/dashboard', 'Coming in Phase 1'], ['#/workouts', 'Coming in Phase 2'], ['#/progress', 'Coming in Phase 4'], ['#/more', 'Coming in Phase 5']]) {
  await go(hash);
  check('route ' + hash, (await ev('document.getElementById("app").innerText')).includes(text));
  check('nav active for ' + hash, (await ev('document.querySelector("#nav a[aria-current=page]")?.dataset.tab')) === hash.slice(2).replace('dashboard', 'home'));
}
// library
await go('#/library');
check('library shows 24 cards', (await ev('document.querySelectorAll(".ex-card:not([hidden])").length')) === 24);
check('library has 24 animated canvases', (await ev('document.querySelectorAll(".ex-thumb canvas").length')) === 24);
await ev(`(() => { const q = document.getElementById('q'); q.value = 'plank'; q.dispatchEvent(new Event('input')); })()`); await sleep(200);
check('search "plank" -> 1 result', (await ev('document.querySelectorAll(".ex-card:not([hidden])").length')) === 1);
await ev(`(() => { const q = document.getElementById('q'); q.value = 'zzz'; q.dispatchEvent(new Event('input')); })()`); await sleep(200);
check('search nonsense -> empty message', (await ev('!document.getElementById("empty").hidden')));
await ev(`(() => { const q = document.getElementById('q'); q.value = 'glutes'; q.dispatchEvent(new Event('input')); })()`); await sleep(200);
check('search by muscle "glutes" finds exercises', (await ev('document.querySelectorAll(".ex-card:not([hidden])").length')) >= 3);
await ev(`(() => { const q = document.getElementById('q'); q.value = ''; q.dispatchEvent(new Event('input')); })()`);
const catCounts = { upper: 3, lower: 3, core: 5, conditioning: 8, recovery: 5 };
for (const [c, n] of Object.entries(catCounts)) {
  await ev(`document.querySelector('.tab[data-cat="${c}"]').click()`); await sleep(150);
  check(`tab ${c} -> ${n}`, (await ev('document.querySelectorAll(".ex-card:not([hidden])").length')) === n);
}
await ev(`document.querySelector('.tab[data-cat="all"]').click()`);

// every exercise detail page
const ids = await ev(`[...document.querySelectorAll('.ex-card')].map(a => a.dataset.id)`);
let bad = [];
for (const exId of ids) {
  await go('#/ex/' + exId);
  const r = await ev(`(() => { const a = document.getElementById('app'); const secs = [...a.querySelectorAll('.info-title span')].map(s => s.textContent);
    return { h: a.querySelector('.ex-title')?.textContent, secs: secs.length, canvas: !!a.querySelector('canvas'), ctrls: a.querySelectorAll('.anim-controls button').length, steps: a.querySelectorAll('.steps li').length }; })()`);
  if (!r.h || r.secs < 9 || !r.canvas || r.ctrls < 4 || r.steps < 3) bad.push(exId + ' ' + JSON.stringify(r));
}
check('all 24 detail pages render with 9 sections + animation controls', bad.length === 0 && ids.length === 24, bad.join(' | '));
// detail: controls work
await go('#/ex/pushup');
const ctl = await ev(`(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)); const h = document.getElementById('player'); const b = a => h.querySelector('[data-a="'+a+'"]');
  const o = {}; b('play').click(); o.paused = h.querySelector('.anim-play').getAttribute('aria-label'); b('play').click(); o.playing = h.querySelector('.anim-play').getAttribute('aria-label');
  b('slow').click(); o.slow = b('slow').getAttribute('aria-pressed'); b('loop').click(); o.loopOff = b('loop').getAttribute('aria-pressed'); b('replay').click(); await sleep(200);
  o.fullBtn = !b('full').hidden; return o; })()`);
check('detail controls respond', ctl.paused === 'Play animation' && ctl.playing === 'Pause animation' && ctl.slow === 'true' && ctl.loopOff === 'false', JSON.stringify(ctl));
// easier / harder links
await go('#/ex/knee-pushup');
check('knee push-up has Easier and Harder links', (await ev('document.querySelectorAll(".alt").length')) === 2);
await go('#/ex/nope'); check('unknown exercise shows not found', (await ev('document.getElementById("app").innerText')).includes('Not found'));

// reload keeps working (deep link)
await send('Page.navigate', { url: BASE + 'index.html#/ex/plank' }); await sleep(1500);
check('deep link reload opens plank', (await ev('document.querySelector(".ex-title")?.textContent')) === 'Plank');

// OFFLINE
await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
await send('Page.navigate', { url: BASE + 'index.html#/library' }); await sleep(2500);
check('OFFLINE library loads 24 cards', (await ev('document.querySelectorAll(".ex-card").length')) === 24);
await go('#/ex/walking'); check('OFFLINE detail page works', (await ev('document.querySelector(".ex-title")?.textContent')) === 'Walking');
check('OFFLINE fonts loaded', (await ev('document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === "loaded").length)')) >= 2);

console.log(problems.length ? '\nCONSOLE PROBLEMS:\n' + [...new Set(problems)].join('\n') : '\nNo console errors or warnings.');
console.log(fails ? `\n${fails} FAILED` : '\nAll tests passed');
chrome.kill();
process.exit(fails || problems.length ? 1 : 0);
