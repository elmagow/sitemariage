import { useStore } from '@nanostores/react';
import { $language } from '@/stores/language';
import { $rsvpOpen } from '@/stores/rsvp-open';
import { t } from '@/i18n/translations';
import type { Language } from '@/stores/language';

export function HeaderControls() {
  const lang = useStore($language);

  const handleLanguageChange = (newLang: Language) => {
    $language.set(newLang);
  };

  const handleRsvpOpen = () => {
    $rsvpOpen.set(true);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Language switcher */}
      <nav aria-label={lang === 'fr' ? 'Choix de langue' : 'בחירת שפה'} className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleLanguageChange('fr')}
          aria-label={t('nav.lang_switch_fr', lang)}
          aria-current={lang === 'fr' ? 'true' : undefined}
          className={`min-h-11 min-w-11 flex items-center justify-center font-body text-sm font-medium transition-colors ${
            lang === 'fr'
              ? 'text-primary border-b-2 border-primary'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          {t('nav.lang_fr', lang)}
        </button>
        <span className="text-foreground/30 select-none" aria-hidden="true">|</span>
        <button
          type="button"
          onClick={() => handleLanguageChange('he')}
          aria-label={t('nav.lang_switch_he', lang)}
          aria-current={lang === 'he' ? 'true' : undefined}
          className={`min-h-11 min-w-11 flex items-center justify-center font-body text-sm font-medium transition-colors ${
            lang === 'he'
              ? 'text-primary border-b-2 border-primary'
              : 'text-foreground/60 hover:text-foreground'
          }`}
        >
          {t('nav.lang_he', lang)}
        </button>
      </nav>

      {/* RSVP button */}
      <button
        type="button"
        onClick={handleRsvpOpen}
        className="min-h-11 px-4 sm:px-6 bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm rounded-md hover:bg-primary/90 transition-colors"
      >
        {t('nav.rsvp', lang)}
      </button>
    </div>
  );
}
