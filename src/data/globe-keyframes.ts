import type { EventId } from './events';

export interface GlobeKeyframe {
  center: [number, number];
  scale: number;
  markerHighlight: EventId | null;
}

export const globeKeyframes: GlobeKeyframe[] = [
  // Beat 1: Start zoomed out, showing Europe & Mediterranean
  { center: [15, 42], scale: 250, markerHighlight: null },
  // Beat 2: Zoom into Paris (Mairie)
  { center: [2.35, 48.86], scale: 1200, markerHighlight: 'mairie' },
  // Beat 3: Dezoom, begin journey across Mediterranean
  { center: [18, 40], scale: 300, markerHighlight: null },
  // Beat 4: Zoom into Tel Aviv area (Welcome Dinner, Neve Tsedek)
  { center: [34.77, 32.06], scale: 2500, markerHighlight: 'welcome-dinner' },
  // Beat 5: Slight dezoom to show coast, travel north
  { center: [34.78, 32.10], scale: 1800, markerHighlight: null },
  // Beat 6: Zoom into Herzliya Marina (Beach Party)
  { center: [34.79, 32.16], scale: 2500, markerHighlight: 'beach-party' },
  // Beat 7: Slight dezoom, travel south
  { center: [34.75, 32.00], scale: 1800, markerHighlight: null },
  // Beat 8: Zoom into Beit Hanan (Wedding Ceremony)
  { center: [34.73, 31.91], scale: 2500, markerHighlight: 'wedding-ceremony' },
];
