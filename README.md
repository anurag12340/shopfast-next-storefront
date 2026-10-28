# ShopFast Next.js starter

A complete headless store on the Next.js App Router, running on your ShopFast store through the Storefront API and
[`@shopfast-sdk/client`](https://www.npmjs.com/package/@shopfast-sdk/client). Server components fetch the catalog with a private key, server actions run the
cart and buyer sign-in, and ShopFast's own checkout takes the payment.

- **Home**: the store's hero, collections, categories and featured products
- **Products**: gallery, options, live stock (polled while the page is visible), reviews, recommendations, add to cart
- **Collections and categories**: sorting and "Show more" with cursor pagination
- **Search**: suggestions as you type, results with type filters and sorting
- **Cart**: quantities, discount codes and gift cards in one field, hosted checkout or the checkout embedded on this site
- **Account**: sign-in with an emailed code, orders, license keys and downloads, wallet, subscriptions (cancel), tickets
- **Orders** (`/orders/<id>?access=…`), **policies**, a **support** form, a sitemap, robots and Product JSON-LD
- **Revalidation**: `/api/revalidate` refreshes exactly what changed when ShopFast sends `storefront.updated`

Every route has a `loading.tsx` drawn from the page's own layout, so nothing moves when the page arrives. Dark by
default, with light and system themes from the footer; the accent is the store's brand color.

## Set up

1. Get the code:

   ```sh
   npx degit anurag12340/shopfast-next-storefront my-store
   cd my-store
   ```

2. In your ShopFast dashboard, open **Settings → Headless & MCP** and create a **private** storefront key (`sfsk_…`).
3. Copy `.env.example` to `.env.local` and fill it in:

   ```sh
   SHOPFAST_SHOP=your-store-handle
   SHOPFAST_STOREFRONT_KEY=sfsk_live_…
   SHOPFAST_WEBHOOK_SECRET=whsec_…   # step 5
   SITE_URL=https://shop.example.com
   ```

4. Install and run:

   ```sh
   npm install
   npm run dev       # http://localhost:3000
   npm run build && npm start
   ```

5. In **Settings → Developers → Webhooks**, add an endpoint at `https://<your site>/api/revalidate` for the
   **storefront.updated** event, and put its signing secret in `SHOPFAST_WEBHOOK_SECRET`. Catalog pages then update
   seconds after you save a product; without it they refresh every 5 minutes.
6. For the embedded checkout ("Pay without leaving this page"), add your site's origin in
   **Settings → Developers → Embeds**. The hosted checkout needs nothing.

Deploy it anywhere Next.js runs (Vercel, Netlify, a Node server) with the same variables.

## How it fits together

| File | What it does |
| --- | --- |
| `lib/shopfast.ts` | `catalog()` (shared answers, Data Cache, tagged) and `buyer()` (this buyer's IP and session, never cached) |
| `app/actions/*.ts` | Server actions: cart, sign-in, support, live stock and suggestions for the client islands |
| `components/BuyBox.tsx` | Options, quantity, add to cart and the live stock line |
| `components/SearchBox.tsx` | The search combobox |
| `components/PageSkeletons.tsx` | Cart and account skeletons that know the line count and the signed-in state from cookies |
| `app/api/revalidate/route.ts` | The webhook, with `handleRevalidationWebhook` from `@shopfast-sdk/client/next` |

The cart id and the buyer's session token live in httpOnly cookies; the private key never reaches the browser.
