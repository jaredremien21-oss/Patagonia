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

/* === Detail sheet — modal overlay that pops up when the user selects
   something on the map or taps an itinerary row.
   - Slides up from bottom
   - Has a close button that calls onClose()
   - Locks body scroll while open
   - Closes on backdrop tap
=== */
function MobileDetailSheet({ open, onClose, title, children }) {
  // Animate mount/unmount
  const [shouldRender, setShouldRender] = useStateMo(open);
  const [isAnimatedOpen, setIsAnimatedOpen] = useStateMo(false);

  useEffectMo(() => {
    if (open) {
      setShouldRender(true);
      // Next tick: trigger the open class so transform animates
      const id = requestAnimationFrame(() => setIsAnimatedOpen(true));
      return () => cancelAnimationFrame(id);
    } else {
      setIsAnimatedOpen(false);
      // Wait for transition before unmount
      const t = setTimeout(() => setShouldRender(false), 340);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll
  useEffectMo(() => {
    if (open) {
      document.body.classList.add("m-sheet-open");
    } else {
      document.body.classList.remove("m-sheet-open");
    }
    return () => document.body.classList.remove("m-sheet-open");
  }, [open]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`m-detail-backdrop ${isAnimatedOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className={`m-detail-sheet ${isAnimatedOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Detail"}
      >
        <div className="m-detail-sheet-handle" aria-hidden="true"></div>
        <div className="m-detail-sheet-head">
          <span className="m-detail-sheet-eyebrow">{title || ""}</span>
          <button
            type="button"
            className="m-detail-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </div>
        <div className="m-detail-sheet-body">
          {children}
        </div>
      </div>
    </>
  );
}
window.MobileDetailSheet = MobileDetailSheet;
