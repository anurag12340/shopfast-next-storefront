// The storefront.updated webhook: ShopFast posts here when buyers can see something new, with the cache tags it
// purged, and the matching pages refresh. Point a webhook endpoint (Settings → Developers → Webhooks) at
// https://<your site>/api/revalidate with the storefront.updated event, and set SHOPFAST_WEBHOOK_SECRET to its secret.
import { revalidateTag } from 'next/cache';
import { handleRevalidationWebhook } from '@shopfast-sdk/client/next';
import { config } from '@/lib/config';

export function POST(request: Request): Promise<Response> {
  return handleRevalidationWebhook(request, { secret: config.webhookSecret, revalidateTag, shop: config.shop });
}
