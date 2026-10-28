// Generated covers for products and collections without a picture: folded planes on a 30° angle, tinted a few hue
// steps around the store's brand color (the colors live in CSS, so light and dark themes both work).

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const COVER_W = 400;
export const COVER_H = 300;
const T30 = Math.tan(Math.PI / 6);
const HUE_STEPS: readonly number[] = [-48, -30, -14, 0, 0, 14, 30, 46];
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export interface CoverPlane {
  readonly d: string;
  /** 1 = deepest … 4 = brightest; 0 = shade. */
  readonly tone: 0 | 1 | 2 | 3 | 4;
}

export interface CoverArt {
  readonly planes: readonly CoverPlane[];
  readonly hue: number;
  /** A license-key-looking code ("FCP-7Q2M-K8D4"), drawn on key products. Decorative. */
  readonly code: string;
}

/** A band of thickness `t` at ±30° through (cx, cy), long enough to cross the frame. */
function band(cx: number, cy: number, t: number, dir: 1 | -1): string {
  const y = (x: number): number => cy - dir * (x - cx) * T30;
  const x0 = -60;
  const x1 = COVER_W + 60;
  const r = (n: number): string => n.toFixed(1);
  return `M${r(x0)} ${r(y(x0) - t / 2)}L${r(x1)} ${r(y(x1) - t / 2)}L${r(x1)} ${r(y(x1) + t / 2)}L${r(x0)} ${r(y(x0) + t / 2)}Z`;
}

export function coverArt(seed: string): CoverArt {
  const r = rng(hash(seed));
  const dir: 1 | -1 = r() > 0.5 ? 1 : -1;
  const planes: CoverPlane[] = [
    { d: band(COVER_W * (0.3 + r() * 0.4), COVER_H * (0.35 + r() * 0.3), 150 + r() * 70, dir), tone: 2 },
    { d: band(COVER_W * (0.2 + r() * 0.6), COVER_H * (0.55 + r() * 0.3), 70 + r() * 50, dir === 1 ? -1 : 1), tone: 3 },
    { d: band(COVER_W * (0.25 + r() * 0.5), COVER_H * (0.2 + r() * 0.5), 14 + r() * 18, dir), tone: 4 },
    // The fold: a darker wedge under the widest plane.
    { d: `M0 ${(COVER_H * (0.72 + r() * 0.2)).toFixed(1)}L${COVER_W} ${(COVER_H * (0.45 + r() * 0.3)).toFixed(1)}L${COVER_W} ${COVER_H}L0 ${COVER_H}Z`, tone: 0 },
  ];
  const block = (n: number): string => Array.from({ length: n }, () => CODE_CHARS[Math.floor(r() * CODE_CHARS.length)] ?? 'X').join('');
  return { planes, hue: HUE_STEPS[Math.floor(r() * HUE_STEPS.length)] ?? 0, code: `${block(3)}-${block(4)}-${block(4)}` };
}
