'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { SORTS } from '@/lib/sort';

export function SortSelect({ value }: { readonly value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  return (
    <label className="sort" data-pending={pending ? 'true' : 'false'}>
      <span>Sort</span>
      <select
        className="select" value={value} aria-label="Sort products"
        onChange={(e) => {
          const sort = e.target.value;
          start(() => { router.push(sort === 'featured' ? pathname : `${pathname}?sort=${encodeURIComponent(sort)}`); });
        }}
      >
        {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </label>
  );
}
