import { Loading, Sk, SkBlock } from '@/components/Skeleton';

/** The product page's frame: gallery, title box, price, options, buttons and live line, each at its real size. */
export default function ProductLoading() {
  return (
    <div className="container">
      <Loading label="Loading the product" />
      <div className="pdp">
        <div className="crumbs pdp__crumbs"><Sk w="220px" /></div>
        <div className="pdp__media"><SkBlock /></div>
        <div className="pdp__info">
          <div className="pdp__head">
            <span className="eyebrow"><Sk w="12ch" /></span>
            <span className="pdp__title is-sk"><Sk w="72%" /></span>
          </div>
          <div className="pdp__rating"><Sk w="190px" /></div>
          <div className="pdp__short is-sk"><Sk w="94%" /><Sk w="60%" /></div>
          <div className="buybox__form">
            <div className="buybox__price"><span className="price price--xl"><Sk w="7ch" /></span></div>
            <div className="options">{[0, 1, 2].map((i) => <span key={i} className="option" style={{ width: 128 }}><SkBlock /></span>)}</div>
            <div className="buybox__actions"><span className="stepper" style={{ width: 112 }}><SkBlock /></span><span className="btn btn--lg buybox__add" style={{ padding: 0 }}><SkBlock /></span></div>
            <p className="live-line"><Sk w="150px" /></p>
            <p className="feedback" />
          </div>
          <ul className="assure">{[0, 1, 2].map((i) => <li key={i}><Sk w={i === 0 ? '70%' : '55%'} /></li>)}</ul>
        </div>
      </div>
      <section className="pdp-section">
        <span className="h2" style={{ display: 'block', marginBottom: 16 }}><Sk w="200px" /></span>
        <div className="prose"><Sk w="92%" /><Sk w="88%" /><Sk w="64%" /></div>
      </section>
    </div>
  );
}
