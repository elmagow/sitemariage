import { atom } from 'nanostores';
import type { EventId } from '@/data/events';

export const $activeEvent = atom<EventId | null>(null);
