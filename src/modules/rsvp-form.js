/**
 * RSVP Form Module
 *
 * Handles the RSVP modal open/close and form submission to Google Sheets
 * via Google Apps Script web app.
 *
 * IMPORTANT: Eric must replace GOOGLE_APPS_SCRIPT_URL with his actual GAS URL.
 * Instructions:
 *   1. Create a Google Sheet with columns: Timestamp, Name, Email, Events, Guests, Dietary, Message
 *   2. Extensions → Apps Script → paste the doPost(e) function (see tech-spec)
 *   3. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 *   4. Copy the deployment URL and paste it below.
 */
const GOOGLE_APPS_SCRIPT_URL = 'PASTE_YOUR_GAS_URL_HERE'

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

  // Helper: get localized string or fallback to English
  const msg = (key, fallback) => (currentT ? currentT(key) : fallback)

  // Name
  const nameInput = form.querySelector('#rsvp-name')
  const nameError = form.querySelector('#error-name')
  if (nameInput && !nameInput.value.trim()) {
    if (nameError) {
      nameError.textContent = msg('rsvp.error_name', 'Please enter your name.')
      nameError.removeAttribute('hidden')
    }
    nameInput.focus()
    valid = false
  } else if (nameError) {
    nameError.setAttribute('hidden', '')
  }

  // Email
  const emailInput = form.querySelector('#rsvp-email')
  const emailError = form.querySelector('#error-email')
  if (emailInput && (!emailInput.value.trim() || !emailInput.value.includes('@'))) {
    if (emailError) {
      emailError.textContent = msg('rsvp.error_email', 'Please enter a valid email address.')
      emailError.removeAttribute('hidden')
    }
    if (valid) emailInput.focus()
    valid = false
  } else if (emailError) {
    emailError.setAttribute('hidden', '')
  }

  // Events checkboxes — at least one must be checked
  const eventCheckboxes = form.querySelectorAll('input[name="events"]')
  const eventsError = form.querySelector('#error-events')
  const anyChecked = Array.from(eventCheckboxes).some(cb => cb.checked)
  if (!anyChecked) {
    if (eventsError) {
      eventsError.textContent = msg('rsvp.error_events', 'Please select at least one event.')
      eventsError.removeAttribute('hidden')
    }
    valid = false
  } else if (eventsError) {
    eventsError.setAttribute('hidden', '')
  }

  return valid
}

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

    // Collect checked events into a comma-separated string
    const checkedEvents = Array.from(form.querySelectorAll('input[name="events"]:checked'))
      .map(cb => cb.value)
      .join(', ')

    // Get submit button for state management
    const submitBtn = form.querySelector('.rsvp-submit')
    const originalText = submitBtn ? submitBtn.textContent : ''

    // Show submitting state
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = currentT ? currentT('rsvp.submitting') : 'Sending\u2026'
    }

    // Hide any previous error
    const errorDiv = modal.querySelector('.rsvp-error')
    if (errorDiv) errorDiv.setAttribute('hidden', '')

    try {
      // IMPORTANT: Use URLSearchParams (application/x-www-form-urlencoded), NOT FormData.
      // Google Apps Script e.parameter only parses application/x-www-form-urlencoded.
      // FormData sends multipart/form-data which GAS cannot parse into e.parameter.
      const formData = new FormData(form)
      // Manually set events field to our comma-joined string (FormData would send multiple values)
      formData.set('events', checkedEvents)
      const params = new URLSearchParams(formData)

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        body: params,
        redirect: 'follow'  // GAS web apps redirect on POST — must follow
      })

      if (!response.ok && response.status !== 0) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Success: hide form, show success message
      form.setAttribute('hidden', '')
      const successDiv = modal.querySelector('.rsvp-success')
      if (successDiv) successDiv.removeAttribute('hidden')

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
