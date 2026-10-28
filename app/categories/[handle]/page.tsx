import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Listing } from '@/components/Listing';
import { sortOf } from '@/lib/sort';
import { catalog, getCategories, orNull } from '@/lib/shopfast';

interface Props {
  readonly params: Promise<{ readonly handle: string }>;
  readonly searchParams: Promise<Partial<Record<string, string | string[]>>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const c = (await getCategories()).items.find((x) => x.handle === handle);
  if (c === undefined) return { title: 'Category not found' };
  return { title: c.seoTitle ?? c.title, description: c.seoDescription ?? c.description, alternates: { canonical: `/categories/${encodeURIComponent(c.handle)}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const sort = sortOf(query['sort'] ?? null);
  const data = await orNull(catalog().categories.get(handle, { sort, limit: 12 }));
  if (data === null) notFound();
  const siblings = data.children.length > 0
    ? data.children
    : (await getCategories()).items.filter((c) => c.parentId === data.category.parentId && c.handle !== handle);
  return (
    <Listing
      source="category" handle={handle} sort={sort} page={data.products}
      crumbs={[{ href: '/', label: 'Home' }, ...data.ancestors.map((a) => ({ href: `/categories/${encodeURIComponent(a.handle)}`, label: a.title }))]}
      title={data.category.title} description={data.category.description}
      chips={siblings.map((c) => ({ href: `/categories/${encodeURIComponent(c.handle)}`, label: c.title, count: c.productsCount }))}
    />
  );
}
