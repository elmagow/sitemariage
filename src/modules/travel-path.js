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

  // Set initial emoji
  traveler.textContent = ICONS.plane

  /**
   * Map progress 0–1 to (x%, y%) on the snake path.
   * Uses SVGPathElement.getPointAtLength for exact curve tracking.
   */
  function getPathPoint(progress) {
    if (snakePath && snakePath.getTotalLength) {
      const len = snakePath.getTotalLength()
      const pt  = snakePath.getPointAtLength(progress * len)
      return { x: pt.x, y: pt.y } // viewBox units = %
    }
    return { x: 50, y: progress * 100 }
  }

  // With position:sticky, the traveler stays vertically centered in the viewport.
  // JS only needs to update `left` to follow the snake horizontally.
  function updateTraveler(progress) {
    const pt = getPathPoint(progress)
    traveler.style.left = pt.x + '%'
    // top is controlled by CSS sticky (50vh) — no JS needed for vertical
    const icon = getIconForProgress(progress)
    if (traveler.textContent !== ICONS[icon]) {
      traveler.textContent = ICONS[icon]
    }
  }

  // Draw at progress=0 immediately so it's visible on load
  updateTraveler(0)

  ScrollTrigger.create({
    trigger: section,
    // top of section hits top of viewport → start
    // bottom of section hits bottom of viewport → end
    // This means the traveler moves exactly as the user scrolls through the section.
    start: 'top top',
    end:   'bottom bottom',
    scrub: true,
    onUpdate: (self) => updateTraveler(self.progress)
  })
}
