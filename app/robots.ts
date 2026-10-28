import type { MetadataRoute } from 'next';
import { config } from '@/lib/config';
import { getShop } from '@/lib/shopfast';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const shop = await getShop();
  return {
    rules: shop.seo.allowIndexing ? { userAgent: '*', allow: '/', disallow: ['/cart', '/account', '/orders/', '/api/'] } : { userAgent: '*', disallow: '/' },
    sitemap: `${config.siteUrl}/sitemap.xml`,
  };
}
