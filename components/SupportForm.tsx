'use client';
import Link from 'next/link';
import { useActionState, type ReactNode } from 'react';
import { openTicket, type TicketState } from '@/app/actions/support';
import { CheckIcon } from './icons';

const IDLE: TicketState = { status: 'idle', number: 0, error: '', fields: {} };

function Field({ name, label, error, children }: { readonly name: string; readonly label: string; readonly error: string; readonly children: ReactNode }) {
  return (
    <div className="field">
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      {children}
      <p className="field__msg" data-tone="bad" id={`f-${name}-msg`}>{error}</p>
    </div>
  );
}

export function SupportForm({ name, email, order, access }: { readonly name: string; readonly email: string; readonly order: string; readonly access: string }) {
  const [state, action, pending] = useActionState(openTicket, IDLE);
  if (state.status === 'sent') {
    return (
      <div className="panel sent" role="status">
        <span className="chip chip--good"><CheckIcon size={14} /> Sent</span>
        <h2 className="h2">We have your message</h2>
        <p className="muted">Ticket #{state.number} is open. Replies go to your email, and you can follow it from your account.</p>
        <Link href="/account?tab=support" className="btn btn--secondary">See your tickets</Link>
      </div>
    );
  }
  const err = (f: string): string => state.fields[f] ?? '';
  return (
    <form action={action} className="panel support-form" noValidate>
      <input type="hidden" name="order" value={order} />
      <input type="hidden" name="access" value={access} />
      <div className="honeypot" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="support-form__pair">
        <Field name="name" label="Name" error={err('name')}><input id="f-name" name="name" className="input" autoComplete="name" defaultValue={name} required aria-invalid={err('name') === '' ? 'false' : 'true'} /></Field>
        <Field name="email" label="Email" error={err('email')}><input id="f-email" name="email" type="email" className="input" autoComplete="email" defaultValue={email} required aria-invalid={err('email') === '' ? 'false' : 'true'} /></Field>
      </div>
      <Field name="subject" label="Subject" error={err('subject')}><input id="f-subject" name="subject" className="input" placeholder="My key does not activate" required aria-invalid={err('subject') === '' ? 'false' : 'true'} /></Field>
      <Field name="message" label="Message" error={err('message')}><textarea id="f-message" name="message" className="textarea" placeholder="Tell us what happened, with the order number if you have one." required aria-invalid={err('message') === '' ? 'false' : 'true'} /></Field>
      <p className="field__msg" data-tone="bad" role="alert">{state.error}</p>
      <button type="submit" className="btn btn--primary btn--lg" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
