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

/* === Peek summary rendered at top of sheet === */
function MobilePeek({ activeDay, activeNode, activeSeg, state }) {
  let eyebrow, title, right;

  if (activeNode) {
    const n = nodeById[activeNode];
    if (n) {
      eyebrow = n.type;
      title = <em>{n.label}</em>;
      right = n.elev != null
        ? (<><b>{n.elev.toLocaleString()}</b><span>ft</span></>)
        : (n.sub ? <span style={{ fontSize: 10, opacity: 0.7 }}>{n.sub}</span> : null);
    }
  } else if (activeSeg) {
    const s = D.segments.find(x => x.id === activeSeg);
    if (s) {
      eyebrow = `Day ${s.day} · Segment`;
      title = s.label;
      right = s.mode === "hike"
        ? (<><b>{s.distance}</b><span>mi</span></>)
        : (<><b>{s.hours}</b><span>h</span></>);
    }
  } else if (activeDay !== "all" && activeDay != null) {
    const d = D.days.find(x => x.day === activeDay);
    if (d) {
      eyebrow = `Day ${d.day} · ${d.date}`;
      title = d.title;
      right = (<><b>{d.miles}</b><span>mi</span></>);
    }
  } else {
    eyebrow = "5 days · 4 nights · ~41 mi";
    title = (<>The <em>W</em>‑Trek</>);
    right = (<><b>41</b><span>mi</span></>);
  }

  return (
    <div className="m-sheet-peek">
      <div className="m-sheet-peek-l">
        <div className="m-sheet-peek-eyebrow">{eyebrow}</div>
        <div className="m-sheet-peek-title">{title}</div>
      </div>
      <div className="m-sheet-peek-r">
        {right}
        <span className="m-sheet-peek-caret" aria-hidden="true">
          {state === "full" ? "▾" : "▴"}
        </span>
      </div>
    </div>
  );
}
window.MobilePeek = MobilePeek;

/* === Draggable bottom sheet === */
function MobileSheet({ state, setState, peek, children }) {
  const sheetRef = useRefMo(null);
  const bodyRef = useRefMo(null);
  const dragRef = useRefMo({
    active: false,
    startY: 0,
    startTranslate: 0,
    sheetH: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
    fromHandle: false,
  });

  // Propagate state changes to the .app element so siblings (elevation strip, leaflet) can react.
  useEffectMo(() => {
    const app = document.querySelector(".app");
    if (app) app.setAttribute("data-sheet-state", state);
  }, [state]);

  const beginDrag = (e, fromHandle) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const rect = sheet.getBoundingClientRect();
    const winH = window.innerHeight;
    const sheetH = sheet.offsetHeight;
    // current translateY = rect.top - (winH - sheetH)  [since bottom: 0]
    const currentTranslate = rect.top - (winH - sheetH);

    dragRef.current = {
      active: true,
      startY: e.clientY,
      startTranslate: currentTranslate,
      sheetH,
      lastY: e.clientY,
      lastT: performance.now(),
      velocity: 0,
      fromHandle,
    };
    sheet.classList.add("dragging");
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const onMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    // If user is dragging from the body and the body is scrolled, prefer scroll
    if (!d.fromHandle && bodyRef.current && bodyRef.current.scrollTop > 0) {
      // cancel drag — let scroll happen
      d.active = false;
      sheetRef.current?.classList.remove("dragging");
      return;
    }
    const dy = e.clientY - d.startY;
    let newTranslate = d.startTranslate + dy;
    // Clamp: at minimum 0 (fully expanded), at maximum sheetH - peekMin (so peek always shows)
    const peekMin = 88;
    newTranslate = Math.max(0, Math.min(d.sheetH - peekMin, newTranslate));
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${newTranslate}px)`;
    }
    // Track velocity
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.velocity = (e.clientY - d.lastY) / dt; // px per ms; positive = downward
    d.lastY = e.clientY;
    d.lastT = now;
  };

  const endDrag = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    const sheet = sheetRef.current;
    if (!sheet) return;
    sheet.classList.remove("dragging");

    // Read current translate from inline style or rect
    const rect = sheet.getBoundingClientRect();
    const winH = window.innerHeight;
    const sheetH = sheet.offsetHeight;
    const currentTranslate = rect.top - (winH - sheetH);
    const visible = sheetH - currentTranslate;

    // Snap targets
    const peekVis = 110;
    const midVis = Math.round(winH * 0.52);
    const fullVis = sheetH;

    // Use velocity for direction bias (>0.5 px/ms is a swipe)
    let newState;
    const vel = d.velocity;
    if (Math.abs(vel) > 0.5) {
      if (vel < 0) {
        // upward — go up one notch from current
        if (visible < midVis) newState = "mid";
        else newState = "full";
      } else {
        // downward — go down one notch
        if (visible > midVis) newState = "mid";
        else newState = "peek";
      }
    } else {
      // Snap to nearest by visible amount
      const dists = [
        { s: "peek", d: Math.abs(visible - peekVis) },
        { s: "mid", d: Math.abs(visible - midVis) },
        { s: "full", d: Math.abs(visible - fullVis) },
      ];
      dists.sort((a, b) => a.d - b.d);
      newState = dists[0].s;
    }

    sheet.style.transform = "";
    setState(newState);
  };

  const onPeekClick = (e) => {
    // Tap on peek toggles between peek <-> mid; tap when at full -> peek
    if (state === "peek") setState("mid");
    else if (state === "mid") setState("full");
    else setState("peek");
  };

  return (
    <div className="m-sheet" data-state={state} ref={sheetRef}>
      <button
        type="button"
        className="m-sheet-handle"
        onPointerDown={(e) => beginDrag(e, true)}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={onPeekClick}
        aria-label="Drag to resize panel"
      >
        <span className="m-sheet-handle-bar"></span>
      </button>
      <div
        className="m-sheet-peek-wrap"
        onPointerDown={(e) => beginDrag(e, true)}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={onPeekClick}
      >
        {peek}
      </div>
      <div className="m-sheet-body" ref={bodyRef}>
        {children}
      </div>
    </div>
  );
}
window.MobileSheet = MobileSheet;
