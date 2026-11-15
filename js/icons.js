// Small 2px line icons (inline SVG, no emoji). Usage: icon('home', 22)
const P = {
  home: '<path d="M3 11l9-7 9 7v9H3z"/>',
  workouts: '<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',
  library: '<path d="M4 5h6v14H4zM14 5h6v14h-6z"/>',
  progress: '<path d="M4 19l5-6 4 3 7-9"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/>',
  repeat: '<path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4"/>',
  pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  alert: '<path d="M12 3l10 18H2zM12 10v5M12 18h.01"/>',
  sprout: '<path d="M12 21v-8M12 13c0-4 3-6 7-6 0 4-3 6-7 6zM12 15c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  clock: '<path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-14 0 9-5 14-13 14M5 19c2-4 5-7 9-9"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M13 5v4M7 15v4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  fat: '<path d="M12 3c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-7z"/>',
  belly: '<path d="M3 8h18v8H3zM7 8v3M11 8v4M15 8v3"/>',
  endurance: '<path d="M3 12h4l2-4 3 8 2-4h7"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  mobility: '<path d="M4 12c3-2 13-2 16 0M12 7v8M8 20l4-5 4 5M12 3.5v.1"/>',
  check: '<path d="M5 12l4 4 10-10"/>',
  pencil: '<path d="M4 20l4-1 11-11-3-3L5 16z"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  walk: '<circle cx="13" cy="4.5" r="1.6"/><path d="M9 21l3-7 3 3v4M12 14l-1-5 5 1 2 3M9 11l-3 3"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  tick: '<path d="M5 12l5 5 9-10"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
};

export function icon(name, size = 22) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

// A rounded square with a gold icon (the "icon tile" from the design guide)
export function tile(name, size = 36) {
  return `<span class="tile" style="width:${size}px;height:${size}px">${icon(name, Math.round(size * 0.55))}</span>`;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
