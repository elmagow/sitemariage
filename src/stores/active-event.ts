import { atom } from 'nanostores';

export type EventId = 'mairie' | 'welcome-dinner' | 'beach-party' | 'wedding-ceremony';
export const $activeEvent = atom<EventId | null>(null);
