// Skeleton pieces. They sit inside the same elements (and classes) the real content uses, so every block has the
// real block's size: a text bar is one line of that element's own line height (`1lh`), media keep their frame.

/** One line of text in the surrounding element's font: exactly as tall as the line it stands in for. */
export function Sk({ w = '100%' }: { readonly w?: `${number}%` | `${number}ch` | `${number}px` }) {
  return <span className="sk sk-line" style={{ width: w }} aria-hidden="true" />;
}

/** A block that fills its frame (media, buttons, inputs). */
export function SkBlock({ className = '' }: { readonly className?: string }) {
  return <span className={`sk sk-block ${className}`} aria-hidden="true" />;
}

/** Announces the loading state once, for screen readers; the bars themselves are hidden from them. */
export function Loading({ label }: { readonly label: string }) {
  return <span className="visually-hidden" role="status">{label}</span>;
}
