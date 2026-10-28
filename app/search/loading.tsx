import { ProductGridSkeleton } from '@/components/ProductCard';
import { Loading, Sk } from '@/components/Skeleton';

export default function SearchLoading() {
  return (
    <div className="container">
      <Loading label="Searching" />
      <header className="page-title">
        <span className="eyebrow"><Sk w="6ch" /></span>
        <div className="searchbox"><Sk w="40%" /></div>
        <p className="search-meta"><Sk w="160px" /></p>
      </header>
      <div className="toolbar"><div className="toolbar__chips"><Sk w="320px" /></div></div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
