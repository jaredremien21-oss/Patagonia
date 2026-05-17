/* global React */
const { useState: useStateP } = React;

function Panel({ activeNode, activeSeg, activeDay, photos, setPhotos, notes, setNotes, gearChecked, setGearChecked, onSegClick, onDayClick, onReset }) {
  const dayData = activeDay !== "all" ? D.days.find(d => d.day === activeDay) : null;
  const node = activeNode ? nodeById[activeNode] : null;
  const seg = activeSeg ? D.segments.find(s => s.id === activeSeg) : null;

  // Determine what to show: node detail > seg detail > day overview > all
  let mode = "all";
  if (node) mode = "node";
  else if (seg) mode = "seg";
  else if (dayData) mode = "day";

  // Back-button label varies by depth
  let backLabel = null;
  if (mode === "day") backLabel = "All days";
  else if (mode === "seg") backLabel = `Day ${seg.day}`;
  else if (mode === "node") backLabel = "All days";

  return (
    <aside className="panel">
      {mode !== "all" && (
        <button
          className="panel-back"
          onClick={() => {
            if (mode === "seg") onReset({ keepDay: true });
            else onReset({});
          }}
          title="Back to overview"
        >
          <span className="panel-back-arrow">←</span>
          <span>{backLabel}</span>
        </button>
      )}
      {mode === "all" && <AllOverview onDayClick={onDayClick} />}
      {mode === "day" && <DayOverview day={dayData} onSegClick={onSegClick} activeSeg={activeSeg} gearChecked={gearChecked} setGearChecked={setGearChecked} photos={photos} setPhotos={setPhotos} notes={notes} setNotes={setNotes} />}
      {mode === "seg" && <SegDetail seg={seg} />}
      {mode === "node" && (
        <NodeDetail
          node={node}
          photo={photos[node.id]}
          setPhoto={(d) => setPhotos({...photos, [node.id]: d})}
          note={notes[node.id] || ""}
          setNote={(v) => setNotes({...notes, [node.id]: v})}
        />
      )}
    </aside>
  );
}

function AllOverview({ onDayClick }) {
  return (
    <>
      <div className="panel-section">
        <div className="panel-eyebrow">5 days · 4 nights · ~41 mi</div>
        <h1 className="panel-title">The <em>W</em>‑Trek</h1>
        <div className="panel-meta">
          <span>Dec 29 → Jan 2</span>
          <span>East → West</span>
          <span>Hut-supported</span>
        </div>
        <p className="panel-blurb">
          Five days tracing a "W" across three valleys of Torres del Paine — Ascencio, Francés, Grey. Big sunrise on Day 2, NYE at the Paine Grande bar, and finishing at Glacier Grey. Click any day below, or tap a camp on the map.
        </p>
      </div>

      <div className="panel-section">
        <div className="panel-eyebrow">Itinerary · click for detail</div>
        {D.days.map(d => (
          <div
            key={d.day}
            className="itin-row"
            onClick={() => onDayClick && onDayClick(d.day)}
          >
            <div className="itin-day">DAY {d.day}</div>
            <div>
              <div className="itin-title">{d.title}</div>
              <div className="itin-date">{d.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="itin-miles">{d.miles} mi</div>
              <span className={`diff-pill diff-${d.difficulty.toLowerCase()}`}>{d.difficulty}</span>
            </div>
            <span className="itin-arrow" aria-hidden="true">›</span>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <div className="panel-eyebrow">Trip totals</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
          <Stat n="41.6" l="miles hiked" />
          <Stat n="~7,800" l="ft elev gained" />
          <Stat n="29.5" l="hours moving" />
          <Stat n="4" l="refugios" />
        </div>
      </div>
    </>
  );
}

function Stat({ n, l, color }) {
  const tone = color === "gain" ? "var(--gain)" : color === "loss" ? "var(--loss)" : "var(--ink)";
  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: tone, lineHeight: 1 }}>{n}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>{l}</div>
    </div>
  );
}

function DayOverview({ day, onSegClick, activeSeg, gearChecked, setGearChecked, photos, setPhotos, notes, setNotes }) {
  const segs = D.segments.filter(s => s.day === day.day);
  const totalGain = segs.reduce((s, x) => s + x.gain, 0);
  const totalLoss = segs.reduce((s, x) => s + x.loss, 0);
  // Find the camp this day ends at (the night-camp). Memory + photo live on the camp's id.
  const nightCamp = D.nodes.find(n => n.type === "camp" && Array.isArray(n.nights) && n.nights.includes(day.day));
  const campId = nightCamp ? nightCamp.id : null;
  const memPhoto = campId && photos ? photos[campId] : null;
  const memNote = campId && notes ? (notes[campId] || "") : "";
  const onPhotoChange = (e) => {
    if (!campId || !setPhotos) return;
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPhotos({ ...photos, [campId]: ev.target.result });
    r.readAsDataURL(f);
  };
  return (
    <>
      <div className="panel-section">
        <div className="panel-eyebrow">Day {day.day} · {day.date}</div>
        <h1 className="panel-title">{day.title.split(" ").map((w, i) =>
          i === day.title.split(" ").length - 1 ? <em key={i}>{w}</em> : w + " "
        )}</h1>
        <div className="panel-meta">
          <span>{day.miles} mi</span>
          <span>
            <span className="elev-gain">+{totalGain.toLocaleString()}</span>
            <span style={{ color: "var(--ink-faint)", margin: "0 4px" }}>/</span>
            <span className="elev-loss">−{totalLoss.toLocaleString()}</span>
            <span style={{ color: "var(--ink-faint)", marginLeft: 3 }}>ft</span>
          </span>
          <span><span className={`diff-pill diff-${day.difficulty.toLowerCase()}`}>{day.difficulty}</span></span>
        </div>
        <p className="panel-blurb">{day.blurb}</p>
        <MiniElevation day={day.day} />
      </div>

      <div className="panel-section">
        <div className="panel-eyebrow">Segments · click for detail</div>
        <div className="seg-list" style={{ marginTop: 8 }}>
          {segs.map(s => (
            <div
              key={s.id}
              className={`seg-row ${activeSeg === s.id ? "active" : ""}`}
              onClick={() => onSegClick(s.id)}
            >
              <div className="seg-row-time">{s.depart}<br/>{s.arrive}</div>
              <div className="seg-row-label">
                {s.label}
                {s.hero && <span className="hero-tag">★ {s.hero}</span>}
              </div>
              <div className="seg-row-meta">
                {s.mode === "hike" ? <><b>{s.distance} mi</b><br/><span className="elev-gain">+{s.gain}</span><span style={{ color: "var(--ink-faint)" }}>/</span><span className="elev-loss">−{s.loss}</span></> : <><b>{s.hours}h</b><br/>{s.mode}</>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-eyebrow">Forecast</div>
        <WeatherCard w={day.weather} />
      </div>

      <div className="panel-section">
        <div className="panel-eyebrow">Pack for today</div>
        <div className="gear-list">
          {day.gear.map((g, i) => {
            const key = `d${day.day}-${i}`;
            const checked = gearChecked[key];
            return (
              <div
                key={key}
                className={`gear-item ${checked ? "checked" : ""}`}
                onClick={() => setGearChecked({ ...gearChecked, [key]: !checked })}
              >
                <span className="gear-check"></span>
                <span className="gear-text">{g}</span>
              </div>
            );
          })}
        </div>
      </div>

      {nightCamp && setPhotos && setNotes && (
        <div className="panel-section">
          <div className="panel-eyebrow">Memory · night at {nightCamp.label}</div>
          <div className="camp-extras">
            <label className="photo-slot">
              {memPhoto ? <img src={memPhoto} alt="" /> : <span>Drop photo</span>}
              <input type="file" accept="image/*" onChange={onPhotoChange} />
            </label>
            <textarea
              className="notes-input"
              value={memNote}
              onChange={e => setNotes({ ...notes, [campId]: e.target.value })}
              placeholder={`Notes from ${nightCamp.label}…`}
              rows={5}
            />
          </div>
        </div>
      )}
    </>
  );
}

function SegDetail({ seg }) {
  const a = nodeById[seg.from];
  const b = nodeById[seg.to];
  return (
    <>
      <div className="panel-section">
        <div className="panel-eyebrow">Day {seg.day} · Segment</div>
        <h1 className="panel-title" style={{ fontSize: 24 }}>
          {a.label}<br/>
          <span style={{ color: "var(--ink-faint)", fontFamily: "var(--mono)", fontSize: 14, fontStyle: "normal" }}>↓</span><br/>
          <em>{b.label}</em>
        </h1>
        <div className="panel-meta">
          <span>{seg.depart} → {seg.arrive}</span>
          <span>{seg.hours}h moving</span>
        </div>
      </div>
      <div className="panel-section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {seg.mode === "hike" ? (
            <>
              <Stat n={seg.distance} l="miles" />
              <Stat n={`+${seg.gain}`} l="ft gained" color="gain" />
              <Stat n={`−${seg.loss}`} l="ft lost" color="loss" />
              <div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", textTransform: "capitalize" }}>
                  <span className={`diff-pill diff-${seg.difficulty}`}>{seg.difficulty}</span>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>difficulty</div>
              </div>
            </>
          ) : (
            <>
              <Stat n={seg.hours + "h"} l="duration" />
              <Stat n={seg.mode} l="mode" />
            </>
          )}
        </div>
        <p className="panel-blurb">{seg.label}{seg.hero ? ` — ${seg.hero}` : ""}.</p>
      </div>
    </>
  );
}

function NodeDetail({ node, photo, setPhoto, note, setNote }) {
  const usedIn = D.segments.filter(s => s.from === node.id || s.to === node.id);
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => setPhoto(ev.target.result);
    r.readAsDataURL(f);
  };
  return (
    <>
      <div className="panel-section">
        <div className="panel-eyebrow">{node.type}</div>
        <h1 className="panel-title"><em>{node.label}</em></h1>
        <div className="panel-meta">
          {node.sub && <span>{node.sub}</span>}
          {node.elev != null && <span>{node.elev.toLocaleString()} ft</span>}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-eyebrow">Arrivals & departures</div>
        <div className="seg-list" style={{ marginTop: 8 }}>
          {usedIn.map(s => {
            const isArrival = s.to === node.id;
            return (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, padding: "8px 4px", borderBottom: "1px solid var(--paper-edge)", fontSize: 12.5 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.08em" }}>D{s.day}</span>
                <span>
                  <b>{isArrival ? "Arrive" : "Depart"}</b>
                  <span style={{ color: "var(--ink-faint)" }}> {isArrival ? "from" : "to"} {nodeById[isArrival ? s.from : s.to].label}</span>
                </span>
                <span style={{ fontFamily: "var(--mono)", color: "var(--ink-soft)" }}>{isArrival ? s.arrive : s.depart}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-eyebrow">Memory</div>
        <div className="camp-extras">
          <label className="photo-slot">
            {photo ? <img src={photo} alt="" /> : <span>Drop photo</span>}
            <input type="file" accept="image/*" onChange={handleFile} />
          </label>
          <textarea
            className="notes-input"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Notes from this camp…"
            rows={5}
          />
        </div>
      </div>
    </>
  );
}

window.Panel = Panel;

// Weather forecast card for a day
function WeatherIcon({ kind }) {
  const stroke = "var(--ink-soft)";
  const sun = "var(--ochre)";
  const cloud = "var(--ink-faint)";
  if (kind === "sun-wind") {
    return (
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="14" cy="16" r="6" fill={sun} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const r1 = 8, r2 = 11;
          const rad = (a * Math.PI) / 180;
          return <line key={a} x1={14 + Math.cos(rad) * r1} y1={16 + Math.sin(rad) * r1}
            x2={14 + Math.cos(rad) * r2} y2={16 + Math.sin(rad) * r2}
            stroke={sun} strokeWidth="1.5" strokeLinecap="round" />;
        })}
        <path d="M 5 30 Q 14 28 22 30 T 38 30" fill="none" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
        <path d="M 8 34 Q 16 32 24 34 T 36 34" fill="none" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }
  if (kind === "wind") {
    return (
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="28" cy="12" r="4.5" fill={sun} opacity="0.7" />
        <path d="M 4 14 L 24 14 Q 30 14 30 10 T 24 6" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 4 22 L 30 22 Q 36 22 36 18 T 30 14" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 4 30 L 22 30 Q 28 30 28 34 T 22 38" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </svg>
    );
  }
  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <path d="M 11 26 Q 5 26 5 20 Q 5 14 12 14 Q 14 8 21 8 Q 28 8 30 14 Q 36 14 36 20 Q 36 26 30 26 Z"
          fill={cloud} opacity="0.35" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
        <line x1="14" y1="30" x2="12" y2="36" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        <line x1="22" y1="30" x2="20" y2="36" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        <line x1="30" y1="30" x2="28" y2="36" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }
  // "partly" — default
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <circle cx="14" cy="14" r="6" fill={sun} />
      {[0, 60, 120, 180, 240, 300].map(a => {
        const rad = (a * Math.PI) / 180;
        return <line key={a} x1={14 + Math.cos(rad) * 8} y1={14 + Math.sin(rad) * 8}
          x2={14 + Math.cos(rad) * 11} y2={14 + Math.sin(rad) * 11}
          stroke={sun} strokeWidth="1.5" strokeLinecap="round" />;
      })}
      <path d="M 14 28 Q 9 28 9 23 Q 9 18 15 18 Q 17 13 23 13 Q 30 13 32 19 Q 37 19 37 24 Q 37 30 31 30 L 14 30 Z"
        fill={cloud} opacity="0.45" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function WeatherCard({ w }) {
  if (!w) return null;
  return (
    <div className="wx-card">
      <div className="wx-row-top">
        <div className="wx-icon"><WeatherIcon kind={w.icon} /></div>
        <div className="wx-temps">
          <span className="wx-hi">{w.high}°</span>
          <span className="wx-lo">/ {w.low}°</span>
          <span className="wx-unit">F</span>
        </div>
        <div className="wx-cond">{w.conditions}</div>
      </div>
      <div className="wx-stats">
        <div className="wx-stat">
          <span className="wx-stat-lbl">Wind</span>
          <span className="wx-stat-val">{w.wind} mph</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-lbl">Sunrise</span>
          <span className="wx-stat-val">{w.sunrise}</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-lbl">Sunset</span>
          <span className="wx-stat-val">{w.sunset}</span>
        </div>
      </div>
      <div className="wx-dress">
        <span className="wx-dress-lbl">Dress</span>
        <span className="wx-dress-text">{w.dress}</span>
      </div>
    </div>
  );
}
window.WeatherCard = WeatherCard;

// Mini elevation strip for a single day, shown in the day overview
function MiniElevation({ day }) {
  const W = 320, H = 76, pad = { l: 32, r: 6, t: 8, b: 18 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const bounds = DAY_BOUNDS[day];
  if (!bounds) return null;

  // Slice points within day range
  const pts = ELEV_POINTS.filter(p => p.x >= bounds.start - 0.001 && p.x <= bounds.end + 0.001);
  if (pts.length < 2) return null;

  const xMin = bounds.start, xMax = bounds.end;
  const eMin = Math.min(...pts.map(p => p.elev));
  const eMax = Math.max(...pts.map(p => p.elev));
  const ePad = Math.max(50, (eMax - eMin) * 0.1);
  const yMin = Math.max(0, eMin - ePad);
  const yMax = eMax + ePad;

  const xScale = x => pad.l + ((x - xMin) / (xMax - xMin)) * innerW;
  const yScale = e => pad.t + innerH - ((e - yMin) / (yMax - yMin)) * innerH;

  const linePath = pts.map((p, i) =>
    (i === 0 ? "M" : "L") + " " + xScale(p.x).toFixed(2) + " " + yScale(p.elev).toFixed(2)
  ).join(" ");

  const fillPath = linePath +
    ` L ${xScale(xMax).toFixed(2)} ${(pad.t + innerH).toFixed(2)}` +
    ` L ${xScale(xMin).toFixed(2)} ${(pad.t + innerH).toFixed(2)} Z`;

  // 3 ticks
  const tickStep = Math.ceil((yMax - yMin) / 3 / 250) * 250;
  const ticks = [];
  for (let v = Math.ceil(yMin / tickStep) * tickStep; v <= yMax; v += tickStep) ticks.push(v);

  // Peak label
  const peak = pts.reduce((a, b) => b.elev > a.elev ? b : a, pts[0]);

  return (
    <div className="mini-elev-wrap">
      <div className="mini-elev-head">
        <span>Elevation profile</span>
        <span className="mini-elev-peak">Peak {Math.round(peak.elev).toLocaleString()} ft</span>
      </div>
      <svg className="mini-elev-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`miniGrad-${day}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"  stopColor="var(--forest)"     stopOpacity="0.18" />
            <stop offset="60%" stopColor="var(--ochre)"      stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--terracotta)" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {ticks.map(v => (
          <g key={v}>
            <line x1={pad.l} x2={pad.l + innerW} y1={yScale(v)} y2={yScale(v)} className="mini-tick" />
            <text x={pad.l - 4} y={yScale(v) + 3} className="mini-tick-label" textAnchor="end">{v.toLocaleString()}</text>
          </g>
        ))}
        <path d={fillPath} fill={`url(#miniGrad-${day})`} />
        <path d={linePath} className="mini-line" />
        <circle cx={xScale(peak.x)} cy={yScale(peak.elev)} r="3" className="mini-peak" />
        <text x={pad.l - 4} y={pad.t - 1} className="mini-axis-title" textAnchor="end">ft</text>
        <text x={pad.l} y={H - 4} className="mini-axis-foot" textAnchor="start">0 mi</text>
        <text x={pad.l + innerW} y={H - 4} className="mini-axis-foot" textAnchor="end">{(xMax - xMin).toFixed(1)} mi</text>
      </svg>
    </div>
  );
}
window.MiniElevation = MiniElevation;
