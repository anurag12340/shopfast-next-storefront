import 'server-only';

function required(name: string): string {
  const value = process.env[name]?.trim() ?? '';
  if (value === '') throw new Error(`${name} is not set. Copy .env.example to .env.local and fill it in.`);
  return value;
}

/** Server configuration, read when first needed (so `next build` without a store still type-checks). */
export const config = {
  get shop(): string {
    return required('SHOPFAST_SHOP');
  },
  get key(): string {
    const key = required('SHOPFAST_STOREFRONT_KEY');
    if (!key.startsWith('sfsk_')) throw new Error('SHOPFAST_STOREFRONT_KEY must be a private key (sfsk_…): this site calls the API from its server.');
    return key;
  },
  get apiUrl(): string {
    return process.env['SHOPFAST_API_URL']?.trim() ?? 'https://api.shopfa.st';
  },
  get webhookSecret(): string {
    return process.env['SHOPFAST_WEBHOOK_SECRET']?.trim() ?? '';
  },
  get siteUrl(): string {
    return (process.env['SITE_URL']?.trim() ?? 'http://localhost:3000').replace(/\/+$/, '');
  },
};
