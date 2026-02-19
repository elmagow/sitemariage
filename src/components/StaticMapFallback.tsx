import { useEffect, useRef, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import * as d3Geo from 'd3-geo';
import * as topojson from 'topojson-client';

import { $language } from '@/stores/language';
import { $activeEvent } from '@/stores/active-event';
import { t } from '@/i18n/translations';
import type { TranslationKey } from '@/i18n/translations';
import { events } from '@/data/events';
import type { EventId } from '@/data/events';

import worldData from '@/assets/geo/world-110m.json';

// ── Constants ──
const MAP_WIDTH = 900;
const MAP_HEIGHT = 500;
// Hex values mirror CSS design tokens (--color-wedding-*) for imperative D3/SVG rendering
const COLORS = {
  ocean: '#EDE5D4',
  land: '#F5ECD7',
  landStroke: 'rgba(107, 124, 69, 0.35)',
  route: '#C1513A',
  markerFill: '#E8B84B',
  markerStroke: '#C1513A',
} as const;

// Focus on Mediterranean region: France → Israel
// Center roughly on the Mediterranean, clipping to show both France and Israel
const CENTER: [number, number] = [20, 38];
const SCALE = 650;

function getEventName(eventId: EventId, lang: 'fr' | 'he'): string {
  const ev = events.find((e) => e.id === eventId);
  if (!ev) return '';
  return t(`${ev.translationKey}.name` as TranslationKey, lang);
}

export function StaticMapFallback() {
  const lang = useStore($language);
  const svgRef = useRef<HTMLDivElement>(null);
  const svgElRef = useRef<SVGSVGElement | null>(null);

  // Build static projection
  const projection = useMemo(() => {
    return d3Geo.geoNaturalEarth1()
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
      .scale(SCALE)
      .center(CENTER);
  }, []);

  // Compute marker positions
  const markerPositions = useMemo(() => {
    return events.map((ev) => {
      const pos = projection(ev.coordinates);
      return {
        id: ev.id,
        emoji: ev.emoji,
        x: pos ? pos[0] : 0,
        y: pos ? pos[1] : 0,
        visible: pos !== null,
      };
    });
  }, [projection]);

  // Render static SVG map via D3
  useEffect(() => {
    if (!svgRef.current) return;
    const container = svgRef.current;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.display = 'block';
    svg.style.maxWidth = `${MAP_WIDTH}px`;
    svg.style.margin = '0 auto';
    container.appendChild(svg);
    svgElRef.current = svg;

    const pathGen = d3Geo.geoPath(projection);

    // Parse TopoJSON
    const topology = worldData as unknown as TopoJSON.Topology;
    const countriesGeo = topojson.feature(
      topology,
      topology.objects.countries as TopoJSON.GeometryCollection,
    );

    function createSVGEl(tag: string, attrs: Record<string, string> = {}): SVGElement {
      const el = document.createElementNS(svgNS, tag);
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v);
      }
      return el;
    }

    // Ocean background
    const bg = createSVGEl('rect', {
      x: '0',
      y: '0',
      width: String(MAP_WIDTH),
      height: String(MAP_HEIGHT),
      fill: COLORS.ocean,
      rx: '12',
    });
    svg.appendChild(bg);

    // Land masses
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
          svg.appendChild(p);
        }
      }
    }

    // Route line — fully drawn, no animation
    const routeCoords: [number, number][] = events.map((e) => e.coordinates);
    const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeCoords,
      },
    };

    const routeD = pathGen(routeGeoJSON);
    if (routeD) {
      const routePath = createSVGEl('path', {
        d: routeD,
        fill: 'none',
        stroke: COLORS.route,
        'stroke-width': '2.5',
        'stroke-dasharray': '8 6',
        'stroke-linecap': 'round',
      });
      svg.appendChild(routePath);
    }

    // Marker dots (decorative, in SVG)
    markerPositions.forEach((m) => {
      if (!m.visible) return;
      const circle = createSVGEl('circle', {
        cx: String(m.x),
        cy: String(m.y),
        r: '7',
        fill: COLORS.markerFill,
        stroke: COLORS.markerStroke,
        'stroke-width': '2',
      });
      svg.appendChild(circle);
    });

    return () => {
      if (svg.parentNode) {
        svg.parentNode.removeChild(svg);
      }
      svgElRef.current = null;
    };
  }, [projection, markerPositions]);

  return (
    <div
      className="relative w-full py-12 px-4"
      style={{ direction: 'ltr' }}
      aria-label={t('globe.static_aria_label', lang)}
      role="region"
    >
      {/* D3 renders the SVG map into this container */}
      <div ref={svgRef} className="w-full max-w-4xl mx-auto" />

      {/* HTML buttons overlaid on marker positions for accessibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ maxWidth: `${MAP_WIDTH}px`, margin: '0 auto' }}
      >
        <div className="relative w-full" style={{ paddingTop: `${(MAP_HEIGHT / MAP_WIDTH) * 100}%` }}>
          {markerPositions.map((m) => {
            if (!m.visible) return null;
            const leftPct = (m.x / MAP_WIDTH) * 100;
            const topPct = (m.y / MAP_HEIGHT) * 100;
            const name = getEventName(m.id, lang);

            return (
              <button
                key={m.id}
                type="button"
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-wedding-accent2/90 border-2 border-wedding-primary px-2.5 py-1 text-xs font-body font-medium text-wedding-dark shadow-md hover:scale-110 hover:bg-wedding-accent2 focus-visible:ring-2 focus-visible:ring-wedding-primary focus-visible:outline-none transition-transform"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                }}
                aria-label={`${m.emoji} ${name}`}
                onClick={() => $activeEvent.set(m.id)}
              >
                <span aria-hidden="true">{m.emoji}</span>{' '}
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
