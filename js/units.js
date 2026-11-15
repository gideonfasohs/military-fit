// Unit helpers. Everything is STORED in metric (kg, cm) and only converted for display.
// A missing value is always null, never 0.
export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

const round1 = x => Math.round(x * 10) / 10;

export const isNum = v => typeof v === 'number' && Number.isFinite(v);

// "72,5" or " 72.5 " -> 72.5 ; "" or "abc" -> null
export function parseNumber(text) {
  if (text === null || text === undefined) return null;
  const t = String(text).trim().replace(',', '.');
  if (t === '' || !/^-?\d*\.?\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// ---- weight ----
export const kgToDisplay = (kg, unit) => (isNum(kg) ? round1(unit === 'lb' ? kg / KG_PER_LB : kg) : null);
export const displayToKg = (v, unit) => (isNum(v) ? Math.round((unit === 'lb' ? v * KG_PER_LB : v) * 100) / 100 : null);

// ---- lengths (height, waist, hip) ----
export const cmToDisplay = (cm, unit) => (isNum(cm) ? round1(unit === 'in' ? cm / CM_PER_IN : cm) : null);
export const displayToCm = (v, unit) => (isNum(v) ? Math.round((unit === 'in' ? v * CM_PER_IN : v) * 10) / 10 : null);

export function formatWeight(kg, unit) {
  const v = kgToDisplay(kg, unit);
  return v === null ? 'Not set' : `${v} ${unit}`;
}
export function formatLength(cm, unit) {
  const v = cmToDisplay(cm, unit);
  return v === null ? 'Not set' : `${v} ${unit}`;
}

// Allowed ranges for validation, in the unit being typed
export const RANGES = {
  age: [10, 100],
  height: { cm: [100, 250], in: [39, 99] },
  weight: { kg: [25, 300], lb: [55, 660] },
  waist: { cm: [40, 200], in: [16, 79] },
  hip: { cm: [50, 220], in: [20, 87] },
};
