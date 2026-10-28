import { Loading, Sk } from '@/components/Skeleton';

export default function PolicyLoading() {
  return (
    <div className="container">
      <Loading label="Loading the page" />
      <header className="page-title">
        <div className="crumbs"><Sk w="160px" /></div>
        <span className="h1"><Sk w="260px" /></span>
        <p className="muted"><Sk w="140px" /></p>
      </header>
      <div className="toolbar"><div className="toolbar__chips"><Sk w="360px" /></div></div>
      <div className="prose"><Sk w="96%" /><Sk w="92%" /><Sk w="70%" /><Sk w="88%" /></div>
    </div>
  );
}
