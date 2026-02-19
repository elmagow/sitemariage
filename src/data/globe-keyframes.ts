import type { EventId } from './events';

export interface GlobeKeyframe {
  center: [number, number];
  scale: number;
  markerHighlight: EventId | null;
}

export const globeKeyframes: GlobeKeyframe[] = [
  // Beat 1: Zoom into Paris area (Mairie)
  { center: [2.35, 48.86], scale: 1000, markerHighlight: 'mairie' },
  // Beat 2: Dezoom from Paris, show Europe
  { center: [10, 42], scale: 350, markerHighlight: null },
  // Beat 3: Travel across Mediterranean
  { center: [22, 38], scale: 300, markerHighlight: null },
  // Beat 4: Zoom into Tel Aviv area (Welcome Dinner)
  { center: [34.77, 32.06], scale: 1000, markerHighlight: 'welcome-dinner' },
  // Beat 5: Slight dezoom, coast view
  { center: [34.78, 32.12], scale: 600, markerHighlight: null },
  // Beat 6: Zoom into Herzliya (Beach Party)
  { center: [34.79, 32.16], scale: 1000, markerHighlight: 'beach-party' },
  // Beat 7: Slight dezoom
  { center: [34.75, 32.00], scale: 600, markerHighlight: null },
  // Beat 8: Zoom into Beit Hanan (Wedding Ceremony)
  { center: [34.73, 31.91], scale: 1000, markerHighlight: 'wedding-ceremony' },
];
