'use client';
// Sign in with a code sent by email: two steps in one card of the same height, so nothing jumps between them.
import { useActionState, useState } from 'react';
import { requestCode, signIn, type SignInState } from '@/app/actions/account';

export function SignInForm({ notice = '' }: { readonly notice?: string }) {
  const [restart, setRestart] = useState(0);
  return <Steps key={restart} notice={notice} onRestart={() => { setRestart((n) => n + 1); }} />;
}

const NOT_YET: SignInState = { step: 'code', email: '', error: '', notice: '' };

function Steps({ notice, onRestart }: { readonly notice: string; readonly onRestart: () => void }) {
  const initial: SignInState = { step: 'email', email: '', error: '', notice };
  const [sent, send, sending] = useActionState(requestCode, initial);
  const [verified, verify, verifying] = useActionState(signIn, NOT_YET);

  if (sent.step === 'email') {
    return (
      <form action={send} className="field" noValidate>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" placeholder="you@example.com" autoComplete="email" required defaultValue={sent.email} aria-invalid={sent.error === '' ? 'false' : 'true'} aria-describedby="email-msg" />
        <p id="email-msg" className="field__msg" data-tone={sent.error === '' ? 'muted' : 'bad'} aria-live="polite">{sent.error === '' ? (sent.notice === '' ? 'We email you a 6-digit code. No password needed.' : sent.notice) : sent.error}</p>
        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={sending}>{sending ? 'Sending…' : 'Email me a code'}</button>
        <span className="field__msg">New here? Signing in creates your account.</span>
      </form>
    );
  }
  return (
    <form action={verify} className="field" noValidate>
      <input type="hidden" name="email" value={sent.email} />
      <label className="label" htmlFor="code">Code</label>
      <input id="code" name="code" className="input code-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" required autoFocus aria-invalid={verified.error === '' ? 'false' : 'true'} aria-describedby="code-msg" />
      <p id="code-msg" className="field__msg" data-tone={verified.error === '' ? 'muted' : 'bad'} aria-live="polite">{verified.error === '' ? `We sent a 6-digit code to ${sent.email}.` : verified.error}</p>
      <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={verifying}>{verifying ? 'Signing in…' : 'Sign in'}</button>
      <button type="button" className="text-btn field__msg" onClick={onRestart}>Use another email</button>
    </form>
  );
}
