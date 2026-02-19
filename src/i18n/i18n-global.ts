import { $language } from '@/stores/language';
import type { Language } from '@/stores/language';
import { t, type TranslationKey } from './translations';

function updatePage(lang: Language) {
  // Update html attributes
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';

  // Toggle hebrew class for font switching
  if (lang === 'he') {
    document.documentElement.classList.add('hebrew');
  } else {
    document.documentElement.classList.remove('hebrew');
  }

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n') as TranslationKey;
    if (key) {
      el.textContent = t(key, lang);
    }
  });
}

// Subscribe to language changes
$language.subscribe(updatePage);
