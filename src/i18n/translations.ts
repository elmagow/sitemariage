import type { Language } from '@/stores/language';
import { fr } from './fr';
import { he } from './he';

export type TranslationKey =
  // Hero
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.date'
  | 'hero.location'
  // Countdown
  | 'countdown.months'
  | 'countdown.days'
  | 'countdown.month_singular'
  | 'countdown.day_singular'
  | 'countdown.celebration'
  // Nav
  | 'nav.rsvp'
  | 'nav.lang_fr'
  | 'nav.lang_he'
  | 'nav.lang_switch_fr'
  | 'nav.lang_switch_he'
  // Event: Mairie
  | 'event.mairie.name'
  | 'event.mairie.date'
  | 'event.mairie.time'
  | 'event.mairie.location'
  | 'event.mairie.address'
  | 'event.mairie.transport'
  | 'event.mairie.dress_code'
  | 'event.mairie.description'
  // Event: Welcome Dinner
  | 'event.welcome_dinner.name'
  | 'event.welcome_dinner.date'
  | 'event.welcome_dinner.time'
  | 'event.welcome_dinner.location'
  | 'event.welcome_dinner.address'
  | 'event.welcome_dinner.transport'
  | 'event.welcome_dinner.dress_code'
  | 'event.welcome_dinner.description'
  // Event: Beach Party
  | 'event.beach_party.name'
  | 'event.beach_party.date'
  | 'event.beach_party.time'
  | 'event.beach_party.location'
  | 'event.beach_party.address'
  | 'event.beach_party.transport'
  | 'event.beach_party.dress_code'
  | 'event.beach_party.description'
  // Event: Wedding Ceremony
  | 'event.wedding_ceremony.name'
  | 'event.wedding_ceremony.date'
  | 'event.wedding_ceremony.time'
  | 'event.wedding_ceremony.location'
  | 'event.wedding_ceremony.address'
  | 'event.wedding_ceremony.transport'
  | 'event.wedding_ceremony.dress_code'
  | 'event.wedding_ceremony.description'
  // Event detail labels
  | 'event.label_date'
  | 'event.label_time'
  | 'event.label_location'
  | 'event.label_address'
  | 'event.label_transport'
  | 'event.label_dress_code'
  | 'event.label_description'
  // RSVP
  | 'rsvp.title'
  | 'rsvp.subtitle'
  | 'rsvp.name_label'
  | 'rsvp.name_placeholder'
  | 'rsvp.email_label'
  | 'rsvp.email_placeholder'
  | 'rsvp.events_label'
  | 'rsvp.guests_label'
  | 'rsvp.guests_description'
  | 'rsvp.dietary_label'
  | 'rsvp.dietary_placeholder'
  | 'rsvp.message_label'
  | 'rsvp.message_placeholder'
  | 'rsvp.submit'
  | 'rsvp.submitting'
  | 'rsvp.success_title'
  | 'rsvp.success_message'
  | 'rsvp.error_title'
  | 'rsvp.error_message'
  | 'rsvp.error_retry'
  | 'rsvp.error_name_required'
  | 'rsvp.error_email_invalid'
  | 'rsvp.error_events_required'
  // Practical
  | 'practical.title'
  | 'practical.flights.title'
  | 'practical.flights.content'
  | 'practical.hotels.title'
  | 'practical.hotels.content'
  | 'practical.transport.title'
  | 'practical.transport.content'
  | 'practical.currency.title'
  | 'practical.currency.content'
  | 'practical.emergency.title'
  | 'practical.emergency.content'
  | 'practical.weather.title'
  | 'practical.weather.content'
  // Footer
  | 'footer.made_with_love'
  | 'footer.copyright'
  // Globe
  | 'globe.aria_label'
  | 'globe.static_aria_label'
  // Globe section
  | 'globe.section_title'
  | 'globe.scroll_hint'
  // Footer extras
  | 'footer.from_with_love'
  // Accessibility
  | 'a11y.skip_to_content'
  | 'a11y.lang_changed'
  | 'a11y.close';

export type Translations = Record<TranslationKey, string>;

const translationMap: Record<Language, Translations> = {
  fr,
  he,
};

export function t(key: TranslationKey, lang: Language): string {
  return translationMap[lang][key] ?? key;
}
