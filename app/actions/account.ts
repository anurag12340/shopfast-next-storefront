'use server';
// Buyer sign-in with an emailed code. The session token lives in an httpOnly cookie and goes to the API on the
// buyer's own requests only (the SDK never sends it on shared catalog reads).
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import { isShopFastError } from '@shopfast-sdk/client';
import { CUSTOMER_COOKIE, privateCookie, publicCookie, SIGNED_IN_COOKIE } from '@/lib/cookies';
import { buyer } from '@/lib/shopfast';

export interface SignInState {
  readonly step: 'email' | 'code';
  readonly email: string;
  readonly error: string;
  readonly notice: string;
}

function text(form: FormData, name: string): string {
  const v = form.get(name);
  return typeof v === 'string' ? v.trim() : '';
}

function problem(error: Error, field: string): string {
  if (!isShopFastError(error)) return 'Something went wrong. Try again in a moment.';
  return error.fieldError(field) ?? error.detail;
}

export async function requestCode(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = text(form, 'email');
  try {
    await (await buyer()).customer.requestCode(email);
    return { step: 'code', email, error: '', notice: `We sent a 6-digit code to ${email}.` };
  } catch (error) {
    if (error instanceof Error) return { step: 'email', email, error: problem(error, 'email'), notice: '' };
    throw error;
  }
}

export async function signIn(prev: SignInState, form: FormData): Promise<SignInState> {
  const code = text(form, 'code').replace(/\s+/g, '');
  const email = text(form, 'email') === '' ? prev.email : text(form, 'email');
  let session;
  try {
    session = await (await buyer()).customer.signIn(email, code);
  } catch (error) {
    if (error instanceof Error) return { step: 'code', email, error: problem(error, 'code'), notice: '' };
    throw error;
  }
  const maxAge = Math.max(60, Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1_000));
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, session.token, privateCookie(maxAge));
  jar.set(SIGNED_IN_COOKIE, '1', publicCookie(maxAge));
  redirect('/account');
}

export async function signOut(): Promise<void> {
  try {
    await (await buyer()).customer.signOut();
  } catch {
    // Already signed out on the API side: forget it here as well.
  }
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
  jar.delete(SIGNED_IN_COOKIE);
  redirect('/account');
}

export async function cancelSubscription(form: FormData): Promise<void> {
  await (await buyer()).customer.cancelSubscription(text(form, 'subscriptionId'));
  refresh();
}
