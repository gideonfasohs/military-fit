// Makes anim-sheet.png (contact sheet of every exercise animation) using headless Chrome.
// Needs the local server running:  python3 -m http.server 8000
// Run:  node tools/make-sheet.mjs <output.png>
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = process.argv[2] || 'anim-sheet.png';
const prof = mkdtempSync(join(tmpdir(), 'mf-sheet-'));
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--hide-scrollbars', '--remote-debugging-port=9335',
  '--user-data-dir=' + prof, '--window-size=1700,1000', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
await sleep(2500);
const tabs = await (await fetch('http://localhost:9335/json')).json();
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const pend = {}; const problems = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
  if (m.method === 'Runtime.exceptionThrown') problems.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') problems.push(m.params.entry.text + ' ' + (m.params.entry.url || ''));
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => (await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.result.value;
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1700, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'http://localhost:8000/tools/anim-sheet.html' });
for (let i = 0; i < 40; i++) { await sleep(500); if (await ev('window.sheetReady === true')) break; }
await ev('document.fonts.ready.then(() => true)');
await sleep(500);
const h = await ev('Math.ceil(document.documentElement.scrollHeight)');
const w = await ev('Math.ceil(document.documentElement.scrollWidth)');
await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
await sleep(400);
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('saved', out, w + 'x' + h, problems.length ? '\nPROBLEMS:\n' + problems.join('\n') : '(no errors)');
chrome.kill();
