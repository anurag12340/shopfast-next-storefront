import Link from 'next/link';
import { Suspense } from 'react';
import type { Shop } from '@shopfast-sdk/client';
import { getCart } from '@/lib/shopfast';
import { BagIcon, SearchIcon, UserIcon } from './icons';

export interface NavItem {
  readonly href: string;
  readonly label: string;
}

export function Logo({ shop }: { readonly shop: Shop }) {
  return (
    <Link href="/" className="logo" aria-label={`${shop.name}, home`}>
      {shop.logoUrl === null
        ? <span className="logo__mark" aria-hidden="true">{shop.name.trim().charAt(0).toUpperCase()}</span>
        : <img className="logo__img" src={shop.logoUrl} alt="" width={28} height={28} />}
      <span className="logo__name">{shop.name}</span>
    </Link>
  );
}

/** The cart button with its count. The count streams in; until then the badge keeps its place, empty. */
function CartButton({ count }: { readonly count: number | null }) {
  const label = count === null ? 'Cart' : `Cart, ${String(count)} ${count === 1 ? 'item' : 'items'}`;
  return (
    <Link href="/cart" className="icon-btn cart-btn" aria-label={label}>
      <BagIcon />
      <span className="cart-btn__count" data-empty={count === null || count === 0 ? 'true' : 'false'}>{count === null ? '' : count > 99 ? '99+' : String(count)}</span>
    </Link>
  );
}

async function CartCount() {
  const cart = await getCart();
  return <CartButton count={cart?.itemCount ?? 0} />;
}

export function Header({ shop, nav }: { readonly shop: Shop; readonly nav: readonly NavItem[] }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <Logo shop={shop} />
        <nav className="nav" aria-label="Main">
          {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="header__actions">
          <form action="/search" className="header-search" role="search">
            <SearchIcon size={16} />
            <input name="q" type="search" placeholder="Search products" aria-label="Search products" autoComplete="off" />
          </form>
          <Link href="/search" className="icon-btn header__search-link" aria-label="Search"><SearchIcon /></Link>
          <Link href="/account" className="icon-btn" aria-label="Account"><UserIcon /></Link>
          <Suspense fallback={<CartButton count={null} />}>
            <CartCount />
          </Suspense>
        </div>
      </div>
      <nav className="subnav" aria-label="Browse">
        <div className="container subnav__inner">
          {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </div>
      </nav>
    </header>
  );
}
