'use client';
import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

/** A submit button that says it is working while its form's action runs. */
export function SubmitButton({ children, pendingLabel, className = 'btn btn--primary', name, value, ariaLabel, disabled = false }: {
  readonly children: ReactNode;
  readonly pendingLabel?: string;
  readonly className?: string;
  readonly name?: string;
  readonly value?: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={disabled || pending} aria-busy={pending} {...(name === undefined ? {} : { name })} {...(value === undefined ? {} : { value })} {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}>
      {pending && pendingLabel !== undefined ? pendingLabel : children}
    </button>
  );
}
