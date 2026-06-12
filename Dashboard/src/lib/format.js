import { INSUFFICIENT } from './constants';

// 0.6889 -> "69%"; null -> "Insufficient data"
export function fmtPct(x, digits = 0) {
  if (x === null || x === undefined) return INSUFFICIENT;
  return `${(x * 100).toFixed(digits)}%`;
}

// 14617 -> "14,617"
export function fmtInt(x) {
  if (x === null || x === undefined) return INSUFFICIENT;
  return x.toLocaleString('en-US');
}

// 91.05 -> "91"
export function fmtScore(x) {
  if (x === null || x === undefined) return INSUFFICIENT;
  return Math.round(x).toString();
}

// 224.5 -> "225 hours"; 0.8 -> "0.8 hours"
export function fmtHours(x) {
  if (x === null || x === undefined) return INSUFFICIENT;
  const n = x < 10 ? Math.round(x * 10) / 10 : Math.round(x);
  return `${n.toLocaleString('en-US')} hours`;
}
