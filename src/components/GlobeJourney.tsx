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
} as const;

function getEventName(eventId: EventId, lang: 'fr' | 'he'): string {
  const ev = events.find((e) => e.id === eventId);
  if (!ev) return '';
  return t(`${ev.translationKey}.name` as TranslationKey, lang);
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
    // Update marker labels when language changes
    if (svgRef.current) {
      const svg = svgRef.current;
      events.forEach((ev) => {
        const label = svg.querySelector(`[data-marker-label="${ev.id}"]`);
        if (label) {
          label.textContent = `${ev.emoji} ${getEventName(ev.id, lang)}`;
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

    // ── Create SVG ──
    const svgNS = 'http://www.w3.org/2000/svg';
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
      .translate([GLOBE_SIZE / 2, GLOBE_SIZE / 2])
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

    // ── Helper: create SVG element ──
    function createSVGEl(tag: string, attrs: Record<string, string> = {}): SVGElement {
      const el = document.createElementNS(svgNS, tag);
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
      }
      return el;
    }

    // ── Globe background (ocean) ──
    const oceanCircle = createSVGEl('circle', {
      cx: String(GLOBE_SIZE / 2),
      cy: String(GLOBE_SIZE / 2),
      r: String(projection.scale()),
      fill: COLORS.ocean,
    });
    svg.appendChild(oceanCircle);

    // ── Graticule ──
    const graticule = d3Geo.geoGraticule10();
    const graticulePath = createSVGEl('path', {
      d: pathGen(graticule) || '',
      fill: 'none',
      stroke: COLORS.graticule,
      'stroke-width': '0.5',
    });
    svg.appendChild(graticulePath);

    // ── Land masses ──
    const landGroup = createSVGEl('g');
    svg.appendChild(landGroup);

    function drawLand() {
      // Clear existing land paths
      while (landGroup.firstChild) {
        landGroup.removeChild(landGroup.firstChild);
      }

      if ('features' in countriesGeo) {
        for (const feature of (countriesGeo as GeoJSON.FeatureCollection).features) {
          const d = pathGen(feature);
          if (d) {
            const p = createSVGEl('path', {
              d,
              fill: COLORS.land,
              stroke: COLORS.landStroke,
              'stroke-width': '0.5',
            });
            landGroup.appendChild(p);
          }
        }
      }
    }

    drawLand();

    // ── Route line (great circle arcs between events) ──
    const routeCoords: [number, number][] = events.map((e) => e.coordinates);
    const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeCoords,
      },
    };

    const routePath = createSVGEl('path', {
      fill: 'none',
      stroke: COLORS.route,
      'stroke-width': '2.5',
      'stroke-dasharray': '8 6',
      'stroke-linecap': 'round',
    });
    svg.appendChild(routePath);

    // We'll track route dash offset for draw-on animation
    let routeTotalLength = 0;

    function updateRoute() {
      const d = pathGen(routeGeoJSON);
      if (d) {
        routePath.setAttribute('d', d);
        // Measure length for dash animation
        routeTotalLength = (routePath as unknown as SVGPathElement).getTotalLength?.() || 0;
      } else {
        routePath.setAttribute('d', '');
      }
    }

    updateRoute();
    // Initialize: route hidden
    if (routeTotalLength > 0) {
      routePath.style.strokeDasharray = `${routeTotalLength}`;
      routePath.style.strokeDashoffset = `${routeTotalLength}`;
    }

    // ── Stop markers ──
    const markersGroup = createSVGEl('g');
    svg.appendChild(markersGroup);

    interface MarkerEls {
      group: SVGElement;
      circle: SVGElement;
      label: SVGElement;
    }

    const markerEls: Record<string, MarkerEls> = {};

    events.forEach((ev) => {
      const g = createSVGEl('g', {
        'data-marker': ev.id,
        cursor: 'pointer',
        'pointer-events': 'all',
      });

      const circle = createSVGEl('circle', {
        r: '8',
        fill: COLORS.markerFill,
        stroke: COLORS.markerStroke,
        'stroke-width': '2',
      });

      const label = createSVGEl('text', {
        'data-marker-label': ev.id,
        dx: '14',
        dy: '4',
        fill: COLORS.route,
        'font-size': '14',
        'font-family': "'DM Sans', system-ui, sans-serif",
        'font-weight': '500',
        direction: 'ltr',
        'text-anchor': 'start',
        'pointer-events': 'none',
      });
      label.textContent = `${ev.emoji} ${getEventName(ev.id, langRef.current)}`;

      g.appendChild(circle);
      g.appendChild(label);
      markersGroup.appendChild(g);

      markerEls[ev.id] = { group: g, circle, label };

      // D3-style click handler (not React synthetic)
      g.addEventListener('click', () => {
        $activeEvent.set(ev.id);
      });

      // Hover effect
      g.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '11');
        circle.setAttribute('fill', COLORS.markerActiveFill);
        circle.setAttribute('stroke', COLORS.markerActiveStroke);
      });
      g.addEventListener('mouseleave', () => {
        const isActive = globeKeyframes.some(
          (kf) => kf.markerHighlight === ev.id,
        );
        if (!isActive) {
          circle.setAttribute('r', '8');
          circle.setAttribute('fill', COLORS.markerFill);
          circle.setAttribute('stroke', COLORS.markerStroke);
        }
      });
    });

    function updateMarkers(highlightId: EventId | null) {
      events.forEach((ev) => {
        const els = markerEls[ev.id];
        if (!els) return;

        const pos = projection(ev.coordinates);
        // Check if point is on the visible hemisphere
        const dist = d3Geo.geoDistance(
          ev.coordinates,
          [-(projection.rotate()[0]), -(projection.rotate()[1])],
        );
        const visible = dist < Math.PI / 2;

        if (pos && visible) {
          els.group.setAttribute('transform', `translate(${pos[0]}, ${pos[1]})`);
          els.group.setAttribute('display', 'block');

          const isHighlighted = ev.id === highlightId;
          els.circle.setAttribute('r', isHighlighted ? '12' : '8');
          els.circle.setAttribute(
            'fill',
            isHighlighted ? COLORS.markerActiveFill : COLORS.markerFill,
          );
          els.circle.setAttribute(
            'stroke',
            isHighlighted ? COLORS.markerActiveStroke : COLORS.markerStroke,
          );
          els.circle.setAttribute('stroke-width', isHighlighted ? '3' : '2');
          els.label.setAttribute('font-size', isHighlighted ? '16' : '14');
          els.label.setAttribute('font-weight', isHighlighted ? '600' : '500');
        } else {
          els.group.setAttribute('display', 'none');
        }
      });
    }

    updateMarkers(globeKeyframes[0].markerHighlight);

    // ── Update globe function (called by ScrollTrigger) ──
    function updateGlobe(progress: number) {
      const totalBeats = globeKeyframes.length - 1;
      const rawIndex = progress * totalBeats;
      const beatIndex = Math.min(Math.floor(rawIndex), totalBeats - 1);
      const beatProgress = rawIndex - beatIndex;

      const kfA = globeKeyframes[beatIndex];
      const kfB = globeKeyframes[Math.min(beatIndex + 1, totalBeats)];

      // Interpolate center
      const lon = kfA.center[0] + (kfB.center[0] - kfA.center[0]) * beatProgress;
      const lat = kfA.center[1] + (kfB.center[1] - kfA.center[1]) * beatProgress;

      // Interpolate scale
      const scale = kfA.scale + (kfB.scale - kfA.scale) * beatProgress;

      // Update projection
      projection.rotate([-lon, -lat]).scale(scale);

      // Update ocean circle radius
      oceanCircle.setAttribute('r', String(scale));

      // Redraw graticule
      const newGraticuleD = pathGen(graticule);
      graticulePath.setAttribute('d', newGraticuleD || '');

      // Redraw land
      drawLand();

      // Update route
      updateRoute();

      // Animate route draw-on based on progress
      if (routeTotalLength > 0) {
        const currentLength = (routePath as unknown as SVGPathElement).getTotalLength?.() || routeTotalLength;
        routePath.style.strokeDasharray = `${currentLength}`;
        routePath.style.strokeDashoffset = `${currentLength * (1 - progress)}`;
      }

      // Determine which marker to highlight
      // Use the closer keyframe's highlight
      const currentHighlight = beatProgress < 0.5
        ? kfA.markerHighlight
        : kfB.markerHighlight;
      updateMarkers(currentHighlight);
    }

    // ── ScrollTrigger ──
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=400%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        updateGlobe(self.progress);
      },
    });
    triggerRef.current = trigger;

    // ── Cleanup ──
    return () => {
      trigger.kill();
      triggerRef.current = null;
      if (svg.parentNode) {
        svg.parentNode.removeChild(svg);
      }
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
      style={{ direction: 'ltr' }}
    />
  );
}
