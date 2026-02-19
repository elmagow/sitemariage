import { useStore } from '@nanostores/react';
import { $language } from '@/stores/language';
import { $rsvpOpen } from '@/stores/rsvp-open';
import { t } from '@/i18n/translations';
import { cn } from '@/lib/utils';
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
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Language switcher — pill container */}
      <nav
        aria-label={lang === 'fr' ? 'Choix de langue' : 'בחירת שפה'}
        className="flex items-center bg-card/60 rounded-full px-1 py-0.5"
      >
        <button
          type="button"
          onClick={() => handleLanguageChange('fr')}
          aria-label={t('nav.lang_switch_fr', lang)}
          aria-current={lang === 'fr' ? 'true' : undefined}
          className={cn(
            'min-h-11 min-w-11 flex items-center justify-center',
            'font-body text-sm font-medium rounded-full',
            'transition-all duration-300',
            lang === 'fr'
              ? 'bg-background text-primary shadow-sm'
              : 'text-foreground/50 hover:text-foreground'
          )}
        >
          {t('nav.lang_fr', lang)}
        </button>
        <button
          type="button"
          onClick={() => handleLanguageChange('he')}
          aria-label={t('nav.lang_switch_he', lang)}
          aria-current={lang === 'he' ? 'true' : undefined}
          className={cn(
            'min-h-11 min-w-11 flex items-center justify-center',
            'font-body text-sm font-medium rounded-full',
            'transition-all duration-300',
            lang === 'he'
              ? 'bg-background text-primary shadow-sm'
              : 'text-foreground/50 hover:text-foreground'
          )}
        >
          {t('nav.lang_he', lang)}
        </button>
      </nav>

      {/* RSVP button */}
      <button
        type="button"
        onClick={handleRsvpOpen}
        className={cn(
          'btn-primary min-h-11 px-5 sm:px-7',
          'bg-primary text-primary-foreground',
          'font-heading uppercase tracking-widest text-sm',
          'rounded-full',
          'hover:bg-primary/90 transition-all duration-300'
        )}
      >
        {t('nav.rsvp', lang)}
      </button>
    </div>
  );
}
