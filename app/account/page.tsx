import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { isShopFastError, type Customer, type CustomerOrder, type Library, type TicketSummary, type Wallet } from '@shopfast-sdk/client';
import { cancelSubscription, signOut } from '@/app/actions/account';
import { CopyButton } from '@/components/CopyButton';
import { DownloadIcon, KeyIcon } from '@/components/icons';
import { SignInForm } from '@/components/SignInForm';
import { SubmitButton } from '@/components/SubmitButton';
import { CUSTOMER_COOKIE } from '@/lib/cookies';
import { date, money, plural } from '@/lib/format';
import { buyer, getShop } from '@/lib/shopfast';

export const metadata: Metadata = { title: 'Your account', robots: { index: false } };

type Tab = 'orders' | 'library' | 'subscriptions' | 'wallet' | 'support';
const TABS: readonly Tab[] = ['orders', 'library', 'subscriptions', 'wallet', 'support'];

function tabOf(v?: string | string[]): Tab {
  return v === 'library' || v === 'subscriptions' || v === 'wallet' || v === 'support' ? v : 'orders';
}

const ORDER_TONE: Readonly<Record<CustomerOrder['status'], 'good' | 'warn' | 'bad' | 'muted'>> = {
  fulfilled: 'good', paid: 'good', partially_fulfilled: 'warn', pending: 'warn', refunded: 'muted', disputed: 'bad', failed: 'bad',
};
const ORDER_LABEL: Readonly<Record<CustomerOrder['status'], string>> = {
  fulfilled: 'Delivered', paid: 'Paid', partially_fulfilled: 'Partly delivered', pending: 'Pending', refunded: 'Refunded', disputed: 'Disputed', failed: 'Failed',
};

function SignInCard({ notice = '' }: { readonly notice?: string }) {
  return (
    <div className="container auth">
      <div className="narrow panel auth-card">
        <div className="auth-card__head">
          <span className="eyebrow">Account</span>
          <h1 className="h2">Sign in</h1>
          <p className="auth-card__lead">Your orders, keys and downloads in one place.</p>
        </div>
        <SignInForm notice={notice} />
      </div>
    </div>
  );
}

function Orders({ orders }: { readonly orders: readonly CustomerOrder[] }) {
  if (orders.length === 0) return <div className="empty"><p>No orders yet. Your purchases show up here.</p><Link href="/collections/all" className="btn btn--secondary">Browse products</Link></div>;
  return (
    <div className="list">
      {orders.map((o) => (
        <Link key={o.orderId} href={o.sessionId === null ? '/account' : `/orders/${encodeURIComponent(o.sessionId)}`} className="row">
          <span className="row__main">
            <span className="row__title">Order {o.number} · {o.items.map((i) => i.name).join(', ')}</span>
            <span className="row__sub">{date(o.paidAt ?? o.createdAt)} · {plural(o.items.reduce((n, i) => n + i.quantity, 0), 'item')}</span>
          </span>
          <span className="row__end"><span className="status-pill" data-tone={ORDER_TONE[o.status]}>{ORDER_LABEL[o.status]}</span><span className="price">{money(o.totalMinor, o.currency)}</span></span>
        </Link>
      ))}
    </div>
  );
}

function LibraryList({ library }: { readonly library: Library }) {
  if (library.keys.length === 0 && library.downloads.length === 0) return <div className="empty"><p>Keys and downloads from your orders appear here.</p></div>;
  return (
    <div className="list">
      {library.keys.map((k) => (
        <div key={`${k.orderId}:${k.value}`} className="row">
          <span className="row__main"><span className="row__title"><KeyIcon size={15} /> {k.productName}</span><span className="row__sub">Order {k.orderNumber} · {date(k.deliveredAt)}</span></span>
          <span className="row__end"><code className="key">{k.value}</code><CopyButton value={k.value} /></span>
        </div>
      ))}
      {library.downloads.map((d) => (
        <div key={`${d.orderId}:${d.productId}`} className="row">
          <span className="row__main"><span className="row__title"><DownloadIcon size={15} /> {d.name}</span><span className="row__sub">Order {d.orderNumber} · link works until {date(d.expiresAt)}</span></span>
          <span className="row__end"><a href={d.url} className="btn btn--secondary btn--sm" rel="noreferrer">Download</a></span>
        </div>
      ))}
    </div>
  );
}

function Subscriptions({ library }: { readonly library: Library }) {
  if (library.subscriptions.length === 0) return <div className="empty"><p>You have no subscriptions in this store.</p></div>;
  return (
    <div className="list">
      {library.subscriptions.map((s) => (
        <div key={s.id} className="row">
          <span className="row__main">
            <span className="row__title">{s.productName}</span>
            <span className="row__sub">{s.cancelAtPeriodEnd || s.status === 'cancelled' ? `Ends ${date(s.currentPeriodEnd)}` : `Renews ${date(s.currentPeriodEnd)}`}{s.pastDue ? ' · payment due' : ''}</span>
          </span>
          <span className="row__end">
            {s.renewUrl === null ? null : <a href={s.renewUrl} className="btn btn--primary btn--sm">Pay renewal</a>}
            {s.status === 'active' && !s.cancelAtPeriodEnd ? (
              <form action={cancelSubscription}>
                <input type="hidden" name="subscriptionId" value={s.id} />
                <SubmitButton className="btn btn--ghost btn--sm" pendingLabel="Cancelling…">Cancel at period end</SubmitButton>
              </form>
            ) : <span className="status-pill" data-tone="muted">{s.ended ? 'Ended' : 'Cancelled'}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function WalletView({ wallet }: { readonly wallet: Wallet }) {
  return (
    <div className="wallet">
      <div className="panel wallet__credit"><span><span className="eyebrow">Store credit</span><br /><span className="muted">Applied at checkout</span></span><span className="price">{money(wallet.storeCreditMinor, wallet.currency)}</span></div>
      {wallet.giftCards.length + wallet.coupons.length === 0 ? null : (
        <div className="list">
          {wallet.giftCards.map((g) => (
            <div key={g.last4} className="row"><span className="row__main"><span className="row__title">Gift card ··{g.last4}</span><span className="row__sub">{g.expiresAt === null ? 'Never expires' : `Expires ${date(g.expiresAt)}`}</span></span><span className="price">{money(g.balanceMinor, wallet.currency)}</span></div>
          ))}
          {wallet.coupons.map((c) => (
            <div key={c.code} className="row"><span className="row__main"><span className="row__title">{c.title}</span><span className="row__sub">{c.label}{c.endsAt === null ? '' : ` · until ${date(c.endsAt)}`}</span></span><span className="row__end"><code className="key">{c.code}</code><CopyButton value={c.code} /></span></div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tickets({ tickets }: { readonly tickets: readonly TicketSummary[] }) {
  if (tickets.length === 0) return <div className="empty"><p>No support requests yet.</p><Link href="/support" className="btn btn--secondary">Contact support</Link></div>;
  return (
    <div className="list">
      {tickets.map((t) => (
        <div key={t.id} className="row">
          <span className="row__main"><span className="row__title">#{t.number} · {t.subject}</span><span className="row__sub">Last reply {date(t.lastMessageAt)}{t.awaitingBuyer ? ' · waiting for you' : ''}</span></span>
          <span className="status-pill" data-tone={t.status === 'solved' || t.status === 'closed' ? 'good' : 'warn'}>{t.status.replace('_', ' ')}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  readonly searchParams: Promise<Partial<Record<string, string | string[]>>>;
}

export default async function AccountPage({ searchParams }: Props) {
  const tab = tabOf((await searchParams)['tab']);
  if (((await cookies()).get(CUSTOMER_COOKIE)?.value ?? '') === '') return <SignInCard />;
  const client = await buyer();
  let account: Customer;
  try {
    account = (await client.customer.get()).account;
  } catch (error) {
    if (isShopFastError(error) && (error.status === 401 || error.status === 403)) return <SignInCard notice="Your session ended. Sign in again to see your orders." />;
    throw error;
  }
  const [orders, library, wallet, tickets, shop] = await Promise.all([client.customer.orders(), client.customer.library(), client.customer.wallet(), client.support.list(), getShop()]);
  const counts: Readonly<Record<Tab, number>> = {
    orders: orders.orders.length, library: library.keys.length + library.downloads.length, subscriptions: library.subscriptions.length,
    wallet: wallet.giftCards.length + wallet.coupons.length, support: tickets.items.length,
  };
  const labels: Readonly<Record<Tab, string>> = { orders: 'Orders', library: 'Keys & downloads', subscriptions: 'Subscriptions', wallet: 'Wallet', support: 'Support' };
  return (
    <div className="container">
      <div className="account-head">
        <span className="avatar" aria-hidden="true">{(account.name === '' ? account.email : account.name).charAt(0).toUpperCase()}</span>
        <span className="account-head__text">
          <span className="account-head__name">{account.name === '' ? 'Welcome back' : account.name}</span>
          <span className="account-head__email">{account.email} · {shop.name}</span>
        </span>
        <form action={signOut}><SubmitButton className="btn btn--secondary btn--sm" pendingLabel="Signing out…">Sign out</SubmitButton></form>
      </div>
      <nav className="tabs" aria-label="Account">
        {TABS.map((key) => {
          return <Link key={key} href={key === 'orders' ? '/account' : `/account?tab=${key}`} className="tab" aria-current={tab === key ? 'page' : undefined}>{labels[key]} <span className="tab__count">{counts[key]}</span></Link>;
        })}
      </nav>
      {tab === 'orders' ? <Orders orders={orders.orders} /> : null}
      {tab === 'library' ? <LibraryList library={library} /> : null}
      {tab === 'subscriptions' ? <Subscriptions library={library} /> : null}
      {tab === 'wallet' ? <WalletView wallet={wallet} /> : null}
      {tab === 'support' ? <Tickets tickets={tickets.items} /> : null}
    </div>
  );
}
