import { Loading, Sk, SkBlock } from '@/components/Skeleton';

export default function SupportLoading() {
  return (
    <div className="container">
      <Loading label="Loading support" />
      <header className="page-title">
        <span className="eyebrow"><Sk w="7ch" /></span>
        <span className="h1"><Sk w="280px" /></span>
        <p className="lead"><Sk w="420px" /></p>
      </header>
      <div className="support">
        <div className="panel support-form">
          <div className="support-form__pair">
            {[0, 1].map((i) => <div key={i} className="field"><span className="label"><Sk w="6ch" /></span><span className="input" style={{ padding: 0 }}><SkBlock /></span><p className="field__msg" /></div>)}
          </div>
          <div className="field"><span className="label"><Sk w="7ch" /></span><span className="input" style={{ padding: 0 }}><SkBlock /></span><p className="field__msg" /></div>
          <div className="field"><span className="label"><Sk w="8ch" /></span><span className="textarea" style={{ padding: 0, display: 'block' }}><SkBlock /></span><p className="field__msg" /></div>
          <p className="field__msg" />
          <span className="btn btn--lg" style={{ padding: 0, width: 160 }}><SkBlock /></span>
        </div>
        <aside className="support__side">
          {[0, 1].map((i) => <div key={i} className="panel" style={{ padding: 20, height: 124 }}><Sk w="70%" /></div>)}
        </aside>
      </div>
    </div>
  );
}
