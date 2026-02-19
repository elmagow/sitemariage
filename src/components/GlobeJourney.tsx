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

import worldData from '@/assets/geo/world-110m.json';

import { StaticMapFallback } from './StaticMapFallback';

// ── Constants ──
const GLOBE_SIZE = 800;
const HALF = GLOBE_SIZE / 2;

// Hex values mirror CSS design tokens (--color-wedding-*) for imperative D3/SVG rendering
const COLORS = {
  ocean: '#EDE5D4',
  land: '#F5ECD7',
  landStroke: 'rgba(107, 124, 69, 0.3)',
  route: '#C1513A',
  markerFill: '#E8B84B',
  markerStroke: '#C1513A',
  markerActiveFill: '#C1513A',
  markerActiveStroke: '#E8B84B',
  graticule: 'rgba(107, 124, 69, 0.08)',
  labelBg: 'rgba(250, 243, 232, 0.92)',
} as const;

function getEventName(eventId: EventId, lang: 'fr' | 'he'): string {
  const ev = events.find((e) => e.id === eventId);
  if (!ev) return '';
  return t(`${ev.translationKey}.name` as TranslationKey, lang);
}

/**
 * Return partial route coordinates based on routeProgress (0-1).
 * routeProgress is decoupled from scroll — it only advances during travel phases.
 */
function getPartialRouteCoords(routeProgress: number): [number, number][] {
  if (routeProgress <= 0) return [];

  const coords = events.map((e) => e.coordinates);
  const totalLegs = coords.length - 1; // 3 legs
  const currentLeg = routeProgress * totalLegs;
  const legIndex = Math.min(Math.floor(currentLeg), totalLegs - 1);
  const legFraction = currentLeg - legIndex;

  const result: [number, number][] = [];
  for (let i = 0; i <= legIndex; i++) {
    result.push(coords[i]);
  }

  // Interpolated tip of the line
  if (legFraction > 0 && legIndex < totalLegs) {
    const a = coords[legIndex];
    const b = coords[legIndex + 1];
    // Use d3 geoInterpolate for accurate great-circle interpolation
    const interp = d3Geo.geoInterpolate(a, b);
    const pt = interp(legFraction);
    result.push(pt as [number, number]);
  }

  return result;
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

      g.addEventListener('mouseenter', () => {
        dot.setAttribute('stroke-width', '3.5');
        const r = parseFloat(dot.getAttribute('r') || '8');
        dot.setAttribute('r', String(r * 1.3));
      });
      g.addEventListener('mouseleave', () => {
        dot.setAttribute('stroke-width', '2.5');
        // Restore appropriate radius — will be set by next updateMarkers call
      });
    });

    function updateMarkers(highlightId: EventId | null, currentScale: number) {
      // Marker sizing: at scale 4000 we want r≈10, at scale 300 we want r≈5
      const baseR = Math.max(5, Math.min(12, currentScale / 350));
      const highlightR = baseR * 1.4;
      const baseFontSize = Math.max(11, Math.min(15, currentScale / 300));
      const emojiFontSize = Math.max(14, Math.min(22, currentScale / 200));

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

    updateMarkers(globeKeyframes[0].markerHighlight, globeKeyframes[0].scale);

    // ── Update globe (called by ScrollTrigger) ──
    function updateGlobe(progress: number) {
      const totalBeats = globeKeyframes.length - 1;
      const rawIndex = progress * totalBeats;
      const beatIndex = Math.min(Math.floor(rawIndex), totalBeats - 1);
      const beatProgress = rawIndex - beatIndex;

      const kfA = globeKeyframes[beatIndex];
      const kfB = globeKeyframes[Math.min(beatIndex + 1, totalBeats)];

      // Interpolate camera
      const lon = kfA.center[0] + (kfB.center[0] - kfA.center[0]) * beatProgress;
      const lat = kfA.center[1] + (kfB.center[1] - kfA.center[1]) * beatProgress;
      const scale = kfA.scale + (kfB.scale - kfA.scale) * beatProgress;

      // Interpolate route progress (decoupled from camera)
      const routeProgress = kfA.routeProgress + (kfB.routeProgress - kfA.routeProgress) * beatProgress;

      projection.rotate([-lon, -lat]).scale(scale);

      // Ocean: clamp radius
      oceanCircle.setAttribute('r', String(Math.min(scale, GLOBE_SIZE)));

      // Redraw paths
      graticulePath.setAttribute('d', pathGen(graticule) || '');
      updateLandPaths();
      updateRoute(routeProgress);

      // Marker highlight: snap to closer keyframe
      const currentHighlight = beatProgress < 0.5
        ? kfA.markerHighlight
        : kfB.markerHighlight;
      updateMarkers(currentHighlight, scale);
    }

    // ── ScrollTrigger ──
    // More scroll distance (600%) because we have 14 beats now
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=600%',
      pin: true,
      scrub: true,
      onUpdate: (self) => updateGlobe(self.progress),
    });
    triggerRef.current = trigger;

    // ── Cleanup ──
    return () => {
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
