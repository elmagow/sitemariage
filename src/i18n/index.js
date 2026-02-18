import fr from './fr.js'
import he from './he.js'

const LANGUAGES = { fr, he }

let currentLang = 'fr'

/**
 * Resolve a dot-notation key path against an object.
 * e.g. resolve('hero.title', translations) => 'Anaël & Eric'
 */
function resolve(keyPath, obj) {
  return keyPath.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : keyPath), obj)
}

/**
 * Set the active language and update all [data-i18n] elements in the DOM.
 */
export function setLanguage(lang) {
  if (!LANGUAGES[lang]) return
  currentLang = lang
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    const text = resolve(key, LANGUAGES[lang])
    if (text !== key) el.textContent = text
  })
}

/**
 * Get a translated string programmatically by dot-notation key.
 */
export function t(key) {
  return resolve(key, LANGUAGES[currentLang])
}

/**
 * Get current language code.
 */
export function getCurrentLang() {
  return currentLang
}

export default { setLanguage, t, currentLang: getCurrentLang }
