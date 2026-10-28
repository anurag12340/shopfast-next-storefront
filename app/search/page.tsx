import type { Metadata } from 'next';
import Link from 'next/link';
import { cardFromSearch, ProductGrid } from '@/components/ProductCard';
import { SearchBox } from '@/components/SearchBox';
import { plural } from '@/lib/format';
import { catalog } from '@/lib/shopfast';

interface Props {
  readonly searchParams: Promise<Partial<Record<string, string | string[]>>>;
}

const SORTS = [
  { value: '', label: 'Best match' },
  { value: 'best_selling', label: 'Best selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price, low to high' },
  { value: 'price_desc', label: 'Price, high to low' },
];

function one(v?: string | string[]): string {
  return typeof v === 'string' ? v : '';
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = one((await searchParams)['q']).trim();
  return { title: q === '' ? 'Search' : `Search: ${q}`, robots: { index: false } };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = one(params['q']).trim();
  const sort = one(params['sort']);
  const type = one(params['type']);
  const asked = Number.parseInt(one(params['page']), 10);
  const page = Number.isNaN(asked) ? 1 : Math.max(1, asked);
  const result = await catalog().search.query({ q, sort, type, page: String(page), perPage: 24 });
  const href = (over: Readonly<Record<string, string>>): string => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, sort, type, ...over })) if (v !== '' && !(k === 'page' && v === '1')) u.set(k, v);
    return `/search?${u.toString()}`;
  };
  const typeFacet = result.facets.find((f) => f.key === 'type');
  const fix = result.query.corrected ?? null;

  return (
    <div className="container">
      <header className="page-title">
        <span className="eyebrow">Search</span>
        <SearchBox key={q} initial={q} autoFocus={q === ''} />
        <p className="search-meta">
          {fix === null
            ? <span>{q === '' ? `All ${plural(result.total, 'product')}` : `${plural(result.total, 'result')} for “${q}”`}</span>
            : <span>Showing results for “{fix.to}” instead of “{fix.from}”</span>}
          {result.query.didYouMean === null ? null : <span>Did you mean <Link href={href({ q: result.query.didYouMean, page: '1' })}>{result.query.didYouMean}</Link>?</span>}
        </p>
      </header>
      <div className="toolbar">
        <div className="toolbar__chips">
          <Link href={href({ type: '', page: '1' })} className="chip-link" aria-current={type === '' ? 'page' : undefined}>All types</Link>
          {(typeFacet?.values ?? []).map((v) => (
            <Link key={v.value} href={href({ type: v.value, page: '1' })} className="chip-link" aria-current={v.selected ? 'page' : undefined}>{v.label} <span className="mono">{v.count}</span></Link>
          ))}
        </div>
        <nav className="toolbar__chips toolbar__chips--end" aria-label="Sort">
          {SORTS.map((s) => <Link key={s.value} href={href({ sort: s.value, page: '1' })} className="chip-link" aria-current={sort === s.value ? 'page' : undefined}>{s.label}</Link>)}
        </nav>
      </div>
      {result.products.length === 0 ? (
        <div className="empty">
          <h2 className="h2">No products match “{q}”</h2>
          <p>Try a shorter word, or one of these: {result.popular.slice(0, 4).map((p, i) => <span key={p}>{i > 0 ? ', ' : ''}<Link href={href({ q: p, page: '1' })} style={{ color: 'var(--accent-ink)' }}>{p}</Link></span>)}</p>
        </div>
      ) : (
        <>
          <ProductGrid products={result.products.map(cardFromSearch)} priority={4} />
          {result.pageCount > 1 ? (
            <div className="more">
              <span className="more__count">Page {result.page} of {result.pageCount}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {result.page > 1 ? <Link href={href({ page: String(result.page - 1) })} className="btn btn--secondary">Previous</Link> : null}
                {result.page < result.pageCount ? <Link href={href({ page: String(result.page + 1) })} className="btn btn--secondary">Next page</Link> : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
