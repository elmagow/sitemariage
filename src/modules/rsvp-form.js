/**
 * RSVP Form Module
 *
 * Handles the RSVP modal open/close and form submission to Google Sheets
 * via Google Apps Script web app.
 *
 * Google Sheet columns:
 *   Timestamp | Nom | Téléphone | Personnes | Mairie | Welcome | Beach |
 *   Bus Beach | Soirée | Bus Soirée | Babysitter | Message
 *
 * Setup:
 *   1. Create a Google Sheet with the columns above in Row 1
 *   2. Extensions → Apps Script → paste the doPost(e) function (see below)
 *   3. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 *   4. Copy the deployment URL and paste it below.
 */
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykV8UicnM8ZRhjsH5Ankhr8RgkbTnLvXQow-8YKLXq3fHABt-x-WAMCykd9Ik1eP376g/exec'

let lastFocusedEl = null
let currentT = null  // i18n t() reference — set by initRsvpForm(tFn)

/**
 * Open the RSVP modal.
 */
function openRsvpModal() {
  const modal = document.getElementById('rsvp-modal')
  if (!modal) return

  modal.removeAttribute('hidden')

  requestAnimationFrame(() => {
    modal.classList.add('is-open')
  })

  const focusTarget = modal.querySelector('.modal-card')
  if (focusTarget) focusTarget.focus()
}

/**
 * Close the RSVP modal.
 * Waits for the CSS exit transition to complete before setting hidden.
 */
function closeRsvpModal() {
  const modal = document.getElementById('rsvp-modal')
  if (!modal) return

  modal.classList.remove('is-open')

  // Wait for CSS transition before hiding so the exit animation plays
  const card = modal.querySelector('.modal-card')
  const onTransitionEnd = () => {
    modal.setAttribute('hidden', '')
    card && card.removeEventListener('transitionend', onTransitionEnd)
  }

  if (card) {
    card.addEventListener('transitionend', onTransitionEnd, { once: true })
    setTimeout(() => {
      if (!modal.hasAttribute('hidden')) onTransitionEnd()
    }, 300)
  } else {
    modal.setAttribute('hidden', '')
  }

  if (lastFocusedEl) {
    lastFocusedEl.focus()
    lastFocusedEl = null
  }
}

/**
 * Validate the RSVP form.
 * Returns true if valid, false if there are errors.
 * Shows inline error messages for failed fields.
 */
function validateForm(form) {
  let valid = true

  // Helper: get localized string or fallback
  const msg = (key, fallback) => (currentT ? currentT(key) : fallback)

  // Name
  const nameInput = form.querySelector('#rsvp-name')
  const nameError = form.querySelector('#error-name')
  if (nameInput && !nameInput.value.trim()) {
    if (nameError) {
      nameError.textContent = msg('rsvp.error_name', 'Veuillez saisir votre nom.')
      nameError.removeAttribute('hidden')
    }
    nameInput.focus()
    valid = false
  } else if (nameError) {
    nameError.setAttribute('hidden', '')
  }

  // Phone
  const phoneInput = form.querySelector('#rsvp-phone')
  const phoneError = form.querySelector('#error-phone')
  if (phoneInput && !phoneInput.value.trim()) {
    if (phoneError) {
      phoneError.textContent = msg('rsvp.error_phone', 'Veuillez saisir votre numéro de téléphone.')
      phoneError.removeAttribute('hidden')
    }
    if (valid) phoneInput.focus()
    valid = false
  } else if (phoneError) {
    phoneError.setAttribute('hidden', '')
  }

  // Guests (dropdown — must have a selection)
  const guestsSelect = form.querySelector('#rsvp-guests')
  const guestsError = form.querySelector('#error-guests')
  if (guestsSelect && !guestsSelect.value) {
    if (guestsError) {
      guestsError.textContent = msg('rsvp.error_guests', 'Veuillez sélectionner le nombre de personnes.')
      guestsError.removeAttribute('hidden')
    }
    if (valid) guestsSelect.focus()
    valid = false
  } else if (guestsError) {
    guestsError.setAttribute('hidden', '')
  }

  // Events checkboxes — at least one must be checked
  const eventCheckboxes = form.querySelectorAll('input[name="events"]')
  const eventsError = form.querySelector('#error-events')
  const anyChecked = Array.from(eventCheckboxes).some(cb => cb.checked)
  if (!anyChecked) {
    if (eventsError) {
      eventsError.textContent = msg('rsvp.error_events', 'Veuillez sélectionner au moins un événement.')
      eventsError.removeAttribute('hidden')
    }
    valid = false
  } else if (eventsError) {
    eventsError.setAttribute('hidden', '')
  }

  return valid
}

// Checkbox value → Google Sheet column name mapping
const EVENT_COLUMNS = [
  'mairie',
  'welcome',
  'beach',
  'bus-beach',
  'soiree',
  'bus-soiree',
  'babysitter',
]

/**
 * Initialize the RSVP form — attach all listeners ONCE.
 * Must only be called once on app startup.
 */
/**
 * Update the t() reference on language switch.
 * Does NOT re-attach any listeners.
 */
export function updateRsvpFormLang(tFn) {
  currentT = tFn
}

export function initRsvpForm(tFn) {
  currentT = tFn || null
  // RSVP button in header opens modal
  document.querySelectorAll('.rsvp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      lastFocusedEl = btn
      openRsvpModal()
    })
  })

  const modal = document.getElementById('rsvp-modal')
  if (!modal) return

  // Close button
  const closeBtn = modal.querySelector('.modal-close')
  if (closeBtn) {
    closeBtn.addEventListener('click', closeRsvpModal)
  }

  // Backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeRsvpModal()
  })

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeRsvpModal()
    }
  })

  // Form submission
  const form = document.getElementById('rsvp-form')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Validate
    if (!validateForm(form)) return

    // Build URLSearchParams with one key per checkbox (true/false)
    const params = new URLSearchParams()
    params.set('name', form.querySelector('#rsvp-name').value.trim())
    params.set('phone', form.querySelector('#rsvp-phone').value.trim())
    params.set('guests', form.querySelector('#rsvp-guests').value)

    // Each event checkbox → its own column with true/false
    const checkedValues = new Set(
      Array.from(form.querySelectorAll('input[name="events"]:checked')).map(cb => cb.value)
    )
    for (const col of EVENT_COLUMNS) {
      params.set(col, checkedValues.has(col) ? 'TRUE' : 'FALSE')
    }

    params.set('message', (form.querySelector('#rsvp-message')?.value || '').trim())

    // Get submit button for state management
    const submitBtn = form.querySelector('.rsvp-submit')
    const originalText = submitBtn ? submitBtn.textContent : ''

    // Show submitting state
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = currentT ? currentT('rsvp.submitting') : 'Envoi en cours\u2026'
    }

    // Hide any previous error
    const errorDiv = form.querySelector('.rsvp-error')
    if (errorDiv) errorDiv.setAttribute('hidden', '')

    try {
      // IMPORTANT: Use URLSearchParams (application/x-www-form-urlencoded), NOT FormData.
      // Google Apps Script e.parameter only parses application/x-www-form-urlencoded.
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        body: params,
        redirect: 'follow'  // GAS web apps redirect on POST — must follow
      })

      if (!response.ok && response.status !== 0) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Success: hide submit button, show success banner in the same spot
      if (submitBtn) submitBtn.setAttribute('hidden', '')
      const successDiv = form.querySelector('.rsvp-success')
      if (successDiv) successDiv.removeAttribute('hidden')

      // Disable all form fields so they can't be changed after success
      form.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = true })

    } catch (err) {
      console.error('[rsvp-form] Submission error:', err)

      // Show error state
      if (errorDiv) errorDiv.removeAttribute('hidden')

      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      }
    }
  })
}
