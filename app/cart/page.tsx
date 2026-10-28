import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Cart } from '@shopfast-sdk/client';
import { checkout, removeCode, updateLine } from '@/app/actions/cart';
import { CodeForm } from '@/components/CodeForm';
import { Media } from '@/components/Cover';
import { EmbeddedCheckoutButton } from '@/components/EmbeddedCheckout';
import { ArrowRight, MinusIcon, PlusIcon, ShieldIcon, XIcon } from '@/components/icons';
import { Price } from '@/components/ProductCard';
import { SubmitButton } from '@/components/SubmitButton';
import { THEME_COOKIE, themeOf } from '@/lib/cookies';
import { money, plural } from '@/lib/format';
import { getCart, getShop } from '@/lib/shopfast';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } };

function Line({ line, currency }: { readonly line: Cart['lines'][number]; readonly currency: string }) {
  return (
    <div className="line">
      <Link href={`/products/${encodeURIComponent(line.handle)}`} className="line__media">
        <Media seed={line.productId} image={line.imageUrl === null ? null : { url: line.imageUrl, alt: line.title }} alt={line.title} />
      </Link>
      <div className="line__info">
        <Link href={`/products/${encodeURIComponent(line.handle)}`} className="line__title">{line.title}</Link>
        <span className="line__variant">{line.gift ? 'Free gift' : line.variantTitle ?? money(line.unitPriceMinor, currency)}{line.notice === null ? '' : ` · ${line.notice}`}</span>
        <div className="line__controls">
          {line.gift ? null : (
            <form action={updateLine} className="stepper stepper--sm">
              <input type="hidden" name="lineId" value={line.id} />
              <SubmitButton className="stepper__btn" name="quantity" value={String(line.quantity - 1)} ariaLabel={`One less ${line.title}`}><MinusIcon size={14} /></SubmitButton>
              <output className="stepper__value">{line.quantity}</output>
              <SubmitButton className="stepper__btn" name="quantity" value={String(line.quantity + 1)} ariaLabel={`One more ${line.title}`} disabled={line.quantity >= line.maxQuantity}><PlusIcon size={14} /></SubmitButton>
            </form>
          )}
          {line.gift ? null : (
            <form action={updateLine}>
              <input type="hidden" name="lineId" value={line.id} />
              <SubmitButton className="btn btn--ghost btn--sm" name="quantity" value="0" pendingLabel="Removing…">Remove</SubmitButton>
            </form>
          )}
        </div>
      </div>
      <div className="line__end">
        <Price minor={line.lineMinor} currency={currency} compareAt={line.compareAtMinor === null ? null : line.compareAtMinor * line.quantity} className="line__total" />
        {line.discountMinor > 0 ? <span className="chip chip--good">−{money(line.discountMinor, currency)}</span> : null}
      </div>
    </div>
  );
}

function Applied({ label, kind }: { readonly label: string; readonly kind: 'discount' | 'gift_card' }) {
  return (
    <form action={removeCode} className="applied">
      <input type="hidden" name="kind" value={kind} />
      {label}
      <button type="submit" aria-label={`Remove ${label}`}><XIcon size={12} /></button>
    </form>
  );
}

export default async function CartPage() {
  const [cart, shop, jar] = await Promise.all([getCart(), getShop(), cookies()]);
  const theme = themeOf(jar.get(THEME_COOKIE)?.value ?? null);
  if (cart === null || cart.lines.length === 0) {
    return (
      <div className="container">
        <header className="page-title"><span className="eyebrow">Cart</span><h1 className="h1">Your cart</h1></header>
        <div className="empty">
          <div className="empty__art"><Media seed="empty-cart" image={null} alt="" /></div>
          <h2 className="h2">Your cart is empty</h2>
          <p>Add a product and it shows up here, ready for checkout.</p>
          <Link href="/collections/all" className="btn btn--primary">Browse products <ArrowRight size={16} /></Link>
        </div>
      </div>
    );
  }
  const t = cart.totals;
  const discountNote = cart.messages.find((m) => m.field === 'discount' || m.field === 'gift_card')?.text ?? '';
  return (
    <div className="container">
      <header className="page-title"><span className="eyebrow">Cart</span><h1 className="h1">Your cart</h1></header>
      <div className="cart">
        <div className="cart__lines">
          {cart.lines.map((line) => <Line key={line.id} line={line} currency={cart.currency} />)}
        </div>
        <aside className="panel summary" aria-labelledby="summary-title">
          <h2 className="summary__title" id="summary-title">Order summary</h2>
          <div className="summary__rows">
            <div className="summary__row"><span>Subtotal · {plural(cart.itemCount, 'item')}</span><Price minor={t.subtotalMinor} currency={cart.currency} /></div>
            <div className="summary__row">
              {cart.discountCode === null ? <span>Discount</span> : <Applied label={cart.discountCode} kind="discount" />}
              {t.discountMinor > 0 ? <span className="price">−{money(t.discountMinor, cart.currency)}</span> : <span className="muted">None</span>}
            </div>
            <div className="summary__row">
              {cart.giftCard === null ? <span>Gift card</span> : <Applied label={`Gift card ··${cart.giftCard.last4}`} kind="gift_card" />}
              {t.giftCardMinor > 0 ? <span className="price">−{money(t.giftCardMinor, cart.currency)}</span> : <span className="muted">None</span>}
            </div>
            <div className="summary__row">
              <span>Tax</span>
              {t.taxKnown || t.taxIncluded ? <Price minor={t.taxMinor} currency={cart.currency} /> : <span className="muted">At checkout</span>}
            </div>
            <div className="summary__row summary__row--total"><span>Total</span><Price minor={t.totalMinor} currency={cart.currency} /></div>
          </div>
          <CodeForm notice={discountNote} />
          <div className="summary__actions">
            <form action={checkout}>
              <SubmitButton className="btn btn--primary btn--lg btn--block" pendingLabel="Opening checkout…">Checkout <ArrowRight size={16} /></SubmitButton>
            </form>
            <EmbeddedCheckoutButton theme={theme === 'light' ? 'light' : 'dark'} />
          </div>
          <p className="summary__fine"><ShieldIcon size={14} /> Secure checkout by ShopFast{shop.testMode ? ' · test mode' : ''}</p>
        </aside>
      </div>
    </div>
  );
}
