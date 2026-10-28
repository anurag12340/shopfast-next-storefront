// Cookie names and options, shared by server actions and pages.

/** The cart id: the cart is a capability, so it is httpOnly like a session. */
export const CART_COOKIE = 'sf_cart';
/** How many lines the cart has, readable by the browser so the cart skeleton draws exactly that many rows. */
export const CART_LINES_COOKIE = 'sf_cart_lines';
/** The signed-in buyer's session token. */
export const CUSTOMER_COOKIE = 'sf_customer';
/** "1" while signed in, readable by the browser so the account skeleton matches the page it becomes. */
export const SIGNED_IN_COOKIE = 'sf_signed_in';
/** `light`, `dark` or `system`. */
export const THEME_COOKIE = 'sf_theme';

const secure = process.env.NODE_ENV === 'production' && !(process.env['SITE_URL'] ?? '').startsWith('http://');

export interface CookieOptions {
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: 'lax';
  readonly path: string;
  readonly maxAge: number;
}

export function privateCookie(maxAgeSec: number): CookieOptions {
  return { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: maxAgeSec };
}

export function publicCookie(maxAgeSec: number): CookieOptions {
  return { httpOnly: false, secure, sameSite: 'lax', path: '/', maxAge: maxAgeSec };
}

export type Theme = 'light' | 'dark' | 'system';

export function themeOf(value: string | null): Theme {
  return value === 'light' || value === 'system' ? value : 'dark';
}
