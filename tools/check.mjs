// Dev check for the exercise animations. Run:  node tools/check.mjs [exercise-id]
// It measures, using the real engine, that:
//  - points listed in `touch` / `touchAny` stay on the floor,
//  - floor-contact points do not slide,
//  - the loop closes (the last frame equals the first frame).
globalThis.window = { devicePixelRatio: 1 };
const { FigurePlayer, radiusOf } = await import('../js/anim.js');
const { ANIMATIONS } = await import('../js/data/animations.js');

const fake = { getContext: () => new Proxy({}, { get: () => () => {}, set: () => true }), clientWidth: 300, clientHeight: 225 };
const only = process.argv[2];
const FLOOR_TOL = 0.015;   // 1.5 cm (about 4 px on a phone)
const SLIDE_TOL = 0.012;   // total sideways movement allowed while a point stays on the floor (1.2 cm)
const SWING_SPEED = 0.006;   // faster than 0.6 cm per 20 ms (30 cm/s) counts as a step or swing
const MIN_CONTACT_FRAMES = 4;   // a point must stay on the floor for 4 frames (80 ms) to count as "planted"
const SLIDE_POINTS = ['handN', 'handF', 'toeN', 'toeF', 'ankleN', 'ankleF', 'kneeN', 'kneeF'];
const edge = (w, n) => w[n][1] - radiusOf(n);

let problems = 0;
for (const [id, def] of Object.entries(ANIMATIONS)) {
  if (only && only !== id) continue;
  const pl = new FigurePlayer(fake, def);
  pl.render = () => {};
  const step = 20;
  const msgs = [];
  let prev = null;
  const worst = {};
  let slideWorst = { name: '', dx: 0, t: 0 };
  const run = {};   // per point: { frames, dx }
  const groupWorst = [];
  for (let t = 0; t <= def.duration; t += step) {
    const { world: w } = pl._eval(t);
    for (const item of def.touch || []) {
      const [n, t0 = 0, t1 = def.duration] = Array.isArray(item) ? item : [item];
      if (t >= t0 && t <= t1) worst[n] = Math.max(worst[n] || 0, edge(w, n));
    }
    (def.touchAny || []).forEach((g, i) => {
      groupWorst[i] = Math.max(groupWorst[i] || 0, Math.min(...g.map(n => edge(w, n))));
    });
    if (prev) {
      const floorShift = def.scrollDist ? -def.scrollDist * step / def.duration : 0;
      for (const n of SLIDE_POINTS) {
        if (edge(w, n) < 0.006 && edge(prev, n) < 0.006) {
          const r = run[n] || (run[n] = { frames: 0, dx: 0 });
          const d = (w[n][0] - prev[n][0]) - floorShift;
          r.frames++;
          if (Math.abs(d) <= SWING_SPEED) r.dx += d;   // fast movement is a step/swing, not a slide
          if (r.frames >= MIN_CONTACT_FRAMES && Math.abs(r.dx) > slideWorst.dx) slideWorst = { name: n, dx: Math.abs(r.dx), t };
        } else run[n] = { frames: 0, dx: 0 };
      }
    }
    prev = w;
  }
  for (const [n, v] of Object.entries(worst)) if (v > FLOOR_TOL) msgs.push(`${n} floats up to ${(v * 100).toFixed(1)} cm`);
  groupWorst.forEach((v, i) => { if (v > FLOOR_TOL) msgs.push(`group ${def.touchAny[i]} floats ${(v * 100).toFixed(1)} cm`); });
  if (slideWorst.dx > SLIDE_TOL) msgs.push(`${slideWorst.name} slides ${(slideWorst.dx * 100).toFixed(1)} cm while on the floor (until t=${slideWorst.t})`);
  // loop gap
  const a = pl._eval(0).world, b = pl._eval(def.duration).world;
  let gap = 0; for (const n of Object.keys(a)) gap = Math.max(gap, Math.hypot(a[n][0] - b[n][0], a[n][1] - b[n][1]));
  if (gap > 0.004) msgs.push(`loop gap ${(gap * 100).toFixed(1)} cm`);
  problems += msgs.length;
  console.log((msgs.length ? 'CHECK ' : 'ok    ') + id.padEnd(28) + (msgs.join('; ') || ''));
}
console.log(problems ? `\n${problems} issue(s) to look at` : '\nAll checks passed');
