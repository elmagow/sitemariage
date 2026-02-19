// CSS entry (relative to src/main.js — do NOT use '../src/styles/main.css')
import './styles/main.css'

// i18n
import { setLanguage, t } from './i18n/index.js'

// Modules
import { initTravelPath } from './modules/travel-path.js'
import { initEventModal, updateEventModalLang } from './modules/event-modal.js'
import { initRsvpForm, updateRsvpFormLang } from './modules/rsvp-form.js'
import { initCountdown } from './modules/countdown.js'

// ─── Initialize default language (French) ───────────────────────────────────
// This sets document.documentElement.lang = 'fr', dir = 'ltr',
// and populates all [data-i18n] elements with French strings.
setLanguage('fr')

// Set initial active state on FR button
const frBtn = document.querySelector('.lang-btn[data-lang="fr"]')
if (frBtn) frBtn.classList.add('is-active')

// ─── Initialize modules (listeners attached ONCE here) ───────────────────────
initTravelPath()
initEventModal(t)   // Pass t() reference — modal uses this to resolve i18n keys
initRsvpForm(t)
initCountdown()

// ─── Language switcher ────────────────────────────────────────────────────────
// CRITICAL: Only updateEventModalLang() is called on lang switch — NOT initEventModal().
// Calling initEventModal() again would attach duplicate event listeners on every switch.
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang
    if (!lang) return

    // Update language and DOM
    setLanguage(lang)

    // Update placeholder attributes (data-i18n-placeholder) manually
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder')
      const text = t(key)
      if (text !== key) el.placeholder = text
    })

    // Update aria-label attributes (data-i18n-aria)
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria')
      const text = t(key)
      if (text !== key) el.setAttribute('aria-label', text)
    })

    // Update active button styling
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('is-active'))
    btn.classList.add('is-active')

    // Update module t() references ONLY — no listener re-attachment
    updateEventModalLang(t)
    updateRsvpFormLang(t)
  })
})

// ─── Initialize placeholders for default language ────────────────────────────
// Run once on load for the default 'fr' language
document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
  const key = el.getAttribute('data-i18n-placeholder')
  const text = t(key)
  if (text !== key) el.placeholder = text
})

// Initialize aria-label translations for default language
document.querySelectorAll('[data-i18n-aria]').forEach(el => {
  const key = el.getAttribute('data-i18n-aria')
  const text = t(key)
  if (text !== key) el.setAttribute('aria-label', text)
})
