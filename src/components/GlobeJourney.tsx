import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import * as d3Geo from 'd3-geo';
import * as topojson from 'topojson-client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { $language } from '@/stores/language';
import { $activeEvent } from '@/stores/active-event';
import { t } from '@/i18n/translations';
import type { TranslationKey } from '@/i18n/translations';
import { events } from '@/data/events';
import type { EventId } from '@/data/events';
import { globeKeyframes } from '@/data/globe-keyframes';

import worldData from '@/assets/geo/world-50m.json';

import { StaticMapFallback } from './StaticMapFallback';

// ── Constants ──
const GLOBE_SIZE = 800;
const HALF = GLOBE_SIZE / 2;
const LERP_FACTOR = 0.12; // RAF smoothing (0 = frozen, 1 = instant)

// Hex values mirror CSS design tokens (--color-wedding-*) for imperative D3/SVG rendering
const COLORS = {
  ocean: '#E8DFD0',
  land: '#F0E6D3',
  landStroke: 'rgba(122, 139, 82, 0.3)',
  route: '#C1513A',
  markerFill: '#D4A853',
  markerStroke: '#C1513A',
  markerActiveFill: '#C1513A',
  markerActiveStroke: '#D4A853',
  graticule: 'rgba(122, 139, 82, 0.08)',
  labelBg: 'rgba(247, 240, 228, 0.92)',
} as const;

function getEventName(eventId: EventId, lang: 'fr' | 'he'): string {
  const ev = events.find((e) => e.id === eventId);
  if (!ev) return '';
  return t(`${ev.translationKey}.name` as TranslationKey, lang);
}

/**
 * Route segments with curved waypoints.
 * Israel legs arc inland (east) or offshore (west) to avoid visual overlap,
 * since the 3 Israel events are nearly collinear along the coast.
 */
const ROUTE_SEGMENTS: { points: [number, number][]; start: number; end: number }[] = [
  {
    // Paris → Neve Tsedek (great-circle across Mediterranean)
    points: [[2.2567, 48.8966], [34.7659, 32.0606]],
    start: 0, end: 0.33,
  },
  {
    // Neve Tsedek → Herzliya: arc inland (east) to separate from southbound route
    points: [[34.7659, 32.0606], [34.84, 32.08], [34.86, 32.13], [34.7875, 32.1629]],
    start: 0.33, end: 0.66,
  },
  {
    // Herzliya → Beit Hanan: arc offshore (west) to separate from northbound route
    points: [[34.7875, 32.1629], [34.73, 32.12], [34.69, 32.00], [34.7307, 31.9056]],
    start: 0.66, end: 1.0,
  },
];

/**
 * Return partial route coordinates based on routeProgress (0-1).
 * routeProgress is decoupled from scroll — it only advances during travel phases.
 * Uses ROUTE_SEGMENTS with curved waypoints to avoid overlapping lines in Israel.
 */
function getPartialRouteCoords(routeProgress: number): [number, number][] {
  if (routeProgress <= 0) return [];

  const result: [number, number][] = [];

  for (const seg of ROUTE_SEGMENTS) {
    if (routeProgress <= seg.start) break;

    if (routeProgress >= seg.end) {
      // Entire segment completed — add all points (skip first if we already have it)
      for (let i = result.length === 0 ? 0 : 1; i < seg.points.length; i++) {
        result.push(seg.points[i]);
      }
    } else {
      // Partially through this segment
      const segProgress = (routeProgress - seg.start) / (seg.end - seg.start);
      const totalSubLegs = seg.points.length - 1;
      const currentSubLeg = segProgress * totalSubLegs;
      const subLegIndex = Math.min(Math.floor(currentSubLeg), totalSubLegs - 1);
      const subLegFraction = currentSubLeg - subLegIndex;

      // Add completed sub-leg points
      for (let i = result.length === 0 ? 0 : 1; i <= subLegIndex; i++) {
        result.push(seg.points[i]);
      }

      // Interpolate tip
      if (subLegFraction > 0) {
        const a = seg.points[subLegIndex];
        const b = seg.points[subLegIndex + 1];
        const interp = d3Geo.geoInterpolate(a, b);
        result.push(interp(subLegFraction) as [number, number]);
      }
    }
  }

  return result;
}

/**
 * Get the emoji icon for the traveler based on current context.
 */
function getTravelerIcon(highlightId: EventId | null): string {
  switch (highlightId) {
    case 'mairie': return '\u{1F48D}';            // 💍
    case 'welcome-dinner': return '\u{1F37D}\uFE0F'; // 🍽️
    case 'beach-party': return '\u{1F3D6}\uFE0F';    // 🏖️
    case 'wedding-ceremony': return '\u{1F492}';      // 💒
    default: return '\u2708\uFE0F';                   // ✈️
  }
}

export function GlobeJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const projectionRef = useRef<d3Geo.GeoProjection | null>(null);
  const langRef = useRef<'fr' | 'he'>('fr');
  const lang = useStore($language);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Keep langRef in sync for D3 callbacks
  useEffect(() => {
    langRef.current = lang;
    if (svgRef.current) {
      const svg = svgRef.current;
      events.forEach((ev) => {
        const label = svg.querySelector(`[data-marker-label="${ev.id}"]`);
        if (label) {
          label.textContent = getEventName(ev.id, lang);
        }
        const marker = svg.querySelector(`[data-marker="${ev.id}"]`);
        if (marker) {
          marker.setAttribute('aria-label', getEventName(ev.id, lang));
        }
      });
    }
  }, [lang]);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Main D3 + GSAP effect ──
  useEffect(() => {
    if (prefersReduced) return;
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const svgNS = 'http://www.w3.org/2000/svg';

    function createEl(tag: string, attrs: Record<string, string> = {}): SVGElement {
      const el = document.createElementNS(svgNS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      return el;
    }

    // ── Create SVG ──
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.display = 'block';
    svg.style.maxWidth = `${GLOBE_SIZE}px`;
    svg.style.margin = '0 auto';
    container.appendChild(svg);
    svgRef.current = svg;

    // ── Projection ──
    const projection = d3Geo.geoOrthographic()
      .translate([HALF, HALF])
      .scale(globeKeyframes[0].scale)
      .rotate([-globeKeyframes[0].center[0], -globeKeyframes[0].center[1]])
      .clipAngle(90);
    projectionRef.current = projection;

    const pathGen = d3Geo.geoPath(projection);

    // ── TopoJSON → GeoJSON ──
    const topology = worldData as unknown as TopoJSON.Topology;
    const countriesGeo = topojson.feature(
      topology,
      topology.objects.countries as TopoJSON.GeometryCollection,
    );
    const landFeatures = 'features' in countriesGeo
      ? (countriesGeo as GeoJSON.FeatureCollection).features
      : [];

    // ── Drop shadow filter ──
    const defs = createEl('defs');
    defs.innerHTML = `<filter id="globe-shadow" x="-10%" y="-10%" width="120%" height="120%">
  <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
</filter>`;
    svg.appendChild(defs);

    // ── Ocean ──
    const oceanCircle = createEl('circle', {
      cx: String(HALF),
      cy: String(HALF),
      r: String(Math.min(projection.scale(), GLOBE_SIZE)),
      fill: COLORS.ocean,
      filter: 'url(#globe-shadow)',
    });
    svg.appendChild(oceanCircle);

    // ── Graticule ──
    const graticule = d3Geo.geoGraticule10();
    const graticulePath = createEl('path', {
      d: pathGen(graticule) || '',
      fill: 'none',
      stroke: COLORS.graticule,
      'stroke-width': '0.5',
    });
    svg.appendChild(graticulePath);

    // ── Land (create once, update d on scroll) ──
    const landGroup = createEl('g');
    svg.appendChild(landGroup);

    const landPathEls: SVGElement[] = [];
    for (const feature of landFeatures) {
      const p = createEl('path', {
        d: pathGen(feature) || '',
        fill: COLORS.land,
        stroke: COLORS.landStroke,
        'stroke-width': '0.5',
      });
      landGroup.appendChild(p);
      landPathEls.push(p);
    }

    function updateLandPaths() {
      for (let i = 0; i < landPathEls.length; i++) {
        landPathEls[i].setAttribute('d', pathGen(landFeatures[i]) || '');
      }
    }

    // ── Route line ──
    const routePath = createEl('path', {
      fill: 'none',
      stroke: COLORS.route,
      'stroke-width': '2.5',
      'stroke-dasharray': '8 6',
      'stroke-linecap': 'round',
    });
    svg.appendChild(routePath);

    function updateRoute(routeProgress: number) {
      const partialCoords = getPartialRouteCoords(routeProgress);
      if (partialCoords.length >= 2) {
        const geo: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: partialCoords },
        };
        routePath.setAttribute('d', pathGen(geo) || '');
      } else {
        routePath.setAttribute('d', '');
      }
    }
    updateRoute(0);

    // ── Stop markers ──
    const markersGroup = createEl('g');
    svg.appendChild(markersGroup);

    interface MarkerEls {
      group: SVGElement;
      dot: SVGElement;
      emoji: SVGElement;
      label: SVGElement;
      bgRect: SVGElement;
    }

    const markerEls: Record<string, MarkerEls> = {};

    events.forEach((ev) => {
      const g = createEl('g', {
        'data-marker': ev.id,
        cursor: 'pointer',
        'pointer-events': 'all',
        tabindex: '0',
        role: 'button',
        'aria-label': getEventName(ev.id, langRef.current),
      });

      // Outer ring (v1-style double-ring)
      const dot = createEl('circle', {
        r: '8',
        fill: COLORS.markerFill,
        stroke: COLORS.markerStroke,
        'stroke-width': '2.5',
      });

      // Label background (semi-transparent cream, like v1)
      const bgRect = createEl('rect', {
        rx: '4',
        ry: '4',
        fill: COLORS.labelBg,
        height: '22',
        y: '-11',
      });

      // Emoji
      const emoji = createEl('text', {
        dy: '5',
        'font-size': '16',
        'text-anchor': 'middle',
        'pointer-events': 'none',
      });
      emoji.textContent = ev.emoji;

      // Text label
      const label = createEl('text', {
        'data-marker-label': ev.id,
        dy: '5',
        fill: '#3D2314',
        'font-size': '13',
        'font-family': "'Playfair Display', Georgia, serif",
        'font-weight': '600',
        direction: 'ltr',
        'text-anchor': 'start',
        'pointer-events': 'none',
      });
      label.textContent = getEventName(ev.id, langRef.current);

      g.appendChild(dot);
      g.appendChild(bgRect);
      g.appendChild(emoji);
      g.appendChild(label);
      markersGroup.appendChild(g);

      markerEls[ev.id] = { group: g, dot, emoji, label, bgRect };

      g.addEventListener('click', () => $activeEvent.set(ev.id));
      g.addEventListener('keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' || ke.key === ' ') {
          ke.preventDefault();
          $activeEvent.set(ev.id);
        }
      });

      const enlargeMarker = () => {
        dot.setAttribute('stroke-width', '3.5');
        const r = parseFloat(dot.getAttribute('r') || '8');
        dot.setAttribute('r', String(r * 1.3));
      };
      const resetMarker = () => {
        dot.setAttribute('stroke-width', '2.5');
        // Restore appropriate radius — will be set by next updateMarkers call
      };

      g.addEventListener('mouseenter', enlargeMarker);
      g.addEventListener('focusin', enlargeMarker);
      g.addEventListener('mouseleave', resetMarker);
      g.addEventListener('focusout', resetMarker);
    });

    // ── Emoji traveler (follows route tip, v1-style) ──
    const travelerGroup = createEl('g', { 'pointer-events': 'none', display: 'none' });
    const travelerEmoji = createEl('text', {
      'text-anchor': 'middle',
      'font-size': '24',
      dy: '8',
    });
    travelerEmoji.textContent = '\u2708\uFE0F'; // ✈️
    travelerGroup.appendChild(travelerEmoji);
    svg.appendChild(travelerGroup);

    function updateMarkers(highlightId: EventId | null, currentScale: number) {
      // Scale range 390-15000: sizing tuned for wide zoom range
      const baseR = Math.max(4, Math.min(12, currentScale / 1200));
      const highlightR = baseR * 1.5;
      const baseFontSize = Math.max(10, Math.min(15, currentScale / 1000));
      const emojiFontSize = Math.max(14, Math.min(22, currentScale / 800));

      events.forEach((ev) => {
        const els = markerEls[ev.id];
        if (!els) return;

        const pos = projection(ev.coordinates);
        const dist = d3Geo.geoDistance(
          ev.coordinates,
          [-(projection.rotate()[0]), -(projection.rotate()[1])],
        );
        const visible = dist < Math.PI / 2;

        if (pos && visible) {
          const isHl = ev.id === highlightId;
          const r = isHl ? highlightR : baseR;
          const fs = isHl ? baseFontSize * 1.15 : baseFontSize;
          const efs = isHl ? emojiFontSize * 1.2 : emojiFontSize;

          els.group.setAttribute('transform', `translate(${pos[0]}, ${pos[1]})`);
          els.group.setAttribute('display', 'block');

          els.dot.setAttribute('r', String(r));
          els.dot.setAttribute('fill', isHl ? COLORS.markerActiveFill : COLORS.markerFill);
          els.dot.setAttribute('stroke', isHl ? COLORS.markerActiveStroke : COLORS.markerStroke);
          els.dot.setAttribute('stroke-width', isHl ? '3' : '2.5');

          // Position emoji above, label to the right
          const emojiOffset = -(r + efs * 0.6);
          els.emoji.setAttribute('y', String(emojiOffset));
          els.emoji.setAttribute('font-size', String(efs));

          const labelX = r + 8;
          els.label.setAttribute('x', String(labelX));
          els.label.setAttribute('font-size', String(fs));

          // Background rect behind label
          const textLen = (els.label.textContent || '').length * fs * 0.55;
          els.bgRect.setAttribute('x', String(labelX - 4));
          els.bgRect.setAttribute('width', String(textLen + 8));
          els.bgRect.setAttribute('height', String(fs + 8));
          els.bgRect.setAttribute('y', String(-(fs / 2 + 4)));
        } else {
          els.group.setAttribute('display', 'none');
        }
      });
    }

    function updateTraveler(routeProgress: number, highlightId: EventId | null, currentScale: number) {
      if (routeProgress <= 0) {
        travelerGroup.setAttribute('display', 'none');
        return;
      }

      // Get the tip coordinates
      const coords = getPartialRouteCoords(routeProgress);
      if (coords.length < 1) {
        travelerGroup.setAttribute('display', 'none');
        return;
      }

      const tipCoord = coords[coords.length - 1];
      const pos = projection(tipCoord);
      const dist = d3Geo.geoDistance(
        tipCoord,
        [-(projection.rotate()[0]), -(projection.rotate()[1])],
      );

      if (pos && dist < Math.PI / 2) {
        travelerGroup.setAttribute('transform', `translate(${pos[0]}, ${pos[1]})`);
        travelerGroup.setAttribute('display', 'block');

        // Change emoji based on context
        const icon = getTravelerIcon(highlightId);
        if (travelerEmoji.textContent !== icon) {
          travelerEmoji.textContent = icon;
        }

        // Scale emoji based on zoom (linear for 390-15000 range)
        const emojiSize = Math.max(18, Math.min(30, currentScale / 600));
        travelerEmoji.setAttribute('font-size', String(emojiSize));
      } else {
        travelerGroup.setAttribute('display', 'none');
      }
    }

    updateMarkers(globeKeyframes[0].markerHighlight, globeKeyframes[0].scale);

    // ── Keyframe interpolation (pure computation, no side effects) ──
    function interpolateKeyframes(progress: number) {
      const totalBeats = globeKeyframes.length - 1;
      const rawIndex = progress * totalBeats;
      const beatIndex = Math.min(Math.floor(rawIndex), totalBeats - 1);
      const beatProgress = rawIndex - beatIndex;

      const kfA = globeKeyframes[beatIndex];
      const kfB = globeKeyframes[Math.min(beatIndex + 1, totalBeats)];

      const lon = kfA.center[0] + (kfB.center[0] - kfA.center[0]) * beatProgress;
      const lat = kfA.center[1] + (kfB.center[1] - kfA.center[1]) * beatProgress;
      const scale = kfA.scale + (kfB.scale - kfA.scale) * beatProgress;
      const routeProgress = kfA.routeProgress + (kfB.routeProgress - kfA.routeProgress) * beatProgress;

      // Snap highlight to closer keyframe
      const highlight = beatProgress < 0.5
        ? kfA.markerHighlight
        : kfB.markerHighlight;

      return { lon, lat, scale, routeProgress, highlight };
    }

    // ── Render globe (applies smoothed values to DOM) ──
    function renderGlobe(lon: number, lat: number, scale: number, routeProgress: number, highlight: EventId | null) {
      projection.rotate([-lon, -lat]).scale(scale);

      // Ocean: clamp radius
      oceanCircle.setAttribute('r', String(Math.min(scale, GLOBE_SIZE)));

      // Redraw paths
      graticulePath.setAttribute('d', pathGen(graticule) || '');
      updateLandPaths();
      updateRoute(routeProgress);
      updateMarkers(highlight, scale);
      updateTraveler(routeProgress, highlight, scale);
    }

    // ── ScrollTrigger (sets target, RAF loop lerps toward it) ──
    // Created BEFORE initial render so pin-spacer DOM manipulation is complete
    let targetProgress = 0;
    let currentProgress = 0;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=600%',
      pin: true,
      scrub: true,
      onUpdate: (self) => { targetProgress = self.progress; },
    });
    triggerRef.current = trigger;

    // ── RAF lerp loop (decoupled from ScrollTrigger for smooth animation) ──
    let rafId: number;
    let firstFrame = true;

    function animate() {
      const delta = targetProgress - currentProgress;
      if (firstFrame || Math.abs(delta) > 0.0001) {
        firstFrame = false;

        // Snap when very close to target (prevents route from stopping short)
        if (Math.abs(delta) < 0.001) {
          currentProgress = targetProgress;
        } else {
          currentProgress += delta * LERP_FACTOR;
        }

        const { lon, lat, scale, routeProgress, highlight } = interpolateKeyframes(currentProgress);
        renderGlobe(lon, lat, scale, routeProgress, highlight);
      }

      rafId = requestAnimationFrame(animate);
    }

    // Start RAF loop (first frame renders immediately after ScrollTrigger DOM is settled)
    rafId = requestAnimationFrame(animate);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(rafId);
      trigger.kill();
      triggerRef.current = null;
      if (svg.parentNode) svg.parentNode.removeChild(svg);
      svgRef.current = null;
      projectionRef.current = null;
    };
  }, [prefersReduced]);

  if (prefersReduced) {
    return <StaticMapFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex items-center justify-center"
      style={{
        direction: 'ltr',
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(232, 184, 75, 0.06) 0%, transparent 60%)',
      }}
    />
  );
}
