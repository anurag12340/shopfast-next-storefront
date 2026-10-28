'use server';
// Reads for the browser islands (live stock, search suggestions). Server actions keep them typed end to end and the
// storefront key on the server.
import type { Availability } from '@shopfast-sdk/client';
import { money } from '@/lib/format';
import { buyer, catalog } from '@/lib/shopfast';

/** Live stock and sales status: never cached, polled by the product page. */
export async function liveAvailability(handle: string): Promise<Availability | null> {
  try {
    return await (await buyer()).products.availability(handle);
  } catch {
    return null;
  }
}

export interface Suggestion {
  readonly kind: 'product' | 'collection' | 'category' | 'page';
  readonly href: string;
  readonly title: string;
  readonly meta: string;
  /** [start, end) ranges of `title` that match what was typed. */
  readonly highlight: readonly (readonly [number, number])[];
}

export interface Suggestions {
  readonly q: string;
  readonly items: readonly Suggestion[];
  readonly didYouMean: string | null;
}

const HREF: Readonly<Record<'collection' | 'category' | 'page', string>> = { collection: '/collections/', category: '/categories/', page: '/policies/' };

export async function suggest(q: string): Promise<Suggestions> {
  const query = q.trim().slice(0, 100);
  if (query === '') return { q, items: [], didYouMean: null };
  const s = await catalog().search.suggest({ q: query, limit: 6 });
  const items: Suggestion[] = [
    ...s.products.map((p): Suggestion => ({
      kind: 'product', href: `/products/${encodeURIComponent(p.handle)}`, title: p.title, highlight: p.highlight,
      meta: `${p.typeLabel} · ${p.priceMaxMinor > p.priceMinor ? 'from ' : ''}${money(p.priceMinor, p.currency)}`,
    })),
    ...[...s.categories, ...s.collections, ...s.pages].map((c): Suggestion => ({
      kind: c.kind, href: `${HREF[c.kind]}${encodeURIComponent(c.handle)}`, title: c.title, highlight: c.highlight,
      meta: c.kind === 'page' ? 'Page' : `${c.kind === 'category' ? 'Category' : 'Collection'}${c.productCount === null ? '' : ` · ${String(c.productCount)} products`}`,
    })),
  ];
  return { q, items: items.slice(0, 8), didYouMean: s.query.didYouMean };
}
