/* global React */
const { useState: useStateMo, useEffect: useEffectMo, useRef: useRefMo } = React;

/* === useIsMobile hook === */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useStateMo(() =>
    typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint}px)`).matches
  );
  useEffectMo(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
    };
  }, [breakpoint]);
  return isMobile;
}
window.useIsMobile = useIsMobile;

/* === Mobile top bar === */
function MobileTopBar() {
  return (
    <header className="m-topbar">
      <div className="m-topbar-brand">
        <svg className="brand-logo" viewBox="0 0 56 44" aria-hidden="true">
          <circle cx="40" cy="14" r="5.2" className="logo-sun" />
          <path d="M 0 36 L 14 18 L 24 28 L 36 12 L 48 26 L 56 20 L 56 44 L 0 44 Z" className="logo-ridge-back" />
          <path d="M 0 40 L 10 26 L 20 36 L 30 22 L 42 34 L 56 28 L 56 44 L 0 44 Z" className="logo-ridge-mid" />
          <path d="M 2 42 L 14 22 L 22 34 L 30 18 L 38 32 L 50 22 L 56 42 L 56 44 L 2 44 Z" className="logo-ridge-fore" />
          <path d="M 14 22 L 16 25 L 12 25 Z" className="logo-snow" />
          <path d="M 30 18 L 33 22 L 27 22 Z" className="logo-snow" />
          <path d="M 50 22 L 52.5 25.5 L 47.5 25.5 Z" className="logo-snow" />
        </svg>
        <div className="m-topbar-text">
          <div className="m-topbar-mark">The <em>W</em>‑Trek</div>
          <div className="m-topbar-meta">Torres del Paine · Dec 29 → Jan 2</div>
        </div>
      </div>
      <div className="m-topbar-stats" aria-label="Trip totals">
        <div className="m-topbar-stat"><b>5<i>/</i>4</b><span>D/N</span></div>
        <div className="m-topbar-stat"><b>41</b><span>mi</span></div>
        <div className="m-topbar-stat"><b>7.8k</b><span>ft</span></div>
      </div>
    </header>
  );
}
window.MobileTopBar = MobileTopBar;

/* === Detail page — a FULL-SCREEN page that replaces the landing view
   when the user picks a day / segment / non-night node.
   Not a modal: the page just scrolls. A sticky "← Back to map" bar at
   the top returns the user to the landing screen.
=== */
function MobileDetailPage({ onClose, title, children }) {
  // Scroll the new page to the top on mount so the user lands on the title.
  useEffectMo(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <section className="m-detail-page">
      <div className="m-detail-back-bar">
        <button
          type="button"
          className="m-detail-back"
          onClick={onClose}
          aria-label="Back to map"
        >
          <span className="m-detail-back-arrow" aria-hidden="true">←</span>
          <span className="m-detail-back-lbl">Back to map</span>
        </button>
        {title && <span className="m-detail-back-title">{title}</span>}
      </div>
      <div className="m-detail-page-body">
        {children}
      </div>
    </section>
  );
}
window.MobileDetailPage = MobileDetailPage;
