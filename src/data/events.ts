export type EventId = 'mairie' | 'welcome-dinner' | 'beach-party' | 'wedding-ceremony';

export interface WeddingEvent {
  id: EventId;
  emoji: string;
  date: string;
  time: string | null;
  location: {
    name: string;
    address: string;
    city: string;
  };
  coordinates: [number, number];
  translationKey: string;
}

export const events: WeddingEvent[] = [
  {
    id: 'mairie',
    emoji: '🏛️',
    date: '2026-10-18',
    time: null,
    location: { name: 'Mairie du 4e', address: '2 place Baudoyer', city: 'Paris' },
    coordinates: [2.3522, 48.8566],
    translationKey: 'event.mairie',
  },
  {
    id: 'welcome-dinner',
    emoji: '🍽️',
    date: '2026-10-18',
    time: null,
    location: { name: 'Neve Tsedek', address: 'Neve Tsedek', city: 'Tel Aviv' },
    coordinates: [34.7659, 32.0606],
    translationKey: 'event.welcome_dinner',
  },
  {
    id: 'beach-party',
    emoji: '🏖️',
    date: '2026-10-19',
    time: null,
    location: { name: 'Herzliya Marina', address: 'Herzliya Marina', city: 'Herzliya' },
    coordinates: [34.7875, 32.1629],
    translationKey: 'event.beach_party',
  },
  {
    id: 'wedding-ceremony',
    emoji: '💒',
    date: '2026-10-20',
    time: null,
    location: { name: 'Achuza', address: 'Beit Hanan', city: 'Beit Hanan' },
    coordinates: [34.7307, 31.9056],
    translationKey: 'event.wedding_ceremony',
  },
];

export function getEventById(id: EventId): WeddingEvent | undefined {
  return events.find((e) => e.id === id);
}
