import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Emoji for each travel segment
const ICONS = {
  plane:    '✈️',
  walk:     '🚶',
  bus:      '🚌',
  party:    '🎉',
  wedding:  '💍',
}

// 6 stops — progress thresholds 0–1 at which the emoji changes
const STOPS = [
  { id: 'paris-departure', progress: 0,    icon: 'plane'   },
  { id: 'tel-aviv',        progress: 0.18, icon: 'walk'    },
  { id: 'welcome-dinner',  progress: 0.35, icon: 'walk'    },
  { id: 'beach-party',     progress: 0.52, icon: 'party'   },
  { id: 'wedding',         progress: 0.68, icon: 'wedding' },
  { id: 'return',          progress: 0.88, icon: 'plane'   },
]

function getIconForProgress(progress) {
  let active = STOPS[0].icon
  for (const stop of STOPS) {
    if (progress >= stop.progress) active = stop.icon
  }
  return active
}

export function initTravelPath() {
  const section   = document.querySelector('.travel-section')
  const traveler  = document.getElementById('traveler')
  const snakePath = document.getElementById('snake-path')

  if (!section || !traveler) {
    console.warn('[travel-path] Required elements not found')
    return
  }

  traveler.textContent = ICONS.plane

  /**
   * Map a y-percentage (0–100, matching the viewBox) to the x-coordinate
   * on the snake path at that vertical position.
   *
   * We binary-search along the path to find the point whose y ≈ targetY.
   */
  let totalLen = 0
  function getXAtY(targetY) {
    if (!snakePath || !snakePath.getTotalLength) return 50
    if (!totalLen) totalLen = snakePath.getTotalLength()

    // Binary search for the length where path.y ≈ targetY
    let lo = 0, hi = totalLen, mid, pt
    for (let i = 0; i < 25; i++) {
      mid = (lo + hi) / 2
      pt = snakePath.getPointAtLength(mid)
      if (pt.y < targetY) lo = mid
      else hi = mid
    }
    pt = snakePath.getPointAtLength((lo + hi) / 2)
    return pt.x // viewBox units (0–100) = percentage
  }

  /**
   * Position the traveler.
   *
   * Strategy: the traveler is position:absolute within the section.
   * We need it to always be visible, tracking the snake curve.
   *
   * `scrollProgress` (0–1) = how far the section has scrolled past the viewport.
   * The viewport center's position within the section (as %) = 
   *   (scrollProgress × (sectionHeight - viewportHeight) + viewportHeight/2) / sectionHeight
   *
   * We place the traveler at that y% and read the snake's x at that y.
   */
  function updateTraveler(scrollProgress) {
    const sectionH = section.offsetHeight
    const vpH = window.innerHeight

    // Where is the viewport center in the section, as a fraction 0–1?
    // At progress=0: viewport top = section top → center = vpH/2
    // At progress=1: viewport bottom = section bottom → center = sectionH - vpH/2
    const centerInSection = scrollProgress * (sectionH - vpH) + vpH / 2
    const yPct = (centerInSection / sectionH) * 100 // 0–100 range, matches viewBox

    // Get the snake's x at that y
    const xPct = getXAtY(yPct)

    traveler.style.top  = yPct + '%'
    traveler.style.left = xPct + '%'

    const icon = getIconForProgress(scrollProgress)
    if (traveler.textContent !== ICONS[icon]) {
      traveler.textContent = ICONS[icon]
    }
  }

  // Position immediately at progress=0
  updateTraveler(0)

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end:   'bottom bottom',
    scrub: true,
    onUpdate: (self) => updateTraveler(self.progress)
  })
}
