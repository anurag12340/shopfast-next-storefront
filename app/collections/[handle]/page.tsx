import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Listing } from '@/components/Listing';
import { sortOf } from '@/lib/sort';
import { catalog, getCollections, orNull } from '@/lib/shopfast';

interface Props {
  readonly params: Promise<{ readonly handle: string }>;
  readonly searchParams: Promise<Partial<Record<string, string | string[]>>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const c = (await getCollections()).items.find((x) => x.handle === handle);
  if (c === undefined) return { title: 'Collection not found' };
  return { title: c.seoTitle ?? c.title, description: c.seoDescription ?? c.description, alternates: { canonical: `/collections/${encodeURIComponent(c.handle)}` } };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const sort = sortOf(query['sort'] ?? null);
  const [data, collections] = await Promise.all([orNull(catalog().collections.get(handle, { sort, limit: 12 })), getCollections()]);
  if (data === null) notFound();
  return (
    <Listing
      source="collection" handle={handle} sort={sort} page={data.products}
      crumbs={[{ href: '/', label: 'Home' }]} title={data.collection.title} description={data.collection.description}
      chips={collections.items.filter((c) => c.handle !== handle).map((c) => ({ href: `/collections/${encodeURIComponent(c.handle)}`, label: c.title, count: c.productsCount }))}
    />
  );
}
