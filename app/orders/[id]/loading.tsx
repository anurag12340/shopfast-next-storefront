import { Loading, Sk, SkBlock } from '@/components/Skeleton';

export default function OrderLoading() {
  return (
    <div className="container">
      <Loading label="Loading your order" />
      <div className="order">
        <header className="order-head">
          <div className="crumbs"><Sk w="120px" /></div>
          <div className="order-head__top"><span className="h2"><Sk w="200px" /></span></div>
          <p className="muted"><Sk w="60%" /></p>
        </header>
        <aside className="order__side">
          <div className="panel summary">
            <span className="summary__title"><Sk w="100px" /></span>
            <div className="summary__rows">
              {[0, 1, 2].map((i) => <div key={i} className="summary__row"><Sk w="30%" /><Sk w="20%" /></div>)}
              <div className="summary__row summary__row--total"><Sk w="20%" /><Sk w="26%" /></div>
            </div>
          </div>
          <span className="btn btn--block" style={{ padding: 0 }}><SkBlock /></span>
        </aside>
        <section>
          <span className="eyebrow" style={{ display: 'block', marginBottom: 10 }}><Sk w="8ch" /></span>
          <div className="cart__lines">
            <div className="line"><span className="line__media"><SkBlock /></span><span className="line__info"><span className="line__title"><Sk w="50%" /></span><span className="line__variant"><Sk w="40%" /></span></span><span className="price"><Sk w="7ch" /></span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
