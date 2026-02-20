/**
 * Event Modal Module
 *
 * Pattern: initEventModal() is called ONCE on startup (attaches listeners).
 * updateEventModalLang() is called on language switch — only updates the t() reference,
 * does NOT re-attach listeners (prevents duplicate listener accumulation).
 */

// Keys for each event's modal content — dot-notation i18n keys
const EVENT_KEYS = {
  'mairie': {
    emoji:     '🚗',
    name:      'journey.stop_0_name',
    date:      'journey.stop_0_date',
    location:  'journey.stop_0_location',
    transport: 'journey.stop_0_transport',
    dresscode: 'journey.stop_0_dresscode'
  },
  'welcome-dinner': {
    emoji:     '🥂',
    name:      'journey.stop_1_name',
    date:      'journey.stop_1_date',
    location:  'journey.stop_1_location',
    transport: 'journey.stop_1_transport',
    dresscode: 'journey.stop_1_dresscode'
  },
  'beach-party': {
    emoji:     '🏖️',
    name:      'journey.stop_2_name',
    date:      'journey.stop_2_date',
    location:  'journey.stop_2_location',
    transport: 'journey.stop_2_transport',
    dresscode: 'journey.stop_2_dresscode'
  },
  'wedding': {
    emoji:     '💍',
    name:      'journey.stop_3_name',
    date:      'journey.stop_3_date',
    location:  'journey.stop_3_location',
    transport: 'journey.stop_3_transport',
    dresscode: 'journey.stop_3_dresscode'
  }
}

// Module-level state
let currentT = null         // Active t() function reference — updated on lang switch
let lastFocusedEl = null    // Store trigger element for focus return on close

/**
 * Populate and open the event modal.
 */
function openModal(eventId) {
  const keys = EVENT_KEYS[eventId]
  if (!keys || !currentT) return

  // Populate modal content
  const modalEl = document.getElementById('event-modal')
  document.getElementById('modal-event-emoji').textContent     = keys.emoji
  document.getElementById('modal-event-name').textContent      = currentT(keys.name)
  document.getElementById('modal-event-date').textContent      = currentT(keys.date)
  document.getElementById('modal-event-location').textContent  = currentT(keys.location)
  document.getElementById('modal-event-transport').textContent = currentT(keys.transport)
  document.getElementById('modal-event-dresscode').textContent = currentT(keys.dresscode)

  // Show the modal
  modalEl.removeAttribute('hidden')

  // Trigger CSS animation (requestAnimationFrame to ensure display: flex is active first)
  requestAnimationFrame(() => {
    modalEl.classList.add('is-open')
  })

  // Trap focus inside modal
  const focusTarget = modalEl.querySelector('.modal-card')
  if (focusTarget) focusTarget.focus()
}

/**
 * Close the event modal and return focus to the trigger element.
 * Waits for the CSS exit transition to complete before setting hidden,
 * so the modal card fade-out animation actually plays.
 */
function closeModal() {
  const modalEl = document.getElementById('event-modal')
  if (!modalEl) return

  modalEl.classList.remove('is-open')

  // Wait for CSS transition (--transition-normal = 250ms) before hiding
  const card = modalEl.querySelector('.modal-card')
  const onTransitionEnd = () => {
    modalEl.setAttribute('hidden', '')
    card && card.removeEventListener('transitionend', onTransitionEnd)
  }

  if (card) {
    card.addEventListener('transitionend', onTransitionEnd, { once: true })
    // Fallback: if transitionend never fires (e.g. reduced-motion), hide after 300ms
    setTimeout(() => {
      if (!modalEl.hasAttribute('hidden')) onTransitionEnd()
    }, 300)
  } else {
    modalEl.setAttribute('hidden', '')
  }

  // Return focus to the element that opened the modal
  if (lastFocusedEl) {
    lastFocusedEl.focus()
    lastFocusedEl = null
  }
}

/**
 * Initialize the event modal — attach all listeners ONCE.
 * Must only be called once on app startup.
 */
export function initEventModal(tFn) {
  currentT = tFn

  // Event stop click handlers
  document.querySelectorAll('.event-stop').forEach(btn => {
    btn.addEventListener('click', () => {
      lastFocusedEl = btn
      openModal(btn.dataset.event)
    })
  })

  // Close button inside #event-modal
  const modalEl = document.getElementById('event-modal')
  if (!modalEl) return

  const closeBtn = modalEl.querySelector('.modal-close')
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal)
  }

  // Backdrop click to close (only when clicking the overlay itself, not the card)
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal()
  })

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalEl.hasAttribute('hidden')) {
      closeModal()
    }
  })
}

/**
 * Update the t() reference on language switch.
 * Does NOT re-attach any listeners.
 */
export function updateEventModalLang(tFn) {
  currentT = tFn
}
