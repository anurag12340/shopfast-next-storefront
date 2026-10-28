// The Storefront API on the server. Catalog answers (the shop, products, collections, pages) live in Next's Data Cache,
// tagged `shopfast:<shop>` so the storefront.updated webhook refreshes exactly what changed (app/api/revalidate).
// Buyer answers (cart, account, orders) are never cached and carry the buyer's IP and session.
import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { isShopFastError, type StorefrontClient } from '@shopfast-sdk/client';
import { createNextStorefrontClient } from '@shopfast-sdk/client/next';
import { config } from './config';
import { CART_COOKIE, CUSTOMER_COOKIE } from './cookies';

let shared: StorefrontClient | null = null;

/** The catalog client: the same for every buyer. Safe in generateMetadata, sitemaps and route handlers. */
export function catalog(): StorefrontClient {
  shared ??= createNextStorefrontClient({ shop: config.shop, key: config.key, apiUrl: config.apiUrl, revalidate: 300 });
  return shared;
}

/** The buyer's address as your host saw it (first hop of x-forwarded-for), for per-buyer limits and fraud checks. */
function buyerIp(h: Headers): string | null {
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const ip = forwarded === '' ? (h.get('x-real-ip')?.trim() ?? '') : forwarded;
  return /^[0-9a-f.:]{2,45}$/i.test(ip) ? ip : null;
}

/** The client for this request: the buyer's IP and, when signed in, their session. */
export const buyer = cache(async (): Promise<StorefrontClient> => {
  const [h, c] = await Promise.all([headers(), cookies()]);
  return catalog().with({ buyerIp: buyerIp(h), customerToken: c.get(CUSTOMER_COOKIE)?.value ?? null });
});

/* ---------------------------------------------------------------- cached reads, deduplicated per request */

export const getShop = cache(() => catalog().shop.get());
export const getCollections = cache(() => catalog().collections.list());
export const getCategories = cache(() => catalog().categories.list());
export const getPolicies = cache(() => catalog().shop.policies());

/** The buyer's cart, or null when there is none (or it expired). */
export const getCart = cache(async () => {
  const id = (await cookies()).get(CART_COOKIE)?.value ?? '';
  if (id === '') return null;
  try {
    return await (await buyer()).cart.get(id);
  } catch (error) {
    if (isShopFastError(error) && (error.status === 404 || error.status === 410)) return null;
    throw error;
  }
});

/** A 404 from the API as null (for notFound()); anything else is thrown. */
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (isShopFastError(error) && error.status === 404) return null;
    throw error;
  }
}
