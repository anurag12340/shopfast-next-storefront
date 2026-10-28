import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { date } from '@/lib/format';
import { catalog, getPolicies, orNull } from '@/lib/shopfast';

interface Props {
  readonly params: Promise<{ readonly handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await orNull(catalog().pages.get((await params).handle));
  return page === null ? { title: 'Page not found' } : { title: page.seoTitle ?? page.title, ...(page.seoDescription === null ? {} : { description: page.seoDescription }) };
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  const [page, policies] = await Promise.all([orNull(catalog().pages.get(handle)), getPolicies()]);
  if (page === null) notFound();
  return (
    <div className="container">
      <header className="page-title">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{page.title}</span></nav>
        <h1 className="h1">{page.title}</h1>
        <p className="muted">Updated {date(page.updatedAt)}</p>
      </header>
      <div className="toolbar"><div className="toolbar__chips">
        {policies.items.map((p) => <Link key={p.handle} href={`/policies/${encodeURIComponent(p.handle)}`} className="chip-link" aria-current={p.handle === handle ? 'page' : undefined}>{p.title}</Link>)}
      </div></div>
      <article className="prose" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
    </div>
  );
}
