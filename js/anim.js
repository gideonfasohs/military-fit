// MILITARY FIT — exercise figure engine (canvas, forward kinematics).
//
// ANGLE CONVENTION (degrees, absolute, for every segment):
//   0 = straight up, 90 = forward (the way the figure faces), 180 = straight down,
//   270 (or -90) = backward.  Keep angles continuous (use -20, not 340).
// Side view: the figure faces right. "N" = near limbs, "F" = far limbs.
// Front view: N = limbs on screen-right, F = limbs on screen-left, and the same
//   angle on both sides gives a mirrored (symmetrical) pose. 90 = outward.
// World units: 1.0 is about one standing figure height. Y points up, ground is y = 0.

const DEG = Math.PI / 180;

export const BODY = {
  torso: 0.30, shoulderAt: 0.27, neckToHead: 0.10, headR: 0.085,
  uArm: 0.165, fArm: 0.145, thigh: 0.245, shin: 0.245, foot: 0.085,
  shoulderHalf: 0.075, hipHalf: 0.04,
};

// Standing, arms hanging. Far limbs copy near limbs unless a "...F" value is given.
export const STAND = { torso: 0, head: 0, uArm: 180, fArm: 180, thigh: 180, shin: 180, ft: 90, air: 0 };

const NEAR_FAR = ['uArm', 'fArm', 'thigh', 'shin', 'ft'];
const NUM_KEYS = ['torso', 'head', 'uArm', 'fArm', 'thigh', 'shin', 'ft',
  'uArmF', 'fArmF', 'thighF', 'shinF', 'ftF', 'air'];

// Radius of each body point, used to keep the figure on the ground.
const R = { head: 0.085, hip: 0.055, shoulder: 0.05, elbow: 0.033, hand: 0.031, knee: 0.038, ankle: 0.025, toe: 0.025 };

// Night Ops v2 figure colours (see DESIGN.md)
const C = { body: '#EEF2F8', near: '#F2C14E', far: '#7D6A2E', circle: '#15263F', floor: '#22395C' };

const EASE = {
  linear: u => u,
  sine: u => 0.5 - 0.5 * Math.cos(Math.PI * u),
  inOut: u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  out: u => Math.sin(u * Math.PI / 2),
  in: u => 1 - Math.cos(u * Math.PI / 2),
};

function resolvePose(p) {
  const out = { ...STAND, ...p };
  for (const k of NEAR_FAR) out[k + 'F'] = p[k + 'F'] !== undefined ? p[k + 'F'] : out[k];
  return out;
}

function lerpPose(a, b, e) {
  const o = {};
  for (const k of NUM_KEYS) o[k] = a[k] + (b[k] - a[k]) * e;
  return o;
}

function dir(theta, s) { const a = theta * DEG; return [s * Math.sin(a), Math.cos(a)]; }
function add(p, v, len) { return [p[0] + v[0] * len, p[1] + v[1] * len]; }

// Forward kinematics: pose -> points relative to the hip (y up).
export function solve(p, view) {
  const front = view === 'front';
  const T = dir(p.torso, 1);
  const perp = [T[1], -T[0]];
  const hip = [0, 0];
  const neck = add(hip, T, BODY.torso);
  const sh = add(hip, T, BODY.shoulderAt);
  const head = add(neck, dir(p.head, 1), BODY.neckToHead);
  const pts = { hip, neck, head, shoulder: sh };
  for (const side of ['N', 'F']) {
    const sgn = side === 'N' ? 1 : -1;
    const s = front ? sgn : 1;
    const shoulder = front ? add(sh, perp, sgn * BODY.shoulderHalf) : sh;
    const hipS = front ? add(hip, perp, sgn * BODY.hipHalf) : hip;
    const suf = side === 'N' ? '' : 'F';
    const elbow = add(shoulder, dir(p['uArm' + suf], s), BODY.uArm);
    const hand = add(elbow, dir(p['fArm' + suf], s), BODY.fArm);
    const knee = add(hipS, dir(p['thigh' + suf], s), BODY.thigh);
    const ankle = add(knee, dir(p['shin' + suf], s), BODY.shin);
    const toe = add(ankle, dir(p['ft' + suf], s), BODY.foot);
    pts['shoulder' + side] = shoulder; pts['hip' + side] = hipS;
    pts['elbow' + side] = elbow; pts['hand' + side] = hand;
    pts['knee' + side] = knee; pts['ankle' + side] = ankle; pts['toe' + side] = toe;
  }
  return pts;
}

function radiusOf(name) {
  for (const k of Object.keys(R)) if (name.startsWith(k)) return R[k];
  return 0.02;
}

function lowestEdge(pts) {
  let m = Infinity;
  for (const [name, pt] of Object.entries(pts)) {
    if (name === 'neck') continue;
    m = Math.min(m, pt[1] - radiusOf(name));
  }
  return m;
}

export class FigurePlayer {
  /**
   * def: { id, name, view:'side'|'front', duration, mat?, keyframes:[{t, pose, plant?, ease?, cue?}] }
   * A keyframe's `ease` and `cue` describe the move ARRIVING at that keyframe.
   * `plant` names a point that stays fixed on the ground while the keyframe is active:
   *   'ankleN','ankleF','toeN','toeF','kneeN','kneeF','handN','handF', or null (hips stay put).
   */
  constructor(canvas, def, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.def = def;
    this.view = def.view || 'side';
    this.duration = def.duration;
    this.speed = opts.speed || 1;
    this.loop = opts.loop !== undefined ? opts.loop : true;
    this.onState = opts.onState || (() => {});
    this.t = 0;
    this.playing = false;
    this.ended = false;
    this._raf = 0;
    this._last = 0;
    this.w = 300; this.h = 225; this.dpr = 1;
    this._prepare();
    this._fit();
    this.resize(canvas.clientWidth || 300, canvas.clientHeight || 225);
  }

  // Resolve keyframes and work out where each planted joint sits in the world.
  _prepare() {
    const src = [...this.def.keyframes].sort((a, b) => a.t - b.t);
    if (src[0].t !== 0) throw new Error(this.def.id + ': first keyframe must be at t=0');
    this.kf = src.map(k => ({
      t: k.t, pose: resolvePose(k.pose), plant: k.plant || null,
      ease: k.ease || 'sine', cue: k.cue || '', plantX: 0, hipX: 0,
    }));
    this.kf[this.kf.length - 1].t = this.duration;
    this.kf.forEach((k, i) => {
      const pts = solve(k.pose, this.view);
      if (i === 0) {
        k.hipX = 0;
        if (k.plant) { k.plantX = pts[k.plant][0]; }
        return;
      }
      const prev = this.kf[i - 1];
      // hip position that keeps the previous keyframe's planted point still
      k.hipX = prev.plant ? prev.plantX - pts[prev.plant][0] : prev.hipX;
      if (k.plant) {
        k.plantX = (k.plant === prev.plant) ? prev.plantX : k.hipX + pts[k.plant][0];
        k.hipX = k.plantX - pts[k.plant][0];
      }
    });
  }

  _eval(t) {
    const k = this.kf;
    let i = 0;
    while (i < k.length - 2 && t > k[i + 1].t) i++;
    const A = k[i], B = k[i + 1];
    const span = B.t - A.t;
    const u = span > 0 ? Math.min(1, Math.max(0, (t - A.t) / span)) : 1;
    const e = EASE[B.ease](u);
    const pose = lerpPose(A.pose, B.pose, e);
    const pts = solve(pose, this.view);
    const hx = kf => (kf.plant ? kf.plantX - pts[kf.plant][0] : kf.hipX);
    const hipX = hx(A) + (hx(B) - hx(A)) * e;
    const lift = -lowestEdge(pts) + Math.max(0, pose.air);
    const world = {};
    for (const [name, pt] of Object.entries(pts)) world[name] = [pt[0] + hipX, pt[1] + lift];
    return { world, pose, cue: B.cue || A.cue, air: Math.max(0, pose.air) };
  }

  // Fixed camera so the figure never jumps around the frame.
  _fit() {
    let minX = Infinity, maxX = -Infinity, maxY = 0;
    for (let t = 0; t <= this.duration; t += 25) {
      const { world } = this._eval(t);
      for (const [name, pt] of Object.entries(world)) {
        const r = radiusOf(name);
        minX = Math.min(minX, pt[0] - r); maxX = Math.max(maxX, pt[0] + r);
        maxY = Math.max(maxY, pt[1] + r);
      }
    }
    this.bounds = { minX, maxX, maxY };
  }

  resize(w, h) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.w = Math.max(50, w); this.h = Math.max(50, h);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.render();
  }

  render() {
    const ctx = this.ctx, W = this.w, H = this.h;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const b = this.bounds;
    // keep the figure above the control buttons (bottom strip) and clear of the view chip
    const reserve = this.h > 240 ? 76 : this.h * 0.26;
    const top = this.h > 240 ? 20 : 8;
    const areaH = H - reserve - top;
    const bw = (b.maxX - b.minX) + 0.2, bh = b.maxY + 0.1;
    const barH = Math.max(5, areaH * 0.03);
    const scale = Math.min((W * 0.92) / bw, (areaH - barH - 4) / bh);
    const camX = (b.minX + b.maxX) / 2;
    const contentH = bh * scale;
    const groundY = top + (areaH - barH - 4 - contentH) / 2 + contentH;
    const cy = top + areaH / 2;
    const X = x => W / 2 + (x - camX) * scale;
    const Y = y => groundY - y * scale;

    const { world: p, air } = this._eval(this.t);

    // soft circle behind the figure + rounded floor bar (Night Ops v2 look)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = C.circle;
    ctx.beginPath(); ctx.arc(W / 2, cy, Math.min(W, areaH) * 0.46, 0, Math.PI * 2); ctx.fill();
    const barW = W * 0.76;
    ctx.fillStyle = C.floor;
    roundRect(ctx, (W - barW) / 2, groundY + 1, barW, barH, barH / 2); ctx.fill();

    const seg = (a, c, w, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = w * scale;
      ctx.beginPath(); ctx.moveTo(X(a[0]), Y(a[1])); ctx.lineTo(X(c[0]), Y(c[1])); ctx.stroke();
    };
    const footStart = (suf) => {
      const toe = p['toe' + suf], ank = p['ankle' + suf];
      const dx = toe[0] - ank[0], dy = toe[1] - ank[1], l = Math.hypot(dx, dy) || 1;
      return [ank[0] - dx / l * 0.015, ank[1] - dy / l * 0.015];
    };
    const arm = (suf, col) => {
      seg(p['shoulder' + suf], p['elbow' + suf], 0.07, col);
      seg(p['elbow' + suf], p['hand' + suf], 0.062, col);
    };
    const leg = (suf, col) => {
      seg(p['hip' + suf], p['knee' + suf], 0.08, col);
      seg(p['knee' + suf], p['ankle' + suf], 0.065, col);
      seg(footStart(suf), p['toe' + suf], 0.05, col);
    };
    leg('F', C.far);
    arm('F', C.far);
    seg(p.hip, p.neck, 0.11, C.body);
    seg(p.neck, p.head, 0.06, C.body);
    ctx.fillStyle = C.body; ctx.beginPath();
    ctx.arc(X(p.head[0]), Y(p.head[1]), BODY.headR * scale, 0, Math.PI * 2); ctx.fill();
    leg('N', C.near);
    arm('N', C.near);
  }

  get cue() { return this._eval(this.t).cue; }
  get progress() { return this.duration ? this.t / this.duration : 0; }

  _emit() { this.onState(this); }

  play() {
    if (this.ended || this.t >= this.duration) { this.t = 0; }
    this.ended = false; this.playing = true; this._last = 0;
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(n => this._tick(n));
    this._emit();
  }
  pause() { this.playing = false; cancelAnimationFrame(this._raf); this._emit(); }
  toggle() { this.playing ? this.pause() : this.play(); }
  replay() { this.t = 0; this.ended = false; this.play(); }
  seek(ms) { this.t = Math.min(this.duration, Math.max(0, ms)); this.render(); this._emit(); }
  setSpeed(x) { this.speed = x; this._emit(); }
  setLoop(on) { this.loop = !!on; this._emit(); }

  _tick(now) {
    if (!this.playing) return;
    if (!this._last) this._last = now;
    const dt = Math.min(now - this._last, 100) * this.speed;
    this._last = now;
    this.t += dt;
    if (this.t >= this.duration) {
      if (this.loop) this.t = this.t % this.duration;
      else { this.t = this.duration; this.playing = false; this.ended = true; }
    }
    this.render(); this._emit();
    if (this.playing) this._raf = requestAnimationFrame(n => this._tick(n));
  }

  destroy() { this.playing = false; cancelAnimationFrame(this._raf); }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// ---------- UI: canvas + controls (play, pause, replay, slow-mo, loop, full screen) ----------

const ICON = {
  play: '<path d="M7 4l13 8-13 8z"/>',
  pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
  replay: '<path d="M4 4v6h6M4.5 15a8 8 0 1 0 2-8.3L4 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  loop: '<path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  exit: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
const svg = (p, n = 18) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${p}</svg>`;

export function mountAnimation(host, def, opts = {}) {
  host.classList.add('anim');
  host.innerHTML = `
    <div class="anim-stage"><canvas role="img" aria-label="Animated demonstration: ${def.name}"></canvas>
      <span class="anim-chip">${def.view === 'front' ? 'Front view' : 'Side view'}</span>
      <div class="anim-bar"><div class="anim-bar-fill"></div></div>
      <div class="anim-controls">
        <button type="button" class="anim-play" data-a="play" aria-label="Pause"></button>
        <div class="anim-tools">
          <button type="button" data-a="replay" aria-label="Replay">${svg(ICON.replay)}</button>
          <button type="button" data-a="loop" aria-pressed="true" aria-label="Loop playback">${svg(ICON.loop)}</button>
          <button type="button" class="anim-slow" data-a="slow" aria-pressed="false" aria-label="Slow motion, half speed">0.5×</button>
          <button type="button" data-a="full" aria-label="Full screen">${svg(ICON.full)}</button>
        </div>
      </div>
    </div>
    <p class="anim-cue" aria-live="off"></p>`;
  const $ = s => host.querySelector(s);
  const stage = $('.anim-stage'), canvas = $('canvas');
  const btn = a => host.querySelector(`[data-a="${a}"]`);
  const fsOK = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  if (!fsOK) btn('full').hidden = true;

  const player = new FigurePlayer(canvas, def, {
    loop: opts.loop,
    onState: pl => {
      const label = pl.playing ? 'Pause' : (pl.ended ? 'Replay' : 'Play');
      btn('play').innerHTML = svg(pl.playing ? ICON.pause : (pl.ended ? ICON.replay : ICON.play), 20);
      btn('play').setAttribute('aria-label', label + ' animation');
      $('.anim-bar-fill').style.width = (pl.progress * 100).toFixed(1) + '%';
      $('.anim-cue').textContent = pl.cue;
      btn('slow').setAttribute('aria-pressed', String(pl.speed < 1));
      btn('loop').setAttribute('aria-pressed', String(pl.loop));
    },
  });

  btn('play').onclick = () => player.toggle();
  btn('replay').onclick = () => player.replay();
  btn('slow').onclick = () => player.setSpeed(player.speed < 1 ? 1 : 0.5);
  btn('loop').onclick = () => player.setLoop(!player.loop);
  btn('full').onclick = () => {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (fs) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (host.requestFullscreen || host.webkitRequestFullscreen).call(host);
  };
  const onFs = () => {
    const on = (document.fullscreenElement || document.webkitFullscreenElement) === host;
    btn('full').innerHTML = svg(on ? ICON.exit : ICON.full);
    btn('full').setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
  };
  document.addEventListener('fullscreenchange', onFs);
  document.addEventListener('webkitfullscreenchange', onFs);

  const ro = new ResizeObserver(() => player.resize(stage.clientWidth, stage.clientHeight));
  ro.observe(stage);
  player._emit();
  if (opts.autoplay !== false) player.play();
  player.dispose = () => { ro.disconnect(); player.destroy(); };
  return player;
}
