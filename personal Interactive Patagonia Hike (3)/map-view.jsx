/* global React, L */
const { useEffect: useEffectM, useRef: useRefM, useMemo: useMemoMV, useState: useStateMV } = React;

function MapView({ activeDay, activeNode, activeSeg, hoverSeg, walkProgress, editMode, overrides, onNodeMove, onNodeClick, onSegClick, onSegHover }) {
  const mapElRef = useRefM(null);
  const mapRef = useRefM(null);
  const layersRef = useRefM({ segs: {}, segLabels: {}, nodes: {}, walker: null });
  const [legendOpen, setLegendOpen] = useStateMV(() => {
    try { return localStorage.getItem('wtrek-legend-open') !== '0'; } catch { return true; }
  });
  const toggleLegend = () => setLegendOpen(v => {
    const next = !v;
    try { localStorage.setItem('wtrek-legend-open', next ? '1' : '0'); } catch {}
    return next;
  });

  // Effective lngLat lookup (applies overrides)
  const effLngLat = (id) => overrides.nodes?.[id] || nodeById[id].lngLat;

  // Init Leaflet map once
  useEffectM(() => {
    if (mapRef.current) return;
    const map = L.map(mapElRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
    });
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri", maxZoom: 17 }
    ).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}",
      { opacity: 0.25, maxZoom: 17 }
    ).addTo(map);

    const lats = D.nodes.map(n => effLngLat(n.id)[1]);
    const lngs = D.nodes.map(n => effLngLat(n.id)[0]);
    map.fitBounds([
      [Math.min(...lats) - 0.005, Math.min(...lngs) - 0.01],
      [Math.max(...lats) + 0.005, Math.max(...lngs) + 0.01],
    ], { padding: [30, 30] });

    mapRef.current = map;
  }, []);

  // Build / rebuild segments + labels whenever overrides or edit mode change
  useEffectM(() => {
    const map = mapRef.current;
    if (!map) return;

    // Tear down old segs + labels
    Object.values(layersRef.current.segs).forEach(p => map.removeLayer(p));
    Object.values(layersRef.current.segLabels).forEach(m => map.removeLayer(m));
    layersRef.current.segs = {};
    layersRef.current.segLabels = {};

    D.segments.forEach(seg => {
      const a = nodeById[seg.from], b = nodeById[seg.to];
      if (!a || !b) return;
      let coords;
      if (seg.trail && D.trails[seg.trail]) {
        // For reversed segments, query overrides with the trail's TRUE endpoint order,
        // then reverse the result. This avoids visual disconnects when nodes are dragged.
        const trueFromId = seg.reverse ? seg.to : seg.from;
        const trueToId = seg.reverse ? seg.from : seg.to;
        coords = applyTrailOverrides(seg.trail, trueFromId, trueToId, overrides).slice();
        if (seg.reverse) coords.reverse();
      } else {
        coords = [effLngLat(seg.from), effLngLat(seg.to)];
      }
      const latlngs = coords.map(c => [c[1], c[0]]);
      const isActiveDay = activeDay !== "all" && activeDay != null && seg.day === activeDay;
      const isOtherDay = activeDay !== "all" && activeDay != null && seg.day !== activeDay;
      const isActive = activeSeg === seg.id || hoverSeg === seg.id;
      let color, weight, opacity, dashArray;
      if (seg.mode === "ferry") { color = "#4a8ab5"; weight = 3; opacity = 0.85; dashArray = "3 6"; }
      else { color = "#3a5c34"; weight = 4.5; opacity = 0.9; dashArray = null; }
      if (isActiveDay) { color = "#b04b2a"; weight = 5.5; opacity = 1; }
      if (isActive) { weight += 2; opacity = 1; }
      if (isOtherDay) { opacity = 0.25; weight = Math.max(2, weight - 1); }

      const poly = L.polyline(latlngs, { color, weight, opacity, dashArray }).addTo(map);
      poly.on("click", () => onSegClick(seg.id));
      poly.on("mouseover", () => onSegHover(seg.id));
      poly.on("mouseout", () => onSegHover(null));
      layersRef.current.segs[seg.id] = poly;

      // Distance labels
      const offsets = { "s1b": 0.5, "s2c": 0.55, "s3a": 0.4, "s3b": 0.5, "s3d": 0.55, "s4": 0.5 };
      if (seg.mode === "hike" && !seg.reverse && seg.distance > 0) {
        const off = offsets[seg.id] ?? 0.5;
        const idx = Math.max(0, Math.min(latlngs.length - 1, Math.floor(latlngs.length * off)));
        const mid = latlngs[idx];
        const icon = L.divIcon({
          html: `<div class="m-mile">${seg.distance} mi</div>`,
          className: "m-mile-icon", iconSize: [50, 18], iconAnchor: [25, 9],
        });
        layersRef.current.segLabels[seg.id] = L.marker(mid, { icon, interactive: false }).addTo(map);
      }
      if (seg.mode === "ferry") {
        const mid = latlngs[Math.floor(latlngs.length / 2)];
        const icon = L.divIcon({
          html: `<div class="m-ferry-label">⛴ catamaran</div>`,
          className: "m-mile-icon", iconSize: [80, 18], iconAnchor: [40, 9],
        });
        layersRef.current.segLabels[seg.id] = L.marker(mid, { icon, interactive: false }).addTo(map);
      }
    });
  }, [overrides, activeDay, activeSeg, hoverSeg]);

  // Build / rebuild nodes when overrides or edit mode change
  useEffectM(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(layersRef.current.nodes).forEach(m => map.removeLayer(m));
    layersRef.current.nodes = {};

    D.nodes.forEach(n => {
      const ll = effLngLat(n.id);
      if (!ll) return;
      const isCamp = n.type === "camp";
      const isViewpoint = n.type === "viewpoint";
      const isTown = n.type === "town";
      const isJunction = n.type === "junction";
      const isTransit = n.type === "transit";
      const isTrailhead = n.type === "trailhead";

      let html;
      const editBadge = editMode ? `<div class="m-edit-badge">drag</div>` : '';
      if (isCamp) {
        html = `<div class="m-camp ${editMode ? 'is-edit' : ''}">
          <div class="m-camp-pin"><span class="m-camp-num">${n.nights ? n.nights[0] : ''}</span></div>
          <div class="m-label m-label-camp">${n.label}</div>
          ${editBadge}
        </div>`;
      } else if (isViewpoint) {
        html = `<div class="m-vp ${editMode ? 'is-edit' : ''}">
          <div class="m-vp-mark">▲</div>
          <div class="m-label m-label-vp">${n.label}</div>
          ${editBadge}
        </div>`;
      } else if (isJunction) {
        html = `<div class="m-jn ${editMode ? 'is-edit' : ''}">
          <div class="m-jn-mark"></div>
          <div class="m-label m-label-jn">${n.label}</div>
          ${editBadge}
        </div>`;
      } else if (isTown) {
        html = `<div class="m-tn ${editMode ? 'is-edit' : ''}">
          <div class="m-tn-mark"></div>
          <div class="m-label m-label-tn">${n.label}</div>
          ${editBadge}
        </div>`;
      } else if (isTransit || isTrailhead) {
        const busTip = n.busLabel ? `<div class="m-bus-tip">🚌 ${n.busLabel}</div>` : '';
        html = `<div class="m-tr ${editMode ? 'is-edit' : ''}">
          <div class="m-tr-mark">🚌</div>
          <div class="m-label m-label-tr">${n.label}</div>
          ${busTip}
          ${editBadge}
        </div>`;
      }

      const icon = L.divIcon({
        html, className: "m-node-icon",
        iconSize: [180, 80],
        iconAnchor: [90, isCamp ? 38 : 30],
      });
      const m = L.marker([ll[1], ll[0]], {
        icon, riseOnHover: true,
        draggable: editMode,
      }).addTo(map);
      m.on("click", () => { if (!editMode) onNodeClick(n.id); });
      if (editMode) {
        m.on("dragend", (e) => {
          const ll2 = e.target.getLatLng();
          onNodeMove(n.id, [ll2.lng, ll2.lat]);
        });
      }
      layersRef.current.nodes[n.id] = m;
    });
  }, [overrides, editMode]);

  // Update node-active styling
  useEffectM(() => {
    Object.entries(layersRef.current.nodes).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      el.classList.toggle("m-node-active", id === activeNode);
      const usedInDay = activeDay !== "all" && activeDay != null
        ? D.segments.some(s => s.day === activeDay && (s.from === id || s.to === id))
        : true;
      el.style.opacity = usedInDay ? 1 : 0.3;
    });
  }, [activeDay, activeNode]);

  // Fit bounds on activeDay change
  useEffectM(() => {
    if (!mapRef.current) return;
    if (activeDay === "all" || activeDay == null) {
      const lats = D.nodes.map(n => effLngLat(n.id)[1]);
      const lngs = D.nodes.map(n => effLngLat(n.id)[0]);
      mapRef.current.fitBounds(
        [[Math.min(...lats) - 0.005, Math.min(...lngs) - 0.01], [Math.max(...lats) + 0.005, Math.max(...lngs) + 0.01]],
        { padding: [30, 30], animate: true }
      );
    } else {
      const segs = D.segments.filter(s => s.day === activeDay);
      const pts = [];
      segs.forEach(s => {
        const a = effLngLat(s.from), b = effLngLat(s.to);
        pts.push([a[1], a[0]]); pts.push([b[1], b[0]]);
      });
      if (pts.length) mapRef.current.fitBounds(pts, { padding: [60, 60], animate: true });
    }
  }, [activeDay]);

  // Walker
  useEffectM(() => {
    const map = mapRef.current;
    if (!map) return;
    if (layersRef.current.walker) { map.removeLayer(layersRef.current.walker); layersRef.current.walker = null; }
    if (walkProgress == null) return;
    const totalHours = D.segments.reduce((s, x) => s + x.hours, 0);
    let acc = 0;
    let target = walkProgress * totalHours;
    let pt = null;
    for (const seg of D.segments) {
      if (acc + seg.hours >= target) {
        const t = (target - acc) / seg.hours;
        const a = effLngLat(seg.from), b = effLngLat(seg.to);
        pt = [a[1] + (b[1] - a[1]) * t, a[0] + (b[0] - a[0]) * t];
        break;
      }
      acc += seg.hours;
    }
    if (pt) {
      const icon = L.divIcon({
        html: `<div class="m-walker"><span class="m-walker-pulse"></span><span class="m-walker-dot"></span></div>`,
        className: "m-walker-icon", iconSize: [24, 24], iconAnchor: [12, 12],
      });
      layersRef.current.walker = L.marker(pt, { icon, interactive: false }).addTo(map);
    }
  }, [walkProgress, overrides]);

  return (
    <div className="map">
      <div ref={mapElRef} className="leaflet-container-host"></div>
      {editMode && (
        <div className="edit-banner">
          <span className="edit-banner-dot"></span>
          <b>Edit mode</b> · drag any camp / viewpoint / bus stop to reposition. Trails stretch to follow.
        </div>
      )}
      <div className={`legend ${legendOpen ? '' : 'collapsed'}`}>
        <div className="legend-head" onClick={toggleLegend} title={legendOpen ? "Collapse key" : "Expand key"}>
          <span>Key</span>
          <span className="legend-toggle" aria-hidden="true">{legendOpen ? '–' : '+'}</span>
        </div>
        <div className="legend-body">
          <div className="legend-row"><span className="legend-camp"><span>1</span></span>Camp (numbered = night)</div>
          <div className="legend-row"><span className="legend-vp">▲</span>Viewpoint / mirador</div>
          <div className="legend-row"><span className="legend-jn"></span>Junction / pass-through</div>
          <div className="legend-row"><span className="legend-bus-icon">🚌</span>Bus stop (hover for info)</div>
          <div className="legend-row"><span className="legend-line legend-trail"></span>Hike</div>
          <div className="legend-row"><span className="legend-line legend-ferry"></span>Catamaran</div>
          <div className="legend-row"><span className="legend-mile">3.4 mi</span>Segment distance</div>
        </div>
      </div>
    </div>
  );
}

window.MapView = MapView;
