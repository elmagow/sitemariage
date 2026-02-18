import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// SVG content for each transport icon (inline, currentColor)
const ICON_SVGS = {
  plane: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <path d="M6 28 L20 20 L28 4 L32 6 L26 22 L38 18 L40 22 L28 28 L26 42 L22 42 L20 32 L8 36 Z" fill="currentColor"/>
  </svg>`,

  'walk-taxi': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <circle cx="30" cy="8" r="4" fill="currentColor"/>
    <path d="M30 12 L28 22 L22 30 L25 31 L30 24 L33 30 L36 30 L32 21 L34 14 Z" fill="currentColor"/>
    <path d="M28 16 L20 20 L21 22 L29 19 Z" fill="currentColor"/>
    <path d="M28 22 L22 32 L24 33 L30 25 Z" fill="currentColor"/>
    <path d="M30 22 L34 32 L36 31 L33 21 Z" fill="currentColor"/>
    <path d="M32 16 L38 18 L38 20 L31 19 Z" fill="currentColor"/>
  </svg>`,

  bus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect x="4" y="10" width="40" height="26" rx="4" fill="currentColor"/>
    <rect x="8" y="14" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
    <rect x="18" y="14" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
    <rect x="28" y="14" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
    <rect x="34" y="22" width="6" height="10" rx="1" fill="white" opacity="0.5"/>
    <circle cx="13" cy="36" r="5" fill="white"/>
    <circle cx="13" cy="36" r="3" fill="currentColor"/>
    <circle cx="35" cy="36" r="5" fill="white"/>
    <circle cx="35" cy="36" r="3" fill="currentColor"/>
    <rect x="4" y="10" width="40" height="3" rx="2" fill="white" opacity="0.2"/>
    <rect x="8" y="10" width="14" height="3" rx="1" fill="white" opacity="0.4"/>
  </svg>`
}

// Stop definitions: yPercent is the normalized scroll position (0–1) of the travel section
const STOPS = [
  { id: 'paris-departure', yPercent: 0,    icon: 'plane'     },
  { id: 'welcome-dinner',  yPercent: 0.25, icon: 'walk-taxi' },
  { id: 'beach-party',     yPercent: 0.50, icon: 'bus'       },
  { id: 'wedding',         yPercent: 0.75, icon: 'bus'       },
  { id: 'return',          yPercent: 1.0,  icon: 'plane'     },
]

/**
 * Determine which icon should be active at a given scroll progress (0–1).
 */
function getIconForProgress(progress) {
  // Use the last stop whose yPercent <= current progress
  let activeIcon = STOPS[0].icon
  for (const stop of STOPS) {
    if (progress >= stop.yPercent) {
      activeIcon = stop.icon
    }
  }
  return activeIcon
}

/**
 * Inject the SVG for the given icon key into the traveler container.
 */
function setTravelerIcon(travelerEl, iconKey) {
  const svg = ICON_SVGS[iconKey]
  if (svg && travelerEl.dataset.currentIcon !== iconKey) {
    travelerEl.innerHTML = svg
    travelerEl.dataset.currentIcon = iconKey
  }
}

/**
 * Initialize the GSAP ScrollTrigger travel path animation.
 * Called once on app startup.
 *
 * Strategy:
 * - The snake path SVG fills the whole section (viewBox 0 0 100 100, preserveAspectRatio none).
 * - We use SVGPathElement.getPointAtLength to map scroll progress → (x%, y%) on the curve.
 * - The traveler is position:absolute; we set both `top` and `left` from those coordinates
 *   so it physically tracks the snake rather than staying in the center column.
 */
export function initTravelPath() {
  const section  = document.querySelector('.travel-section')
  const traveler = document.querySelector('.traveler')
  const snakePath = document.getElementById('snake-path')

  if (!section || !traveler) {
    console.warn('[travel-path] Required elements not found')
    return
  }

  // Set initial icon
  setTravelerIcon(traveler, 'plane')

  /**
   * Given a progress value 0–1, return the (x, y) percentage point on the snake.
   * Falls back to simple linear if the SVG path API is unavailable.
   */
  function getPathPoint(progress) {
    if (snakePath && snakePath.getTotalLength) {
      const totalLen = snakePath.getTotalLength()
      const pt = snakePath.getPointAtLength(progress * totalLen)
      // pt.x and pt.y are in viewBox units (0–100)
      return { x: pt.x, y: pt.y }
    }
    // Fallback: straight center line
    return { x: 50, y: progress * 100 }
  }

  // Set initial position at top of path
  const startPt = getPathPoint(0)
  traveler.style.left = startPt.x + '%'
  traveler.style.top  = startPt.y + '%'

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress  // 0 to 1

      // Follow the snake curve in both axes
      const pt = getPathPoint(progress)
      traveler.style.left = pt.x + '%'
      traveler.style.top  = pt.y + '%'

      // Swap icon based on which stop we've passed
      const activeIcon = getIconForProgress(progress)
      setTravelerIcon(traveler, activeIcon)
    }
  })

}

