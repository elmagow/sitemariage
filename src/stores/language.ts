import { atom } from 'nanostores';

export type Language = 'fr' | 'he';
export const $language = atom<Language>('fr');
