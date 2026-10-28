import { ProductGridSkeleton } from '@/components/ProductCard';
import { Loading, Sk, SkBlock } from '@/components/Skeleton';

/** The home page's own layout with bars in place of text: every block lands where the page puts it. */
export default function HomeLoading() {
  return (
    <>
      <Loading label="Loading the store" />
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__text">
            <div className="hero__eyebrow"><span className="chip"><Sk w="104px" /></span><span className="eyebrow"><Sk w="10ch" /></span></div>
            <div className="hero__title is-sk"><Sk w="86%" /><Sk w="52%" /></div>
            <div className="hero__lead is-sk"><Sk w="96%" /><Sk w="88%" /><Sk w="40%" /></div>
            <div className="hero__cta"><span className="btn btn--lg" style={{ width: 188, padding: 0 }}><SkBlock /></span><span className="btn btn--lg" style={{ width: 150, padding: 0 }}><SkBlock /></span></div>
            <dl className="hero__stats">
              {[0, 1, 2].map((i) => (
                <div className="stat" key={i}><dt className="stat__label"><Sk w="8ch" /></dt><dd className="stat__value"><Sk w="4ch" /></dd></div>
              ))}
            </dl>
          </div>
          <div className="hero__art"><SkBlock /></div>
        </div>
      </section>
      <section className="section container">
        <div className="section__head"><div><span className="eyebrow"><Sk w="11ch" /></span><span className="h2"><Sk w="200px" /></span></div></div>
        <div className="rail">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="collection-card"><SkBlock /></span>)}</div>
      </section>
      <section className="section container">
        <div className="section__head"><div><span className="eyebrow"><Sk w="10ch" /></span><span className="h2"><Sk w="170px" /></span></div></div>
        <div className="rail">{[0, 1, 2, 3].map((i) => <span key={i} className="chip-link" style={{ width: 132 }}><Sk w="100%" /></span>)}</div>
      </section>
      <section className="section container">
        <div className="section__head"><div><span className="eyebrow"><Sk w="8ch" /></span><span className="h2"><Sk w="180px" /></span></div></div>
        <ProductGridSkeleton count={8} />
      </section>
    </>
  );
}
