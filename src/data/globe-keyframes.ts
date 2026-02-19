import type { EventId } from './events';

export interface GlobeKeyframe {
  center: [number, number];
  scale: number;
  markerHighlight: EventId | null;
}

export const globeKeyframes: GlobeKeyframe[] = [
  // Beat 1: Zoom into Paris (Mairie)
  { center: [2.35, 48.86], scale: 2000, markerHighlight: 'mairie' },
  // Beat 2: Dezoom from Paris, route begins
  { center: [10, 42], scale: 400, markerHighlight: null },
  // Beat 3: Route across Mediterranean
  { center: [22, 38], scale: 350, markerHighlight: null },
  // Beat 4: Zoom into Tel Aviv (Welcome Dinner)
  { center: [34.77, 32.06], scale: 2000, markerHighlight: 'welcome-dinner' },
  // Beat 5: Dezoom, route to coast
  { center: [34.78, 32.12], scale: 800, markerHighlight: null },
  // Beat 6: Zoom into Herzliya (Beach Party)
  { center: [34.79, 32.16], scale: 2000, markerHighlight: 'beach-party' },
  // Beat 7: Dezoom, route south
  { center: [34.75, 32.00], scale: 800, markerHighlight: null },
  // Beat 8: Zoom into Beit Hanan (Wedding)
  { center: [34.73, 31.91], scale: 2000, markerHighlight: 'wedding-ceremony' },
];
