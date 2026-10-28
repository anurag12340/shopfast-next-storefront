'use client';
// The store's own checkout in an overlay on this site: the loader script comes from the store (embed.scriptUrl), and
// the buyer pays without leaving. Add this site's origin in Settings → Developers → Embeds first.
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { embeddedCheckout } from '@/app/actions/cart';

interface CheckoutSuccess {
  readonly sessionId: string;
  readonly orderNumber: string | null;
}

interface ShopFastCheckoutApi {
  open(options: {
    readonly store: string;
    readonly items: readonly { readonly product: string; readonly variant: string | null; readonly quantity: number }[];
    readonly theme?: 'light' | 'dark';
    readonly title?: string;
    readonly trigger?: HTMLElement;
    readonly onSuccess?: (detail: CheckoutSuccess) => void;
  }): { close(): void };
}

declare global {
  interface Window {
    ShopFastCheckout?: ShopFastCheckoutApi;
  }
}

const loaded = new Map<string, Promise<ShopFastCheckoutApi>>();

function loadScript(src: string): Promise<ShopFastCheckoutApi> {
  const existing = loaded.get(src);
  if (existing !== undefined) return existing;
  const promise = new Promise<ShopFastCheckoutApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      const api = window.ShopFastCheckout;
      if (api === undefined) reject(new Error('The checkout script did not load.'));
      else resolve(api);
    };
    script.onerror = () => {
      loaded.delete(src);
      reject(new Error('The checkout script did not load.'));
    };
    document.head.appendChild(script);
  });
  loaded.set(src, promise);
  return promise;
}

export function EmbeddedCheckoutButton({ theme }: { readonly theme: 'light' | 'dark' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const open = (trigger: HTMLElement): void => {
    setError('');
    start(async () => {
      const result = await embeddedCheckout();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      try {
        const api = await loadScript(result.embed.scriptUrl);
        api.open({
          store: result.embed.store, items: result.embed.items, theme, title: 'Checkout', trigger,
          onSuccess: (detail) => { router.push(`/orders/${encodeURIComponent(detail.sessionId)}`); },
        });
      } catch {
        setError('The embedded checkout could not load here. Use Checkout instead.');
      }
    });
  };

  return (
    <>
      <button type="button" className="btn btn--secondary btn--block" disabled={pending} onClick={(e) => { open(e.currentTarget); }}>
        {pending ? 'Opening…' : 'Pay without leaving this page'}
      </button>
      <p className="summary__error" role="alert">{error}</p>
    </>
  );
}
