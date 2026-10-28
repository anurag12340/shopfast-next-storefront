// A collection or category page: the head, a toolbar (count, subcategories, sort) and the products, a page at a time.
// Every part above the grid has a fixed height; the skeleton below uses the same parts.
import Link from 'next/link';
import type { ProductPage } from '@shopfast-sdk/client';
import { plural } from '@/lib/format';
import { LoadMore } from './LoadMore';
import { cardFromProduct, ProductGrid, ProductGridSkeleton } from './ProductCard';
import { Loading, Sk } from './Skeleton';
import type { SortValue } from '@/lib/sort';
import { SortSelect } from './SortSelect';

export interface ListingProps {
  readonly source: 'collection' | 'category';
  readonly handle: string;
  readonly crumbs: readonly { readonly href: string; readonly label: string }[];
  readonly title: string;
  readonly description: string;
  readonly chips: readonly { readonly href: string; readonly label: string; readonly count: number }[];
  readonly sort: SortValue;
  readonly page: ProductPage;
}

export function Listing({ source, handle, crumbs, title, description, chips, sort, page }: ListingProps) {
  return (
    <div className="container">
      <header className="listing-head">
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map((c) => <span key={c.href} style={{ display: 'contents' }}><Link href={c.href}>{c.label}</Link><span aria-hidden="true">/</span></span>)}
          <span>{title}</span>
        </nav>
        <h1 className="h1">{title}</h1>
        <p className="listing-head__desc">{description === '' ? `${plural(page.total, 'product')}, delivered right after payment.` : description}</p>
      </header>
      <div className="toolbar">
        <span className="toolbar__count">{plural(page.total, 'product')}</span>
        <div className="toolbar__chips">
          {chips.map((c) => <Link key={c.href} href={c.href} className="chip-link">{c.label} <span className="mono">{c.count}</span></Link>)}
        </div>
        <SortSelect value={sort} />
      </div>
      {page.items.length === 0 ? (
        <div className="empty"><h2 className="h2">Nothing here yet</h2><p>New products show up here as soon as the store publishes them.</p><Link href="/collections/all" className="btn btn--secondary">Browse everything</Link></div>
      ) : (
        <>
          <ProductGrid products={page.items.map(cardFromProduct)} priority={4} />
          <LoadMore key={`${handle}:${sort}`} source={source} handle={handle} sort={sort} after={page.nextCursor} total={page.total} shown={page.items.length} />
        </>
      )}
    </div>
  );
}

export function ListingSkeleton({ label }: { readonly label: string }) {
  return (
    <div className="container">
      <Loading label={label} />
      <header className="listing-head">
        <div className="crumbs"><Sk w="160px" /></div>
        <span className="h1"><Sk w="300px" /></span>
        <div className="listing-head__desc is-sk"><Sk w="90%" /><Sk w="50%" /></div>
      </header>
      <div className="toolbar">
        <span className="toolbar__count"><Sk w="10ch" /></span>
        <div className="toolbar__chips" />
        <span className="sort"><Sk w="150px" /></span>
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
