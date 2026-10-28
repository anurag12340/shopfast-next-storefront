import { formatMoney } from '@shopfast-sdk/client';

export function money(minor: number, currency: string): string {
  return formatMoney(minor, currency);
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
const dateTimeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export function date(iso: string | null): string {
  return iso === null ? '' : dateFormat.format(new Date(iso));
}

export function dateTime(iso: string | null): string {
  return iso === null ? '' : dateTimeFormat.format(new Date(iso));
}

const TYPE_LABELS: Readonly<Record<string, string>> = {
  file: 'Download',
  license_key: 'License key',
  serial: 'Serial',
  subscription: 'Subscription',
  discord_role: 'Discord role',
  service: 'Service',
  bundle: 'Bundle',
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? 'Product';
}

/** "12 left", "In stock", "Sold out": what a buy button says about stock. */
export function stockText(status: { readonly available: boolean; readonly stock: number | null; readonly lowStock: boolean; readonly preorder: boolean }): { readonly text: string; readonly tone: 'good' | 'warn' | 'bad' } {
  if (!status.available) return status.preorder ? { text: 'Preorder', tone: 'warn' } : { text: 'Sold out', tone: 'bad' };
  if (status.stock !== null && status.lowStock) return { text: `Only ${String(status.stock)} left`, tone: 'warn' };
  if (status.stock !== null) return { text: `In stock · ${String(status.stock)} left`, tone: 'good' };
  return { text: 'In stock', tone: 'good' };
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
}
