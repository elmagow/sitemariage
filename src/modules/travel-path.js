import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ICONS = {
  plane:   '✈️',
  walk:    '🚶',
  bus:     '🚌',
  party:   '🎉',
  wedding: '💍',
}

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

  if (!section || !traveler) return

  traveler.textContent = ICONS.plane

  // Cache path length (doesn't change)
  const pathLen = snakePath ? snakePath.getTotalLength() : 0

  /**
   * Get x at a given y on the snake (binary search, ~15 iterations).
   * Only called once per scroll frame — the CSS transition smooths between frames.
   */
  function getXAtY(targetY) {
    if (!pathLen) return 50
    let lo = 0, hi = pathLen
    for (let i = 0; i < 15; i++) {
      const mid = (lo + hi) / 2
      const pt = snakePath.getPointAtLength(mid)
      if (pt.y < targetY) lo = mid; else hi = mid
    }
    return snakePath.getPointAtLength((lo + hi) / 2).x
  }

  // The snake path runs from y=0 to y=90 in viewBox units (0–100).
  // Map scroll progress 0–1 directly to that y range so the
  // traveler starts at the very top of the line (y=0) at progress=0.
  const PATH_Y_START = 2
  const PATH_Y_END   = 90

  function update(scrollProgress) {
    const sectionH = section.offsetWidth // recalc width for x pixel conversion
    const sectionHeight = section.offsetHeight

    // progress 0→1 maps to y 0→90 in viewBox units
    const yPct = PATH_Y_START + scrollProgress * (PATH_Y_END - PATH_Y_START)
    const xPct = getXAtY(yPct)

    // Single transform — GPU composited, CSS transition smooths it
    const xPx = (xPct / 100) * section.offsetWidth
    const yPx = (yPct / 100) * sectionHeight
    traveler.style.transform = `translate(${xPx}px, ${yPx}px) translate(-50%, -50%)`

    const icon = getIconForProgress(scrollProgress)
    if (traveler.textContent !== ICONS[icon]) {
      traveler.textContent = ICONS[icon]
    }
  }

  update(0)

  ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',      // starts when section top is 80% down the viewport
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => update(self.progress)
  })
}
