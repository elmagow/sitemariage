import type { EventId } from './events';

/**
 * Each keyframe defines a camera state at a specific scroll progress point.
 * The animation interpolates linearly between adjacent keyframes.
 *
 * Flow per event:
 *   zoom-in on event → hold → dezoom → line draws during travel → next event
 *
 * Route line progress is decoupled: `routeProgress` controls how much of
 * the route is drawn (0 = none, 1 = full Paris→Beit Hanan).
 * The route only advances during travel phases (when routeProgress changes).
 */
export interface GlobeKeyframe {
  center: [number, number];        // [longitude, latitude]
  scale: number;                    // projection scale (higher = more zoomed)
  markerHighlight: EventId | null;
  routeProgress: number;            // 0-1, how much route is drawn
}

// Event-level zoom: 4000+ = very tight neighborhood-level on 800px viewBox
// Israel dezoom: 2000 = shows ~50km radius (enough to see coast + inland)
// Mediterranean overview: 300 = shows full journey context

export const globeKeyframes: GlobeKeyframe[] = [
  // ── BEAT 1: Zoom in on Mairie de Courbevoie (no line yet) ──
  { center: [2.2567, 48.8966], scale: 4000, markerHighlight: 'mairie', routeProgress: 0 },

  // ── BEAT 2: Hold on Mairie ──
  { center: [2.2567, 48.8966], scale: 4000, markerHighlight: 'mairie', routeProgress: 0 },

  // ── BEAT 3: Dezoom to show Europe/Mediterranean ──
  { center: [18, 40], scale: 300, markerHighlight: null, routeProgress: 0 },

  // ── BEAT 4: Line draws across Mediterranean → arrive at Tel Aviv ──
  { center: [34.77, 32.06], scale: 300, markerHighlight: null, routeProgress: 0.33 },

  // ── BEAT 5: Zoom in tight on Welcome Dinner (Neve Tsedek) ──
  { center: [34.7659, 32.0606], scale: 4000, markerHighlight: 'welcome-dinner', routeProgress: 0.33 },

  // ── BEAT 6: Hold on Welcome Dinner ──
  { center: [34.7659, 32.0606], scale: 4000, markerHighlight: 'welcome-dinner', routeProgress: 0.33 },

  // ── BEAT 7: Dezoom slightly (Israel coast view) ──
  { center: [34.77, 32.10], scale: 2000, markerHighlight: null, routeProgress: 0.33 },

  // ── BEAT 8: Line draws north to Herzliya ──
  { center: [34.79, 32.16], scale: 2000, markerHighlight: null, routeProgress: 0.66 },

  // ── BEAT 9: Zoom in tight on Beach Party (Herzliya Marina) ──
  { center: [34.7875, 32.1629], scale: 4000, markerHighlight: 'beach-party', routeProgress: 0.66 },

  // ── BEAT 10: Hold on Beach Party ──
  { center: [34.7875, 32.1629], scale: 4000, markerHighlight: 'beach-party', routeProgress: 0.66 },

  // ── BEAT 11: Dezoom slightly ──
  { center: [34.75, 32.03], scale: 2000, markerHighlight: null, routeProgress: 0.66 },

  // ── BEAT 12: Line draws south to Beit Hanan ──
  { center: [34.73, 31.91], scale: 2000, markerHighlight: null, routeProgress: 1.0 },

  // ── BEAT 13: Zoom in tight on Wedding (Achuza, Beit Hanan) ──
  { center: [34.7307, 31.9056], scale: 4000, markerHighlight: 'wedding-ceremony', routeProgress: 1.0 },

  // ── BEAT 14: Hold on Wedding (final) ──
  { center: [34.7307, 31.9056], scale: 4000, markerHighlight: 'wedding-ceremony', routeProgress: 1.0 },
];
