'use client';
import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

export function CopyButton({ value, label = 'Copy' }: { readonly value: string; readonly label?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => { setCopied(false); }, 1_600);
    return () => { clearTimeout(id); };
  }, [copied]);
  return (
    <button
      type="button" className="btn btn--ghost btn--sm copy" aria-label={copied ? 'Copied' : label}
      onClick={() => { void navigator.clipboard.writeText(value).then(() => { setCopied(true); }); }}
    >
      {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}
