import type { EventId } from './events';

/**
 * Each keyframe defines a camera state at a specific scroll progress point.
 * The animation interpolates linearly between adjacent keyframes.
 *
 * Key principle: line drawing and camera movement happen SIMULTANEOUSLY.
 * routeProgress changes in the SAME beats where the camera moves,
 * not in separate sequential beats.
 *
 * Flow: globe fills screen → zoom France → dezoom+line to Israel → zoom events
 *
 * Scale reference (800px viewBox, orthographic):
 *   visible diameter ~ (800 / scale) * 6371 * 2 km
 *   scale    390 -> ~26,200 km (globe fills viewport, Med centered)
 *   scale    500 -> ~20,400 km (dezoom, France+Israel visible)
 *   scale   3000 -> ~3,400 km  (France zoom)
 *   scale   6000 -> ~1,700 km  (Israel coast overview)
 *   scale  15000 -> ~680 km    (Israel event zoom, cities distinguishable)
 */
export interface GlobeKeyframe {
  center: [number, number];        // [longitude, latitude]
  scale: number;                    // projection scale (higher = more zoomed)
  markerHighlight: EventId | null;
  routeProgress: number;            // 0-1, how much route is drawn
}

export const globeKeyframes: GlobeKeyframe[] = [
  // ── PHASE 1: Globe fills screen, zoom to France ──

  // Globe visible, Mediterranean centered, fills viewport
  { center: [15, 38], scale: 390, markerHighlight: null, routeProgress: 0 },

  // Zoom into France / Courbevoie
  { center: [2.2567, 48.8966], scale: 3000, markerHighlight: 'mairie', routeProgress: 0 },

  // Hold on Mairie
  { center: [2.2567, 48.8966], scale: 3000, markerHighlight: 'mairie', routeProgress: 0 },

  // ── PHASE 2: Dezoom + line draws SIMULTANEOUSLY to Israel ──

  // Dezoom + line starts drawing (halfway across Mediterranean)
  // Center shifts toward midpoint, zoom pulls back, line at ~15% drawn
  { center: [18, 40], scale: 500, markerHighlight: null, routeProgress: 0.15 },

  // Continue: line halfway across Med, start zooming toward Israel
  { center: [26, 36], scale: 600, markerHighlight: null, routeProgress: 0.25 },

  // Approaching Israel: zooming in, line nearly there
  { center: [33, 33], scale: 2000, markerHighlight: null, routeProgress: 0.32 },

  // Arrive: zoomed in on Neve Tsedek, line completes leg 1
  { center: [34.7659, 32.0606], scale: 15000, markerHighlight: 'welcome-dinner', routeProgress: 0.33 },

  // Hold on Welcome Dinner
  { center: [34.7659, 32.0606], scale: 15000, markerHighlight: 'welcome-dinner', routeProgress: 0.33 },

  // ── PHASE 3: Dezoom + line to Herzliya (simultaneously) ──

  // Dezoom to Israel coast, line starts drawing north
  { center: [34.77, 32.10], scale: 6000, markerHighlight: null, routeProgress: 0.50 },

  // Zoom back in on Herzliya, line completes leg 2
  { center: [34.7875, 32.1629], scale: 15000, markerHighlight: 'beach-party', routeProgress: 0.66 },

  // Hold on Beach Party
  { center: [34.7875, 32.1629], scale: 15000, markerHighlight: 'beach-party', routeProgress: 0.66 },

  // ── PHASE 4: Dezoom + line to Beit Hanan (simultaneously) ──

  // Dezoom to Israel coast, line starts drawing south
  { center: [34.75, 32.00], scale: 6000, markerHighlight: null, routeProgress: 0.83 },

  // Zoom in on Beit Hanan, line completes
  { center: [34.7307, 31.9056], scale: 15000, markerHighlight: 'wedding-ceremony', routeProgress: 1.0 },

  // Hold on Wedding (final)
  { center: [34.7307, 31.9056], scale: 15000, markerHighlight: 'wedding-ceremony', routeProgress: 1.0 },
];
