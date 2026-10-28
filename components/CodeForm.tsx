'use client';
import { useActionState } from 'react';
import { applyCode, type CodeState } from '@/app/actions/cart';
import { TagIcon } from './icons';

const IDLE: CodeState = { error: '', at: 0 };

/** One field for discount codes and gift cards: the API tells them apart. */
export function CodeForm({ notice }: { readonly notice: string }) {
  const [state, action, pending] = useActionState(applyCode, IDLE);
  const message = state.error === '' ? notice : state.error;
  return (
    <form action={action} className="code-form">
      <label className="label" htmlFor="cart-code">Discount code or gift card</label>
      <div className="code-form__row">
        <span className="input-wrap">
          <TagIcon size={16} />
          <input id="cart-code" name="code" className="input" placeholder="Enter a code" autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-invalid={state.error === '' ? 'false' : 'true'} aria-describedby="cart-code-msg" />
        </span>
        <button type="submit" className="btn btn--secondary" disabled={pending}>{pending ? 'Applying…' : 'Apply'}</button>
      </div>
      <p id="cart-code-msg" className="field__msg" data-tone={state.error === '' ? 'muted' : 'bad'} aria-live="polite">{message}</p>
    </form>
  );
}
