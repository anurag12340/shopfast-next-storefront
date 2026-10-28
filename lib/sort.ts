export type SortValue = 'featured' | 'best-selling' | 'newest' | 'price-ascending' | 'price-descending' | 'title-ascending';

export const SORTS: readonly { readonly value: SortValue; readonly label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-ascending', label: 'Price, low to high' },
  { value: 'price-descending', label: 'Price, high to low' },
  { value: 'title-ascending', label: 'Name, A to Z' },
];

export function sortOf(value: string | string[] | null): SortValue {
  const v = typeof value === 'string' ? value : null;
  return SORTS.find((s) => s.value === v)?.value ?? 'featured';
}
