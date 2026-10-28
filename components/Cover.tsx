import { COVER_H, COVER_W, coverArt } from '@/lib/cover';

const TONE_LIGHTNESS = ['var(--cv-shade)', 'var(--cv-1)', 'var(--cv-2)', 'var(--cv-3)', 'var(--cv-4)'];

/** A product's picture, or its generated cover when it has none. Fills its frame; the frame sets the size. */
export function Media({ seed, image, alt, code = false, priority = false }: {
  readonly seed: string;
  readonly image: { readonly url: string; readonly alt: string } | null;
  readonly alt: string;
  readonly code?: boolean;
  readonly priority?: boolean;
}) {
  if (image !== null) {
    return <img className="media" src={image.url} alt={image.alt === '' ? alt : image.alt} loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'} />;
  }
  return <Cover seed={seed} code={code} />;
}

export function Cover({ seed, code = false }: { readonly seed: string; readonly code?: boolean }) {
  const art = coverArt(seed);
  const fill = (tone: number): string => tone === 0
    ? `oklch(from var(--brand) ${TONE_LIGHTNESS[0] ?? '0.2'} calc(c * 0.35) calc(h + ${String(art.hue)}) / 0.55)`
    : `oklch(from var(--brand) ${TONE_LIGHTNESS[tone] ?? '0.4'} calc(c * var(--cv-chroma)) calc(h + ${String(art.hue + tone * 6)}))`;
  return (
    <svg className="media cover" viewBox={`0 0 ${String(COVER_W)} ${String(COVER_H)}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width={COVER_W} height={COVER_H} style={{ fill: `oklch(from var(--brand) var(--cv-bg) calc(c * 0.4) calc(h + ${String(art.hue)}))` }} />
      {art.planes.map((p) => <path key={p.d} d={p.d} style={{ fill: fill(p.tone) }} />)}
      {code ? <text className="cover__code" x="24" y={COVER_H - 24}>{art.code}</text> : null}
    </svg>
  );
}
