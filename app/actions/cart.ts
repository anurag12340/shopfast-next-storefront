'use server';
// Cart server actions. The cart id lives in an httpOnly cookie; every change answers the priced cart, and the page
// (with the header's count) re-renders from it.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { isShopFastError, type Cart, type CheckoutHandoff } from '@shopfast-sdk/client';
import { CART_COOKIE, CART_LINES_COOKIE, privateCookie, publicCookie } from '@/lib/cookies';
import { buyer, getCart } from '@/lib/shopfast';

const CART_MAX_AGE = 60 * 60 * 24 * 30;

async function remember(cart: Cart): Promise<void> {
  const jar = await cookies();
  jar.set(CART_COOKIE, cart.id, privateCookie(CART_MAX_AGE));
  jar.set(CART_LINES_COOKIE, String(cart.lines.length), publicCookie(CART_MAX_AGE));
}

function text(form: FormData, name: string): string {
  const v = form.get(name);
  return typeof v === 'string' ? v.trim() : '';
}

/** A whole number from a form field, clamped; `fallback` when it is not one. */
function int(form: FormData, name: string, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(text(form, name), 10);
  return Number.isNaN(n) ? fallback : Math.max(min, Math.min(max, n));
}

function errorMessage(error: Error): string {
  return isShopFastError(error) ? error.detail : 'Something went wrong. Try again in a moment.';
}

export interface AddState {
  readonly status: 'idle' | 'added' | 'error';
  readonly message: string;
  /** Changes on every add, so the button can say "Added" again. */
  readonly at: number;
}

export async function addToCart(_prev: AddState, form: FormData): Promise<AddState> {
  const productId = text(form, 'productId');
  const variantId = text(form, 'variantId');
  const quantity = int(form, 'quantity', 1, 100, 1);
  const line = { productId, variantId: variantId === '' ? null : variantId, quantity };
  try {
    const client = await buyer();
    const current = await getCart();
    const cart = current === null ? await client.cart.create({ lines: [line] }) : await client.cart.addLines(current.id, [line]);
    await remember(cart);
    refresh();
    return { status: 'added', message: `Added to your cart (${String(cart.itemCount)} ${cart.itemCount === 1 ? 'item' : 'items'}).`, at: Date.now() };
  } catch (error) {
    if (error instanceof Error) return { status: 'error', message: errorMessage(error), at: Date.now() };
    throw error;
  }
}

export async function updateLine(form: FormData): Promise<void> {
  const cart = await getCart();
  if (cart === null) return;
  const quantity = int(form, 'quantity', 0, 100, 0);
  await remember(await (await buyer()).cart.updateLine(cart.id, text(form, 'lineId'), quantity));
  refresh();
}

export interface CodeState {
  readonly error: string;
  readonly at: number;
}

export async function applyCode(_prev: CodeState, form: FormData): Promise<CodeState> {
  const code = text(form, 'code');
  if (code === '') return { error: 'Enter a discount code or a gift card.', at: Date.now() };
  const cart = await getCart();
  if (cart === null) return { error: 'Your cart is empty.', at: Date.now() };
  try {
    await remember(await (await buyer()).cart.applyCode(cart.id, code));
    refresh();
    return { error: '', at: Date.now() };
  } catch (error) {
    if (error instanceof Error) return { error: errorMessage(error), at: Date.now() };
    throw error;
  }
}

export async function removeCode(form: FormData): Promise<void> {
  const cart = await getCart();
  const kind = text(form, 'kind');
  if (cart === null || (kind !== 'discount' && kind !== 'gift_card')) return;
  await remember(await (await buyer()).cart.removeCode(cart.id, kind));
  refresh();
}

/** Hosted checkout: ShopFast's own checkout with this cart, on the store's site. */
export async function checkout(): Promise<void> {
  const cart = await getCart();
  if (cart === null || cart.lines.length === 0) redirect('/cart');
  const link = await (await buyer()).cart.checkoutLink(cart.id);
  redirect(link.checkoutUrl);
}

export type EmbedResult = { readonly ok: true; readonly embed: CheckoutHandoff['embed'] } | { readonly ok: false; readonly error: string };

/** Embedded checkout: the same checkout in an overlay on this site (see components/EmbeddedCheckout.tsx). */
export async function embeddedCheckout(): Promise<EmbedResult> {
  const cart = await getCart();
  if (cart === null || cart.lines.length === 0) return { ok: false, error: 'Your cart is empty.' };
  try {
    return { ok: true, embed: (await (await buyer()).cart.checkoutLink(cart.id)).embed };
  } catch (error) {
    if (error instanceof Error) return { ok: false, error: errorMessage(error) };
    throw error;
  }
}
