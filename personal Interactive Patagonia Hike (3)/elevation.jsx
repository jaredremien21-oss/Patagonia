/* global React */
const { useMemo: useMemoElev } = React;

function ElevationStrip({ activeDay, walkProgress, onScrub, show, onDayClick }) {
  if (!show) return null;
  const W = 1400, H = 130, pad = { l: 44, r: 18, t: 14, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const xScale = x => pad.l + (x / TOTAL_HIKE_DIST) * innerW;
  const yScale = e => {
    const range = ELEV_MAX - ELEV_MIN;
    return pad.t + innerH - ((e - ELEV_MIN) / range) * innerH;
  };

  const linePath = useMemoElev(() => ELEV_POINTS.map((p, i) =>
    (i === 0 ? "M" : "L") + " " + xScale(p.x).toFixed(2) + " " + yScale(p.elev).toFixed(2)
  ).join(" "), []);

  const fillPath = useMemoElev(() => {
    const top = ELEV_POINTS.map((p, i) =>
      (i === 0 ? "M" : "L") + " " + xScale(p.x).toFixed(2) + " " + yScale(p.elev).toFixed(2)
    ).join(" ");
    return top + ` L ${xScale(TOTAL_HIKE_DIST)} ${pad.t + innerH} L ${xScale(0)} ${pad.t + innerH} Z`;
  }, []);

  // Y axis ticks
  const ticks = useMemoElev(() => {
    const n = 4;
    const step = Math.ceil((ELEV_MAX - ELEV_MIN) / n / 500) * 500;
    const out = [];
    for (let v = Math.ceil(ELEV_MIN / step) * step; v <= ELEV_MAX; v += step) out.push(v);
    return out;
  }, []);

  // Walker x position
  const totalHours = D.segments.reduce((s, x) => s + x.hours, 0);
  const targetHrs = walkProgress * totalHours;
  let acc = 0, currentDist = 0;
  for (const seg of D.segments) {
    if (acc + seg.hours >= targetHrs) {
      const t = (targetHrs - acc) / seg.hours;
      currentDist += (seg.mode === "hike" ? seg.distance : 0.3) * t;
      break;
    }
    acc += seg.hours;
    currentDist += seg.mode === "hike" ? seg.distance : 0.3;
  }
  const markerX = xScale(currentDist);
  let markerY = pad.t + innerH;
  for (let i = 1; i < ELEV_POINTS.length; i++) {
    if (ELEV_POINTS[i].x >= currentDist) {
      const a = ELEV_POINTS[i-1], b = ELEV_POINTS[i];
      const t = (currentDist - a.x) / Math.max(0.01, b.x - a.x);
      markerY = yScale(a.elev + (b.elev - a.elev) * t);
      break;
    }
  }

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const svgX = (px / rect.width) * W;
    const dist = ((svgX - pad.l) / innerW) * TOTAL_HIKE_DIST;
    let cum = 0, hrs = 0;
    for (const seg of D.segments) {
      const segDist = seg.mode === "hike" ? seg.distance : 0.3;
      if (cum + segDist >= dist) {
        const t = (dist - cum) / Math.max(0.01, segDist);
        hrs += seg.hours * t;
        break;
      }
      cum += segDist; hrs += seg.hours;
    }
    onScrub(Math.max(0, Math.min(1, hrs / totalHours)));
  };

  return (
    <div className="scrub">
      <div className="scrub-head">
        <span><b>Elevation Profile</b> · click to scrub the trail</span>
        <span style={{ fontFamily: "var(--mono)", color: "var(--terracotta)" }}>
          Mile {currentDist.toFixed(1)} / {TOTAL_HIKE_DIST.toFixed(0)}
        </span>
      </div>
      <svg className="elev-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onClick={handleClick} style={{ cursor: "crosshair" }}>
        <defs>
          {/* Height-based vertical color gradient */}
          <linearGradient id="elevGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"  stopColor="oklch(0.55 0.085 230)" stopOpacity="0.35" />
            <stop offset="30%" stopColor="oklch(0.55 0.085 145)" stopOpacity="0.45" />
            <stop offset="60%" stopColor="oklch(0.62 0.110 78)"  stopOpacity="0.55" />
            <stop offset="85%" stopColor="oklch(0.58 0.135 45)"  stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.45 0.130 42)"  stopOpacity="0.85" />
          </linearGradient>
          <clipPath id="elevClip"><path d={fillPath} /></clipPath>
        </defs>

        {/* Y-axis ticks */}
        {ticks.map(v => (
          <g key={v}>
            <line x1={pad.l} x2={pad.l + innerW} y1={yScale(v)} y2={yScale(v)} className="elev-tick" />
            <text x={pad.l - 6} y={yScale(v) + 3} className="elev-tick-label" textAnchor="end">{v.toLocaleString()}</text>
          </g>
        ))}
        {/* Y-axis title */}
        <text x={pad.l - 6} y={pad.t - 4} className="elev-axis-title" textAnchor="end">ft</text>

        {/* Gradient fill clipped to elevation shape */}
        <rect
          x={pad.l} y={pad.t} width={innerW} height={innerH}
          fill="url(#elevGrad)"
          clipPath="url(#elevClip)"
        />

        {/* Day dividers (vertical dashed) + labels */}
        {Object.entries(DAY_BOUNDS).map(([day, b]) => {
          const isLast = Number(day) === D.days.length;
          const isActive = activeDay === Number(day);
          return (
            <g key={"day-" + day}>
              {/* vertical divider at end of day */}
              {!isLast && (
                <line
                  x1={xScale(b.end)} x2={xScale(b.end)}
                  y1={pad.t} y2={pad.t + innerH + 4}
                  className="elev-day-divider"
                />
              )}
              {/* clickable day band */}
              <rect
                x={xScale(b.start)}
                y={pad.t}
                width={xScale(b.end) - xScale(b.start)}
                height={innerH}
                fill={isActive ? "oklch(0.58 0.135 45 / 0.10)" : "transparent"}
                style={{ cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); onDayClick && onDayClick(Number(day)); }}
              />
              <text
                x={(xScale(b.start) + xScale(b.end)) / 2}
                y={pad.t + innerH + 16}
                className="elev-day-label"
                textAnchor="middle"
                fill={isActive ? "var(--terracotta)" : "var(--ink-soft)"}
                style={{ cursor: "pointer", pointerEvents: "auto" }}
                onClick={(e) => { e.stopPropagation(); onDayClick && onDayClick(Number(day)); }}
              >Day {day}</text>
              <text
                x={(xScale(b.start) + xScale(b.end)) / 2}
                y={pad.t + innerH + 26}
                className="elev-day-mi"
                textAnchor="middle"
              >{D.days[Number(day) - 1].miles} mi</text>
            </g>
          );
        })}

        {/* Top elevation outline */}
        <path d={linePath} className="elev-line" />

        {/* Marker */}
        <line
          x1={markerX} x2={markerX}
          y1={pad.t} y2={pad.t + innerH}
          stroke="var(--terracotta)" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.7"
        />
        <circle cx={markerX} cy={markerY} r="5" className="elev-marker" />
      </svg>
    </div>
  );
}

window.ElevationStrip = ElevationStrip;
