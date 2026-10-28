import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Order } from '@shopfast-sdk/client';
import { CopyButton } from '@/components/CopyButton';
import { Media } from '@/components/Cover';
import { CheckIcon, DownloadIcon, KeyIcon } from '@/components/icons';
import { date, dateTime, money, plural, typeLabel } from '@/lib/format';
import { buyer, orNull } from '@/lib/shopfast';

export const metadata: Metadata = { title: 'Your order', robots: { index: false } };

interface Props {
  readonly params: Promise<{ readonly id: string }>;
  readonly searchParams: Promise<Partial<Record<string, string | string[]>>>;
}

function statusOf(order: Order): { readonly label: string; readonly tone: 'good' | 'warn' | 'bad' | 'muted'; readonly note: string } {
  if (order.status === 'expired') return { label: 'Expired', tone: 'muted', note: 'This checkout expired before it was paid. Nothing was charged.' };
  if (order.status === 'open') return { label: 'Waiting for payment', tone: 'warn', note: order.expiresAt === null ? 'Finish paying to get your order.' : `Finish paying before ${dateTime(order.expiresAt)}.` };
  if (order.order?.held === true) return { label: 'Under review', tone: 'warn', note: 'Paid. The store reviews this order before delivering it.' };
  if (order.order !== null && order.order.refundedMinor > 0) return { label: 'Refunded', tone: 'muted', note: `${money(order.order.refundedMinor, order.currency)} went back to you.` };
  if (order.order?.status === 'fulfilled') return { label: 'Delivered', tone: 'good', note: 'Everything in this order was delivered.' };
  return { label: 'Paid', tone: 'good', note: 'Delivery is on its way. This page updates as it happens.' };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const access = typeof query['access'] === 'string' ? query['access'] : null;
  const order = await orNull((await buyer()).orders.get(id, access));
  if (order === null) notFound();
  const s = statusOf(order);
  const d = order.deliverables;
  const supportHref = `/support?order=${encodeURIComponent(order.sessionId)}${access === null ? '' : `&access=${encodeURIComponent(access)}`}`;

  return (
    <div className="container">
      <div className="order">
        <header className="order-head">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/account">Account</Link><span aria-hidden="true">/</span><span>Order</span></nav>
          <div className="order-head__top">
            <h1 className="h2">{order.order === null ? 'Your checkout' : `Order ${order.order.number}`}</h1>
            <span className="status-pill" data-tone={s.tone}>{s.label}</span>
            {order.test === true ? <span className="chip">Test order</span> : null}
          </div>
          <p className="muted">{s.note} Receipt sent to {order.buyerEmailMasked}.</p>
        </header>

        <aside className="order__side">
          <div className="panel summary">
            <h2 className="summary__title">Summary</h2>
            <div className="summary__rows">
              <div className="summary__row"><span>Subtotal</span><span className="price">{money(order.subtotalMinor, order.currency)}</span></div>
              <div className="summary__row"><span>Discount</span><span className="price">{order.discountMinor > 0 ? `−${money(order.discountMinor, order.currency)}` : money(0, order.currency)}</span></div>
              <div className="summary__row"><span>Tax{order.taxIncluded ? ' (included)' : ''}</span><span className="price">{money(order.taxMinor, order.currency)}</span></div>
              <div className="summary__row summary__row--total"><span>Total</span><span className="price">{money(order.totalMinor, order.currency)}</span></div>
            </div>
          </div>
          <Link href={supportHref} className="btn btn--secondary btn--block">Get help with this order</Link>
        </aside>

        <section aria-labelledby="items-title">
          <h2 className="eyebrow" id="items-title" style={{ marginBottom: 10 }}>{plural(order.items.reduce((n, i) => n + i.quantity, 0), 'item')}</h2>
          <div className="cart__lines">
            {order.items.map((item) => (
              <div key={`${item.productId}:${item.variantName ?? ''}`} className="line">
                <span className="line__media"><Media seed={item.productId} image={item.imageUrl === null ? null : { url: item.imageUrl, alt: item.name }} alt={item.name} /></span>
                <span className="line__info">
                  <span className="line__title">{item.name}</span>
                  <span className="line__variant">{typeLabel(item.type)}{item.variantName === null ? '' : ` · ${item.variantName}`} · {item.quantity} × {money(item.unitPriceMinor, order.currency)}</span>
                </span>
                <span className="price">{money(item.unitPriceMinor * item.quantity, order.currency)}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="delivery-title">
          <h2 className="eyebrow" id="delivery-title" style={{ margin: '8px 0 10px' }}>Delivery</h2>
          {d === null ? (
            <div className="empty"><p>{order.order === null ? 'Your products are delivered here once you pay.' : 'Open the link from your receipt email, or sign in, to see your keys and downloads.'}</p></div>
          ) : (
            <div className="list">
              {d.keys.map((k) => (
                <div key={k.value} className="row"><span className="row__main"><span className="row__title"><KeyIcon size={15} /> {k.productName}</span><span className="row__sub">License key</span></span><span className="row__end"><code className="key">{k.value}</code><CopyButton value={k.value} /></span></div>
              ))}
              {d.downloads.map((f) => (
                <div key={f.url} className="row"><span className="row__main"><span className="row__title"><DownloadIcon size={15} /> {f.name}</span><span className="row__sub">Link works until {date(f.expiresAt)}</span></span><a href={f.url} className="btn btn--secondary btn--sm">Download</a></div>
              ))}
              {(order.order?.steps ?? []).map((step) => (
                <div key={`${step.kind}:${step.detail}`} className="row"><span className="row__main"><span className="row__title"><CheckIcon size={15} /> {step.detail === '' ? step.kind.replace(/_/g, ' ') : step.detail}</span><span className="row__sub">{step.status}</span></span></div>
              ))}
              {d.keys.length + d.downloads.length + (order.order?.steps.length ?? 0) === 0 ? <div className="row"><span className="row__sub">Nothing to deliver yet.</span></div> : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
