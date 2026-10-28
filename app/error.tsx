'use client';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { readonly error: Error & { readonly digest?: string }; readonly reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="container">
      <div className="empty" style={{ marginTop: 48 }}>
        <span className="eyebrow">Something went wrong</span>
        <h1 className="h2">This page did not load</h1>
        <p>The store did not answer in time. Try again in a moment.{error.digest === undefined ? '' : ` Reference ${error.digest}.`}</p>
        <button type="button" className="btn btn--primary" onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
