import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Onest, Schibsted_Grotesk } from 'next/font/google';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { Footer } from '@/components/Footer';
import { Header, type NavItem } from '@/components/Header';
import { config } from '@/lib/config';
import { THEME_COOKIE, themeOf } from '@/lib/cookies';
import { getCategories, getCollections, getPolicies, getShop } from '@/lib/shopfast';
import '@/styles/globals.css';

const display = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-schibsted', display: 'swap' });
const body = Onest({ subsets: ['latin'], variable: '--font-onest', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

const HEX = /^#[0-9a-f]{3,8}$/i;

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShop();
  const description = shop.seo.description ?? (shop.tagline === '' ? null : shop.tagline);
  return {
    metadataBase: new URL(config.siteUrl),
    title: { default: shop.seo.title ?? shop.name, template: `%s · ${shop.name}` },
    ...(description === null ? {} : { description }),
    applicationName: shop.name,
    openGraph: {
      siteName: shop.name, type: 'website',
      ...(shop.seo.socialImageUrl === null ? {} : { images: [{ url: shop.seo.socialImageUrl }] }),
    },
    ...(shop.faviconUrl === null ? {} : { icons: { icon: shop.faviconUrl } }),
    ...(shop.seo.allowIndexing ? {} : { robots: { index: false, follow: false } }),
  };
}

export async function generateViewport(): Promise<Viewport> {
  const shop = await getShop();
  return { themeColor: HEX.test(shop.brandColor) ? shop.brandColor : '#6e56cf', colorScheme: 'dark light' };
}

export default async function RootLayout({ children }: { readonly children: ReactNode }) {
  const [shop, collections, categories, policies, jar] = await Promise.all([getShop(), getCollections(), getCategories(), getPolicies(), cookies()]);
  const theme = themeOf(jar.get(THEME_COOKIE)?.value ?? null);
  const brand = HEX.test(shop.brandColor) ? shop.brandColor : '#6e56cf';
  const nav: NavItem[] = [
    { href: '/collections/all', label: 'Shop all' },
    ...collections.items.filter((c) => c.handle !== 'all').slice(0, 3).map((c) => ({ href: `/collections/${encodeURIComponent(c.handle)}`, label: c.title })),
    ...categories.items.filter((c) => c.parentId === null).slice(0, 3).map((c) => ({ href: `/categories/${encodeURIComponent(c.handle)}`, label: c.title })),
    { href: '/support', label: 'Support' },
  ];
  return (
    <html lang="en" data-theme={theme} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <style>{`:root{--brand:${brand}}`}</style>
      </head>
      <body>
        {shop.testMode ? <div className="notice-bar"><span className="notice-bar__long">Test mode: checkouts use test payments and nothing is charged.</span><span className="notice-bar__short">Test mode: nothing is charged</span></div> : null}
        {shop.status === 'open' ? null : (
          <div className="notice-bar notice-bar--warn">{shop.statusMessage === '' ? 'The store is not taking orders right now.' : shop.statusMessage}</div>
        )}
        <Header shop={shop} nav={nav} />
        <main className="main" id="main">{children}</main>
        <Footer shop={shop} policies={policies.items} theme={theme} />
      </body>
    </html>
  );
}
