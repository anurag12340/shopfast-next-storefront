import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Product } from '@shopfast-sdk/client';
import { BuyBox } from '@/components/BuyBox';
import { Media } from '@/components/Cover';
import { BoltIcon, ChatIcon, ShieldIcon, StarIcon } from '@/components/icons';
import { cardFromProduct, ProductGrid, ProductGridSkeleton } from '@/components/ProductCard';
import { config } from '@/lib/config';
import { date, plural, typeLabel } from '@/lib/format';
import { buyer, catalog, getShop, orNull } from '@/lib/shopfast';

interface Props {
  readonly params: Promise<{ readonly handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await orNull(catalog().products.get(handle));
  if (product === null) return { title: 'Product not found' };
  const image = product.seo.ogImageUrl ?? product.image?.url ?? null;
  return {
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.shortDescription,
    alternates: { canonical: `/products/${encodeURIComponent(product.handle)}` },
    openGraph: { title: product.title, description: product.shortDescription, type: 'website', ...(image === null ? {} : { images: [{ url: image }] }) },
  };
}

function Stars({ rating }: { readonly rating: number }) {
  return (
    <span className="stars" aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} filled={rating >= n - 0.25} />)}
    </span>
  );
}

/** schema.org Product, so search engines show price and stock. */
function jsonLd(product: Product, url: string): string {
  const variants = product.variants.length > 0 ? product.variants : [{ priceMinor: product.priceMinor, available: product.status.available }];
  const exp = product.currency === 'JPY' ? 0 : 2;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription,
    sku: product.id,
    ...(product.image === null ? {} : { image: product.image.url }),
    ...(product.rating === null ? {} : { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating.average, reviewCount: product.rating.count } }),
    offers: variants.map((v) => ({
      '@type': 'Offer', url, priceCurrency: product.currency, price: (v.priceMinor / 10 ** exp).toFixed(exp),
      availability: v.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    })),
  }).replace(/</g, '\\u003c');
}

async function Recommendations({ product }: { readonly product: Product }) {
  const recs = await catalog().products.recommendations(product.handle);
  let items = [...recs.upsells, ...recs.crossSells];
  const category = product.categoryHandles[0] ?? null;
  if (items.length < 4) {
    const more = await catalog().products.list(category === null ? { limit: 8 } : { category, limit: 8 });
    items = [...items, ...more.items.filter((p) => p.id !== product.id && !items.some((x) => x.id === p.id))];
  }
  if (items.length === 0) return null;
  return <ProductGrid products={items.slice(0, 4).map(cardFromProduct)} />;
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await orNull(catalog().products.get(handle));
  if (product === null) notFound();
  const [availability, shop] = await Promise.all([(await buyer()).products.availability(product.handle), getShop()]);
  const url = `${config.siteUrl}/products/${encodeURIComponent(product.handle)}`;
  const images = product.gallery.length > 0 ? product.gallery : product.image === null ? [] : [product.image];
  const main = images[0] ?? null;

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(product, url) }} />
      <div className="pdp">
        <nav className="crumbs pdp__crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/collections/all">Shop all</Link><span aria-hidden="true">/</span>
          <span>{product.title}</span>
        </nav>
        <div className="pdp__media">
          <Media seed={product.id} image={main} alt={product.title} code={product.type === 'license_key' || product.type === 'serial'} priority />
          {images.length > 1 ? (
            <div className="thumbs">
              {images.slice(0, 5).map((img) => <a key={img.url} href={img.url} target="_blank" rel="noreferrer"><img src={img.url} alt={img.alt} className="media" loading="lazy" /></a>)}
            </div>
          ) : null}
        </div>
        <div className="pdp__info">
          <div className="pdp__head">
            <span className="eyebrow">{typeLabel(product.type)}{product.promotion === null ? '' : ` · ${product.promotion.name}`}</span>
            <h1 className="pdp__title">{product.title}</h1>
          </div>
          <div className="pdp__rating">
            {product.rating === null
              ? <><span className="stars stars--empty"><StarIcon filled={false} /><StarIcon filled={false} /><StarIcon filled={false} /><StarIcon filled={false} /><StarIcon filled={false} /></span><span>No reviews yet</span></>
              : <><Stars rating={product.rating.average} /><span>{product.rating.average.toFixed(1)} · {plural(product.rating.count, 'review')}</span></>}
          </div>
          <p className="pdp__short">{product.shortDescription}</p>
          <BuyBox
            initial={availability}
            product={{
              id: product.id, handle: product.handle, currency: product.currency, priceMinor: product.priceMinor, compareAtMinor: product.compareAtMinor,
              delivers: product.delivers, minPerOrder: product.minPerOrder, maxPerOrder: product.maxPerOrder,
              variants: product.variants.map((v) => ({ id: v.id, title: v.title, priceMinor: v.priceMinor, compareAtMinor: v.compareAtMinor })),
            }}
          />
          <ul className="assure">
            <li><BoltIcon size={17} /><span>{product.delivers === '' ? 'Delivered right after payment' : product.delivers}</span></li>
            <li><ShieldIcon size={17} /><span>Secure checkout{shop.testMode ? ' (test mode)' : ''} by ShopFast</span></li>
            <li><ChatIcon size={17} /><span>Questions? <Link href="/support" className="link-arrow" style={{ display: 'inline' }}>Ask {shop.name}</Link></span></li>
          </ul>
        </div>
      </div>

      <section className="pdp-section" aria-labelledby="about-title">
        <h2 className="h2" id="about-title">About this product</h2>
        {product.descriptionHtml === ''
          ? <div className="prose"><p>{product.description}</p></div>
          : <div className="prose" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />}
      </section>

      <section className="pdp-section" aria-labelledby="reviews-title">
        <h2 className="h2" id="reviews-title">Reviews</h2>
        {product.rating === null || product.reviews.length === 0 ? (
          <div className="empty"><StarIcon size={22} filled={false} /><span>No reviews yet. Buyers can review after their order is delivered.</span></div>
        ) : (
          <>
            <div className="panel rating-summary"><span className="rating-summary__value">{product.rating.average.toFixed(1)}</span><Stars rating={product.rating.average} /><span className="muted">{plural(product.rating.count, 'review')}</span></div>
            <div className="reviews">
              {product.reviews.slice(0, 6).map((r) => (
                <article key={r.id} className="panel review">
                  <div className="review__head"><Stars rating={r.rating} /><span>{r.author}{r.verified ? ' · Verified buyer' : ''}</span><span>{date(r.createdAt)}</span></div>
                  {r.title === '' ? null : <h3 className="review__title">{r.title}</h3>}
                  <p className="review__body">{r.body}</p>
                  {r.reply === null ? null : <p className="review__reply"><strong>{shop.name}:</strong> {r.reply}</p>}
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="pdp-section" aria-labelledby="more-title">
        <h2 className="h2" id="more-title">You may also like</h2>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <Recommendations product={product} />
        </Suspense>
      </section>
    </div>
  );
}
