'use server';
import type { ProductListQuery } from '@shopfast-sdk/client';
import { cardFromProduct, type CardData } from '@/components/ProductCard';
import { catalog } from '@/lib/shopfast';

export interface MoreProducts {
  readonly items: readonly CardData[];
  readonly nextCursor: string | null;
}

/** The next page of a product list (a collection, a category or everything), for "Show more". */
export async function loadMore(source: 'collection' | 'category', handle: string, sort: ProductListQuery['sort'] & string, after: string): Promise<MoreProducts> {
  const page = source === 'category'
    ? (await catalog().categories.get(handle, { sort, after, limit: 12 })).products
    : (await catalog().collections.get(handle, { sort, after, limit: 12 })).products;
  return { items: page.items.map(cardFromProduct), nextCursor: page.nextCursor };
}
