'use client';
// Skeletons that need to know something only the browser has: how many lines the cart holds and whether a buyer is
// signed in (both from readable cookies kept by the server actions). They draw the page they turn into.
import { useCartLines, useSignedIn } from './client-cookies';
import { Loading, Sk, SkBlock } from './Skeleton';

export function CartSkeleton() {
  const lines = useCartLines(1);
  return (
    <div className="container">
      <Loading label="Loading your cart" />
      <header className="page-title"><span className="eyebrow"><Sk w="4ch" /></span><span className="h1"><Sk w="220px" /></span></header>
      {lines === 0 ? (
        <div className="empty">
          <div className="empty__art"><SkBlock /></div>
          <span className="h2"><Sk w="220px" /></span>
          <p><Sk w="300px" /></p>
          <span className="btn" style={{ width: 170, padding: 0 }}><SkBlock /></span>
        </div>
      ) : (
        <div className="cart">
          <div className="cart__lines">
            {Array.from({ length: lines }, (_, i) => (
              <div key={i} className="line">
                <span className="line__media"><SkBlock /></span>
                <span className="line__info">
                  <span className="line__title"><Sk w="60%" /></span>
                  <span className="line__variant"><Sk w="30%" /></span>
                  <span className="line__controls"><span className="stepper stepper--sm" style={{ width: 92 }}><SkBlock /></span></span>
                </span>
                <span className="line__end"><span className="price line__total"><Sk w="7ch" /></span></span>
              </div>
            ))}
          </div>
          <aside className="panel summary">
            <span className="summary__title"><Sk w="140px" /></span>
            <div className="summary__rows">
              {[0, 1, 2, 3].map((i) => <div key={i} className="summary__row"><Sk w="30%" /><Sk w="18%" /></div>)}
              <div className="summary__row summary__row--total"><Sk w="20%" /><Sk w="26%" /></div>
            </div>
            <div className="code-form">
              <span className="label"><Sk w="60%" /></span>
              <div className="code-form__row"><span className="input" style={{ padding: 0 }}><SkBlock /></span><span className="btn" style={{ width: 76, padding: 0 }}><SkBlock /></span></div>
              <p className="field__msg" />
            </div>
            <div className="summary__actions">
              <span className="btn btn--lg btn--block" style={{ padding: 0 }}><SkBlock /></span>
              <span className="btn btn--block" style={{ padding: 0 }}><SkBlock /></span>
              <p className="summary__error" />
            </div>
            <p className="summary__fine"><Sk w="60%" /></p>
          </aside>
        </div>
      )}
    </div>
  );
}

export function AccountSkeleton() {
  const signedIn = useSignedIn();
  if (!signedIn) {
    return (
      <div className="container auth">
        <Loading label="Loading your account" />
        <div className="narrow panel auth-card">
          <div className="auth-card__head">
            <span className="eyebrow"><Sk w="7ch" /></span>
            <span className="h2"><Sk w="90px" /></span>
            <p className="auth-card__lead"><Sk w="80%" /></p>
          </div>
          <div className="field">
            <span className="label"><Sk w="5ch" /></span>
            <span className="input" style={{ padding: 0 }}><SkBlock /></span>
            <p className="field__msg"><Sk w="70%" /></p>
            <span className="btn btn--lg btn--block" style={{ padding: 0 }}><SkBlock /></span>
            <span className="field__msg"><Sk w="60%" /></span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <Loading label="Loading your account" />
      <div className="account-head">
        <span className="avatar" style={{ border: 0, overflow: 'hidden' }}><SkBlock /></span>
        <span className="account-head__text"><span className="account-head__name"><Sk w="180px" /></span><span className="account-head__email"><Sk w="260px" /></span></span>
      </div>
      <div className="tabs">{[96, 150, 120, 80, 90].map((w) => <span key={w} className="tab" style={{ width: w }}><Sk w="100%" /></span>)}</div>
      <div className="list">
        {[0, 1, 2].map((i) => (
          <div key={i} className="row">
            <span className="row__main"><span className="row__title"><Sk w="55%" /></span><span className="row__sub"><Sk w="30%" /></span></span>
            <span className="row__end"><Sk w="80px" /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
