import Link from 'next/link';
import type { Page, Shop } from '@shopfast-sdk/client';
import type { Theme } from '@/lib/cookies';
import { ThemeSwitch } from './ThemeSwitch';

export function Footer({ shop, policies, theme }: { readonly shop: Shop; readonly policies: readonly Page[]; readonly theme: Theme }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__name">{shop.name}</span>
          <span className="footer__note">Secure checkout and instant delivery by ShopFast.</span>
        </div>
        <nav className="footer__links" aria-label="Store information">
          <Link href="/support">Support</Link>
          <Link href="/account">Your account</Link>
          {policies.map((p) => <Link key={p.handle} href={`/policies/${encodeURIComponent(p.handle)}`}>{p.title}</Link>)}
        </nav>
        <div className="footer__end">
          <ThemeSwitch theme={theme} />
          <span className="footer__copy">© {year} {shop.name}</span>
        </div>
      </div>
    </footer>
  );
}
