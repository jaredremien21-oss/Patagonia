/* global React, ReactDOM */
const { useState, useEffect, useMemo, useRef } = React;

const D = window.WTREK_DATA;

// build node lookup
const nodeById = Object.fromEntries(D.nodes.map(n => [n.id, n]));

// Build cumulative trail data for elevation profile
function buildElevation() {
  // Synthetic elevation curve along the W. Each segment contributes a sub-curve.
  // We'll generate points: for each segment, sample N points along it, with elevation
  // interpolated using the segment's gain/loss and starting altitude.
  const points = [];
  let cumDist = 0;
  let elev = 165; // welcome center start ~50m
  // start point
  points.push({ x: 0, elev, segId: null, day: 0, label: "Start" });

  D.segments.forEach(seg => {
    if (seg.mode !== "hike") {
      // transit — keep elevation but advance "virtual" distance slightly for visual continuity
      const virtual = 0.3;
      points.push({ x: cumDist + virtual, elev, segId: seg.id, day: seg.day, transit: true });
      cumDist += virtual;
      return;
    }
    const samples = 8;
    const startElev = elev;
    const endElev = startElev + seg.gain - seg.loss;
    // shape: if gain >> loss, monotonic up. if loss >> gain, monotonic down. otherwise hump.
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      let e;
      if (seg.gain > 100 && seg.loss < 100) {
        e = startElev + (endElev - startElev) * Math.pow(t, 0.85);
      } else if (seg.loss > 100 && seg.gain < 100) {
        e = startElev + (endElev - startElev) * Math.pow(t, 1.15);
      } else {
        // hump or trough: peak in middle
        const peak = startElev + seg.gain;
        const trough = Math.min(startElev, endElev) - 0;
        if (seg.gain > seg.loss) {
          // peak then descend
          e = i <= samples/2
            ? startElev + (peak - startElev) * (i/(samples/2))
            : peak + (endElev - peak) * ((i - samples/2)/(samples/2));
        } else {
          e = startElev + (endElev - startElev) * t;
        }
      }
      points.push({
        x: cumDist + seg.distance * t,
        elev: e,
        segId: seg.id,
        day: seg.day
      });
    }
    cumDist += seg.distance;
    elev = endElev;
  });
  return points;
}

const ELEV_POINTS = buildElevation();
const TOTAL_HIKE_DIST = ELEV_POINTS[ELEV_POINTS.length - 1].x;
const ELEV_MIN = Math.min(...ELEV_POINTS.map(p => p.elev));
const ELEV_MAX = Math.max(...ELEV_POINTS.map(p => p.elev));

// Day boundary x positions (in cumulative-distance units)
function getDayBoundaries() {
  const bounds = {};
  let cum = 0;
  D.segments.forEach(seg => {
    if (!bounds[seg.day]) bounds[seg.day] = { start: cum, end: cum };
    if (seg.mode === "hike") cum += seg.distance;
    else cum += 0.3;
    bounds[seg.day].end = cum;
  });
  return bounds;
}
const DAY_BOUNDS = getDayBoundaries();

// Load/save position overrides — lets the user drag camps to correct spots
function loadOverrides() {
  try { return JSON.parse(localStorage.getItem('wtrek-overrides-v2') || '{}'); }
  catch { return {}; }
}
function saveOverrides(o) {
  try { localStorage.setItem('wtrek-overrides-v2', JSON.stringify(o)); } catch {}
}
window.loadOverrides = loadOverrides;
window.saveOverrides = saveOverrides;

// Apply node-position overrides by stretching each trail's intermediate points
// proportionally between the new endpoints.
function applyTrailOverrides(trailKey, fromId, toId, overrides) {
  const original = D.trails[trailKey];
  if (!original) return null;
  const fromOverride = overrides.nodes?.[fromId];
  const toOverride = overrides.nodes?.[toId];
  const origFrom = nodeById[fromId].lngLat;
  const origTo = nodeById[toId].lngLat;
  const newFrom = fromOverride || origFrom;
  const newTo = toOverride || origTo;
  const dFrom = [newFrom[0] - origFrom[0], newFrom[1] - origFrom[1]];
  const dTo = [newTo[0] - origTo[0], newTo[1] - origTo[1]];
  if (Math.abs(dFrom[0]) < 1e-9 && Math.abs(dFrom[1]) < 1e-9 && Math.abs(dTo[0]) < 1e-9 && Math.abs(dTo[1]) < 1e-9) {
    return original;
  }
  const n = original.length;
  return original.map((pt, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    return [
      pt[0] + dFrom[0] * (1 - t) + dTo[0] * t,
      pt[1] + dFrom[1] * (1 - t) + dTo[1] * t
    ];
  });
}
window.applyTrailOverrides = applyTrailOverrides;
function getEffectiveLngLat(id, overrides) {
  return overrides.nodes?.[id] || nodeById[id].lngLat;
}
window.getEffectiveLngLat = getEffectiveLngLat;
