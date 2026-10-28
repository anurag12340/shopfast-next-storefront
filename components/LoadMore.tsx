'use client';
// "Show more" for cursor-paginated lists: the next page appends below, with exactly as many skeleton cards as products
// are still to come (up to a page), so nothing below jumps when they arrive.
import { useState, useTransition } from 'react';
import type { ProductListQuery } from '@shopfast-sdk/client';
import { loadMore } from '@/app/actions/catalog';
import { ProductCard, ProductCardSkeleton, type CardData } from './ProductCard';

const PAGE = 12;

export function LoadMore({ source, handle, sort, after, total, shown }: {
  readonly source: 'collection' | 'category';
  readonly handle: string;
  readonly sort: ProductListQuery['sort'] & string;
  readonly after: string | null;
  readonly total: number;
  readonly shown: number;
}) {
  const [items, setItems] = useState<readonly CardData[]>([]);
  const [cursor, setCursor] = useState(after);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const remaining = Math.max(0, total - shown - items.length);

  const more = (): void => {
    if (cursor === null) return;
    setError('');
    start(async () => {
      try {
        const page = await loadMore(source, handle, sort, cursor);
        setItems((prev) => [...prev, ...page.items]);
        setCursor(page.nextCursor);
      } catch {
        setError('Could not load more products. Try again.');
      }
    });
  };

  return (
    <>
      {items.length > 0 || pending ? (
        <div className="grid grid--more">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
          {pending ? Array.from({ length: Math.min(PAGE, remaining) }, (_, i) => <ProductCardSkeleton key={`sk-${String(i)}`} />) : null}
        </div>
      ) : null}
      <div className="more">
        <span className="more__count">Showing {Math.min(total, shown + items.length)} of {total}</span>
        {cursor !== null && remaining > 0 ? (
          <button type="button" className="btn btn--secondary" onClick={more} disabled={pending}>{pending ? 'Loading…' : `Show ${String(Math.min(PAGE, remaining))} more`}</button>
        ) : null}
        <span className="more__error" role="alert">{error}</span>
      </div>
    </>
  );
}
