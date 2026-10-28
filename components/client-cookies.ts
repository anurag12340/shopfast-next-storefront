'use client';
// What the skeletons need to know before the page arrives: how many lines the cart has (a readable cookie the cart
// actions keep up to date) and whether a buyer is signed in. The rows the page renders land exactly where their
// skeletons were.
import { useSyncExternalStore } from 'react';
import { CART_LINES_COOKIE, SIGNED_IN_COOKIE } from '@/lib/cookies';

function readCookie(name: string): string | null {
  for (const part of document.cookie.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === name) return v ?? '';
  }
  return null;
}

const subscribe = (): (() => void) => () => undefined;

/** The number of cart lines, or `fallback` on the server. */
export function useCartLines(fallback: number): number {
  return useSyncExternalStore(subscribe, () => {
    const n = Number.parseInt(readCookie(CART_LINES_COOKIE) ?? '', 10);
    return Number.isFinite(n) && n >= 0 ? Math.min(n, 20) : fallback;
  }, () => fallback);
}

/** Whether a buyer is signed in (from the readable companion of the session cookie). */
export function useSignedIn(): boolean {
  return useSyncExternalStore(subscribe, () => readCookie(SIGNED_IN_COOKIE) === '1', () => false);
}
