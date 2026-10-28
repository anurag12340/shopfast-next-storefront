'use client';
// The product page's buy box: options, quantity, add to cart, and live stock polled from the API while the page is
// visible. Every row keeps a fixed height, so nothing moves when stock changes or the cart answers.
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import type { Availability } from '@shopfast-sdk/client';
import { addToCart, type AddState } from '@/app/actions/cart';
import { liveAvailability } from '@/app/actions/live';
import { money, stockText } from '@/lib/format';
import { ArrowRight, BoltIcon, CheckIcon, MinusIcon, PlusIcon } from './icons';

export interface BuyBoxProduct {
  readonly id: string;
  readonly handle: string;
  readonly currency: string;
  readonly priceMinor: number;
  readonly compareAtMinor: number | null;
  readonly delivers: string;
  readonly minPerOrder: number;
  readonly maxPerOrder: number | null;
  readonly variants: readonly { readonly id: string; readonly title: string; readonly priceMinor: number; readonly compareAtMinor: number | null }[];
}

const POLL_MS = 15_000;
const IDLE: AddState = { status: 'idle', message: '', at: 0 };

/** Live availability while the tab is visible: polls, pauses in the background, catches up on return. */
function useLiveAvailability(handle: string, initial: Availability): Availability {
  const [live, setLive] = useState(initial);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    const tick = async (): Promise<void> => {
      if (document.visibilityState === 'visible') {
        const next = await liveAvailability(handle);
        if (!stopped && next !== null) setLive(next);
      }
      if (!stopped) timer = setTimeout(() => void tick(), POLL_MS);
    };
    const onVisible = (): void => {
      if (document.visibilityState !== 'visible') return;
      if (timer !== null) clearTimeout(timer);
      void tick();
    };
    timer = setTimeout(() => void tick(), POLL_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      if (timer !== null) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [handle]);
  return live;
}

function useSecondsSince(iso: string): number {
  const [now, setNow] = useState(() => Date.parse(iso));
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => { setNow(Date.now()); }, 5_000);
    return () => { clearInterval(id); };
  }, [iso]);
  return Math.max(0, Math.round((now - Date.parse(iso)) / 1_000));
}

export function BuyBox({ product, initial }: { readonly product: BuyBoxProduct; readonly initial: Availability }) {
  const live = useLiveAvailability(product.handle, initial);
  const firstAvailable = product.variants.find((v) => live.variants.find((x) => x.id === v.id)?.available ?? true) ?? product.variants[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(firstAvailable?.id ?? null);
  const [quantity, setQuantity] = useState(product.minPerOrder);
  const [state, action, pending] = useActionState(addToCart, IDLE);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (state.status !== 'added') return;
    setJustAdded(true);
    const id = setTimeout(() => { setJustAdded(false); }, 1_800);
    return () => { clearTimeout(id); };
  }, [state.status, state.at]);

  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const liveVariant = live.variants.find((v) => v.id === variantId) ?? null;
  const status = liveVariant === null ? live.status : { ...live.status, available: liveVariant.available && live.status.salesPaused === null, stock: liveVariant.stock, lowStock: liveVariant.lowStock };
  const stock = stockText(status);
  const price = variant?.priceMinor ?? product.priceMinor;
  const compareAt = variant === null ? product.compareAtMinor : variant.compareAtMinor;
  const max = Math.max(product.minPerOrder, Math.min(product.maxPerOrder ?? 100, status.stock ?? 100));
  const canBuy = status.available && live.status.salesPaused === null;
  const seconds = useSecondsSince(live.checkedAt);

  return (
    <form action={action} className="buybox__form">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="variantId" value={variantId ?? ''} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="buybox__price">
        <span className="price price--xl">{price === 0 ? 'Free' : money(price, product.currency)}</span>
        {compareAt !== null && compareAt > price ? (
          <>
            <s className="price__was price__was--lg">{money(compareAt, product.currency)}</s>
            <span className="chip chip--accent">Save {Math.round((1 - price / compareAt) * 100)}%</span>
          </>
        ) : null}
      </div>

      {product.variants.length > 0 ? (
        <div className="options" role="radiogroup" aria-label="Options">
          {product.variants.map((v) => {
            const available = live.variants.find((x) => x.id === v.id)?.available ?? true;
            return (
              <button
                key={v.id} type="button" role="radio" aria-checked={v.id === variantId} className="option"
                data-unavailable={available ? 'false' : 'true'} onClick={() => { setVariantId(v.id); }}
              >
                <span className="option__title">{v.title}</span>
                <span className="option__price">{money(v.priceMinor, product.currency)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="options options--info"><BoltIcon size={16} /><span>{product.delivers === '' ? 'Delivered right after payment' : product.delivers}</span></div>
      )}

      <div className="buybox__actions">
        <div className="stepper" role="group" aria-label="Quantity">
          <button type="button" className="stepper__btn" aria-label="One less" disabled={quantity <= product.minPerOrder} onClick={() => { setQuantity((q) => Math.max(product.minPerOrder, q - 1)); }}><MinusIcon size={16} /></button>
          <output className="stepper__value" aria-live="polite">{quantity}</output>
          <button type="button" className="stepper__btn" aria-label="One more" disabled={quantity >= max} onClick={() => { setQuantity((q) => Math.min(max, q + 1)); }}><PlusIcon size={16} /></button>
        </div>
        <button type="submit" className="btn btn--primary btn--lg buybox__add" disabled={!canBuy || pending} data-state={justAdded ? 'added' : pending ? 'pending' : 'idle'}>
          <span className="buybox__add-label">
            {justAdded ? <><CheckIcon size={18} /> Added</> : pending ? 'Adding…' : canBuy ? 'Add to cart' : live.status.salesPaused === null ? 'Sold out' : 'Paused'}
          </span>
        </button>
      </div>

      <p className="live-line">
        <span className={`dot dot--${stock.tone}`} />
        <span>{live.status.salesPaused === null ? stock.text : `Sales paused: ${live.status.salesPaused.label}`}</span>
        <span className="live-line__when">Checked {seconds < 10 ? 'just now' : `${String(seconds)}s ago`}</span>
      </p>
      <p className="feedback" aria-live="polite" data-tone={state.status === 'error' ? 'bad' : 'good'}>
        {state.status === 'added' ? <><span>{state.message}</span><Link href="/cart" className="feedback__link">View cart <ArrowRight size={14} /></Link></> : null}
        {state.status === 'error' ? state.message : null}
      </p>
    </form>
  );
}
