import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { isShopFastError } from '@shopfast-sdk/client';
import { ChatIcon, ShieldIcon } from '@/components/icons';
import { SupportForm } from '@/components/SupportForm';
import { CUSTOMER_COOKIE } from '@/lib/cookies';
import { buyer, getShop } from '@/lib/shopfast';

export const metadata: Metadata = { title: 'Support' };

interface Props {
  readonly searchParams: Promise<Partial<Record<string, string | string[]>>>;
}

async function signedInBuyer(): Promise<{ readonly name: string; readonly email: string }> {
  if (((await cookies()).get(CUSTOMER_COOKIE)?.value ?? '') === '') return { name: '', email: '' };
  try {
    const { account } = await (await buyer()).customer.get();
    return { name: account.name, email: account.email };
  } catch (error) {
    if (isShopFastError(error)) return { name: '', email: '' };
    throw error;
  }
}

export default async function SupportPage({ searchParams }: Props) {
  const [query, shop, me] = await Promise.all([searchParams, getShop(), signedInBuyer()]);
  const order = typeof query['order'] === 'string' ? query['order'] : '';
  const access = typeof query['access'] === 'string' ? query['access'] : '';
  return (
    <div className="container">
      <header className="page-title">
        <span className="eyebrow">Support</span>
        <h1 className="h1">How can we help?</h1>
        <p className="lead">{order === '' ? `Send ${shop.name} a message. Replies arrive by email, usually within a day.` : 'Tell us what went wrong with this order. We attach it to your message.'}</p>
      </header>
      <div className="support">
        <SupportForm name={me.name} email={me.email} order={order} access={access} />
        <aside className="support__side">
          <div className="panel" style={{ padding: 20, display: 'grid', gap: 8 }}>
            <ChatIcon /><strong>Already ordered?</strong>
            <p className="muted">Your keys and downloads are in <Link href="/account?tab=library" style={{ color: 'var(--accent-ink)' }}>your account</Link>, and in the receipt email.</p>
          </div>
          <div className="panel" style={{ padding: 20, display: 'grid', gap: 8 }}>
            <ShieldIcon /><strong>Policies</strong>
            <p className="muted">Refunds, terms and privacy are on the <Link href="/policies/refund-policy" style={{ color: 'var(--accent-ink)' }}>policy pages</Link>.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
