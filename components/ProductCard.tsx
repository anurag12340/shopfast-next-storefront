// A product card, and its skeleton built from the same frame. Works in server and client components.
import Link from 'next/link';
import type { ProductSummary, SearchResult } from '@shopfast-sdk/client';
import { money, stockText, typeLabel } from '@/lib/format';
import { Media } from './Cover';
import { Sk, SkBlock } from './Skeleton';

/** What a card shows, from a catalog product or a search hit. */
export interface CardData {
  readonly id: string;
  readonly handle: string;
  readonly title: string;
  readonly blurb: string;
  readonly type: string;
  readonly image: { readonly url: string; readonly alt: string } | null;
  readonly priceMinor: number;
  /** A range ("from") when options cost different amounts. */
  readonly priceFrom: boolean;
  readonly compareAtMinor: number | null;
  readonly currency: string;
  readonly stock: { readonly text: string; readonly tone: 'good' | 'warn' | 'bad' };
}

export function cardFromProduct(p: ProductSummary): CardData {
  const prices = p.variants.map((v) => v.priceMinor);
  const low = prices.length > 0 ? Math.min(...prices) : p.priceMinor;
  return {
    id: p.id, handle: p.handle, title: p.title, blurb: p.shortDescription, type: p.type, image: p.image,
    priceMinor: low, priceFrom: prices.some((x) => x !== low), compareAtMinor: p.compareAtMinor, currency: p.currency, stock: stockText(p.status),
  };
}

export function cardFromSearch(p: SearchResult['products'][number]): CardData {
  return {
    id: p.id, handle: p.handle, title: p.title, blurb: p.typeLabel, type: p.type, image: p.imageUrl === null ? null : { url: p.imageUrl, alt: p.title },
    priceMinor: p.priceMinor, priceFrom: p.priceMaxMinor > p.priceMinor, compareAtMinor: p.compareAtMinor, currency: p.currency,
    stock: stockText({ available: p.available, stock: p.stock, lowStock: p.lowStock, preorder: p.preorder }),
  };
}

export function Price({ minor, currency, compareAt = null, from = false, className = '' }: {
  readonly minor: number; readonly currency: string; readonly compareAt?: number | null; readonly from?: boolean; readonly className?: string;
}) {
  const free = minor === 0;
  return (
    <span className={`price ${className}`}>
      {from ? <span className="price__from">From </span> : null}
      {free ? 'Free' : money(minor, currency)}
      {compareAt !== null && compareAt > minor ? <s className="price__was">{money(compareAt, currency)}</s> : null}
    </span>
  );
}

export function ProductCard({ product, priority = false }: { readonly product: CardData; readonly priority?: boolean }) {
  const sale = product.compareAtMinor !== null && product.compareAtMinor > product.priceMinor
    ? Math.round((1 - product.priceMinor / product.compareAtMinor) * 100)
    : 0;
  return (
    <Link href={`/products/${encodeURIComponent(product.handle)}`} className="card">
      <span className="card__media">
        <Media seed={product.id} image={product.image} alt={product.title} code={product.type === 'license_key' || product.type === 'serial'} priority={priority} />
        <span className="chip card__chip">{typeLabel(product.type)}</span>
        {sale > 0 ? <span className="chip chip--accent card__sale">−{sale}%</span> : null}
      </span>
      <span className="card__body">
        <span className="card__title" title={product.title}>{product.title}</span>
        <span className="card__blurb">{product.blurb}</span>
        <span className="card__foot">
          <Price minor={product.priceMinor} currency={product.currency} compareAt={product.compareAtMinor} from={product.priceFrom} />
          <span className={`stock stock--${product.stock.tone}`}><span className="dot" />{product.stock.tone === 'good' ? 'In stock' : product.stock.text}</span>
        </span>
      </span>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <span className="card card--skeleton">
      <span className="card__media"><SkBlock /></span>
      <span className="card__body">
        <span className="card__title"><Sk w="70%" /></span>
        <span className="card__blurb"><Sk w="60%" /></span>
        <span className="card__foot">
          <span className="price"><Sk w="7ch" /></span>
          <span className="stock"><Sk w="8ch" /></span>
        </span>
      </span>
    </span>
  );
}

export function ProductGrid({ products, priority = 0 }: { readonly products: readonly CardData[]; readonly priority?: number }) {
  return (
    <div className="grid">
      {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < priority} />)}
    </div>
  );
}

export function ProductGridSkeleton({ count }: { readonly count: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
