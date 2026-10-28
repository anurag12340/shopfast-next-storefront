import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty" style={{ marginTop: 48 }}>
        <span className="eyebrow">404</span>
        <h1 className="h2">This page is not here</h1>
        <p>It may have moved, or the product is no longer for sale.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/" className="btn btn--primary">Go to the store</Link>
          <Link href="/search" className="btn btn--secondary">Search</Link>
        </div>
      </div>
    </div>
  );
}
