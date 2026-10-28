'use server';
import { cookies } from 'next/headers';
import { publicCookie, THEME_COOKIE, themeOf } from '@/lib/cookies';

export async function setTheme(form: FormData): Promise<void> {
  const value = form.get('theme');
  (await cookies()).set(THEME_COOKIE, themeOf(typeof value === 'string' ? value : null), publicCookie(60 * 60 * 24 * 365));
}
