import type { EventId } from './events';

/**
 * Each keyframe defines a camera state at a specific scroll progress point.
 * The animation interpolates linearly between adjacent keyframes.
 *
 * Flow: start zoomed out → zoom into France → dezoom → fly to Israel → zoom events
 *
 * Route line progress is decoupled: `routeProgress` controls how much of
 * the route is drawn (0 = none, 1 = full Paris->Beit Hanan).
 * The route only advances during travel phases (when routeProgress changes).
 *
 * Scale reference (800px viewBox, orthographic):
 *   visible diameter ~ (800 / scale) * 6371 * 2 km
 *   scale    250 -> ~40,800 km (hemisphere — Europe & Med visible)
 *   scale   3000 -> ~3,400 km  (France or Israel + surroundings)
 *   scale   8000 -> ~1,270 km  (tight on central Israel coast)
 */
export interface GlobeKeyframe {
  center: [number, number];        // [longitude, latitude]
  scale: number;                    // projection scale (higher = more zoomed)
  markerHighlight: EventId | null;
  routeProgress: number;            // 0-1, how much route is drawn
}

export const globeKeyframes: GlobeKeyframe[] = [
  // ── Start: zoomed out, Europe & Mediterranean visible ──
  { center: [18, 40], scale: 250, markerHighlight: null, routeProgress: 0 },

  // ── Zoom into France / Courbevoie ──
  { center: [2.2567, 48.8966], scale: 3000, markerHighlight: 'mairie', routeProgress: 0 },

  // ── Hold on Mairie ──
  { center: [2.2567, 48.8966], scale: 3000, markerHighlight: 'mairie', routeProgress: 0 },

  // ── Dezoom to Mediterranean ──
  { center: [18, 40], scale: 250, markerHighlight: null, routeProgress: 0 },

  // ── Line draws across to Israel ──
  { center: [34.77, 32.06], scale: 250, markerHighlight: null, routeProgress: 0.33 },

  // ── Zoom in on Welcome Dinner (Neve Tsedek) ──
  { center: [34.7659, 32.0606], scale: 8000, markerHighlight: 'welcome-dinner', routeProgress: 0.33 },

  // ── Hold on Welcome Dinner ──
  { center: [34.7659, 32.0606], scale: 8000, markerHighlight: 'welcome-dinner', routeProgress: 0.33 },

  // ── Dezoom (Israel coast) ──
  { center: [34.77, 32.10], scale: 3000, markerHighlight: null, routeProgress: 0.33 },

  // ── Line draws north to Herzliya ──
  { center: [34.79, 32.16], scale: 3000, markerHighlight: null, routeProgress: 0.66 },

  // ── Zoom in on Beach Party (Herzliya) ──
  { center: [34.7875, 32.1629], scale: 8000, markerHighlight: 'beach-party', routeProgress: 0.66 },

  // ── Hold on Beach Party ──
  { center: [34.7875, 32.1629], scale: 8000, markerHighlight: 'beach-party', routeProgress: 0.66 },

  // ── Dezoom ──
  { center: [34.75, 32.03], scale: 3000, markerHighlight: null, routeProgress: 0.66 },

  // ── Line draws south to Beit Hanan ──
  { center: [34.73, 31.91], scale: 3000, markerHighlight: null, routeProgress: 1.0 },

  // ── Zoom in on Wedding (Beit Hanan) ──
  { center: [34.7307, 31.9056], scale: 8000, markerHighlight: 'wedding-ceremony', routeProgress: 1.0 },

  // ── Hold on Wedding ──
  { center: [34.7307, 31.9056], scale: 8000, markerHighlight: 'wedding-ceremony', routeProgress: 1.0 },
];
