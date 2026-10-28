import Link from 'next/link';
import { Media } from '@/components/Cover';
import { ArrowRight } from '@/components/icons';
import { cardFromProduct, Price, ProductGrid } from '@/components/ProductCard';
import { plural } from '@/lib/format';
import { catalog, getCategories, getCollections, getShop } from '@/lib/shopfast';

export default async function Home() {
  const [shop, collections, categories, featured] = await Promise.all([
    getShop(), getCollections(), getCategories(), catalog().products.list({ sort: 'featured', limit: 8 }),
  ]);
  const spotlight = featured.items.find((p) => p.featured) ?? featured.items[0] ?? null;
  const lead = shop.tagline !== '' ? shop.tagline : (shop.seo.description ?? `Browse ${plural(shop.stats.productsCount, 'product')} and check out securely. Orders are delivered the moment payment clears.`);
  const browse = collections.items.find((c) => c.handle !== 'all') ?? null;
  const topCategories = categories.items.filter((c) => c.parentId === null);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__text">
            <div className="hero__eyebrow">
              <span className="chip"><span className={`dot dot--${shop.status === 'open' ? 'good' : 'warn'}`} />{shop.status === 'open' ? 'Open for orders' : 'Not taking orders'}</span>
              <span className="eyebrow">{plural(shop.stats.productsCount, 'product')}</span>
            </div>
            <h1 className="hero__title">{shop.name}</h1>
            <p className="hero__lead">{lead}</p>
            <div className="hero__cta">
              <Link href="/collections/all" className="btn btn--primary btn--lg">Shop all products</Link>
              {browse === null
                ? <Link href="/search" className="btn btn--secondary btn--lg">Search the store</Link>
                : <Link href={`/collections/${encodeURIComponent(browse.handle)}`} className="btn btn--secondary btn--lg">{browse.title}</Link>}
            </div>
            <dl className="hero__stats">
              <div className="stat"><dt className="stat__label">Products</dt><dd className="stat__value">{shop.stats.productsCount}</dd></div>
              <div className="stat"><dt className="stat__label">Categories</dt><dd className="stat__value">{topCategories.length}</dd></div>
              {shop.stats.reviewCount > 0
                ? <div className="stat"><dt className="stat__label">{plural(shop.stats.reviewCount, 'review')}</dt><dd className="stat__value">{shop.stats.rating.toFixed(1)}★</dd></div>
                : <div className="stat"><dt className="stat__label">Collections</dt><dd className="stat__value">{collections.items.length}</dd></div>}
            </dl>
          </div>
          <div className="hero__art">
            <Media seed={shop.id} image={null} alt="" />
            {spotlight === null ? null : (
              <Link href={`/products/${encodeURIComponent(spotlight.handle)}`} className="spotlight">
                <span className="spotlight__thumb"><Media seed={spotlight.id} image={spotlight.image} alt={spotlight.title} priority /></span>
                <span className="spotlight__text">
                  <span className="spotlight__label">Featured</span>
                  <span className="spotlight__title">{spotlight.title}</span>
                  <Price minor={spotlight.priceMinor} currency={spotlight.currency} compareAt={spotlight.compareAtMinor} />
                </span>
                <ArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="collections-title">
        <div className="section__head">
          <div><span className="eyebrow">Collections</span><h2 className="h2" id="collections-title">Hand-picked for you</h2></div>
          <Link href="/collections/all" className="link-arrow">Everything <ArrowRight size={15} /></Link>
        </div>
        <div className="rail">
          {collections.items.map((c) => (
            <Link key={c.handle} href={`/collections/${encodeURIComponent(c.handle)}`} className="collection-card">
              <Media seed={`collection:${c.handle}`} image={c.imageUrl === null ? null : { url: c.imageUrl, alt: c.title }} alt={c.title} />
              <span className="collection-card__body">
                <span className="collection-card__title">{c.title}</span>
                <span className="collection-card__meta">{plural(c.productsCount, 'product')}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container" aria-labelledby="categories-title">
        <div className="section__head">
          <div><span className="eyebrow">Categories</span><h2 className="h2" id="categories-title">Shop by category</h2></div>
          <Link href="/search" className="link-arrow">Search <ArrowRight size={15} /></Link>
        </div>
        <div className="rail">
          {topCategories.length === 0
            ? <Link href="/collections/all" className="chip-link">All products <span className="mono">{shop.stats.productsCount}</span></Link>
            : topCategories.map((c) => (
              <Link key={c.handle} href={`/categories/${encodeURIComponent(c.handle)}`} className="chip-link">{c.title} <span className="mono">{c.productsCount}</span></Link>
            ))}
        </div>
      </section>

      <section className="section container" aria-labelledby="featured-title">
        <div className="section__head">
          <div><span className="eyebrow">Featured</span><h2 className="h2" id="featured-title">Popular right now</h2></div>
          <Link href="/collections/all" className="link-arrow">View all <ArrowRight size={15} /></Link>
        </div>
        <ProductGrid products={featured.items.map(cardFromProduct)} priority={4} />
      </section>
    </>
  );
}
