import type { MetadataRoute } from 'next';
import { config } from '@/lib/config';
import { catalog, getCategories, getCollections, getPolicies } from '@/lib/shopfast';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.siteUrl;
  const products: MetadataRoute.Sitemap = [];
  for await (const p of catalog().products.iterate({ limit: 100 })) {
    products.push({ url: `${base}/products/${encodeURIComponent(p.handle)}`, lastModified: p.updatedAt, ...(p.image === null ? {} : { images: [p.image.url] }) });
    if (products.length >= 5_000) break;
  }
  const [collections, categories, policies] = await Promise.all([getCollections(), getCategories(), getPolicies()]);
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    ...collections.items.map((c) => ({ url: `${base}/collections/${encodeURIComponent(c.handle)}`, lastModified: c.updatedAt })),
    ...categories.items.map((c) => ({ url: `${base}/categories/${encodeURIComponent(c.handle)}`, lastModified: c.updatedAt })),
    ...products,
    ...policies.items.map((p) => ({ url: `${base}/policies/${encodeURIComponent(p.handle)}`, lastModified: p.updatedAt })),
  ];
}
