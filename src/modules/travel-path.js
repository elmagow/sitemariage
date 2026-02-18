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

  function update(scrollProgress) {
    const sectionH = section.offsetHeight
    const vpH = window.innerHeight
    const centerY = scrollProgress * (sectionH - vpH) + vpH / 2
    const yPct = (centerY / sectionH) * 100
    const xPct = getXAtY(yPct)

    // Single transform — GPU composited, CSS transition smooths it
    const xPx = (xPct / 100) * section.offsetWidth
    const yPx = (yPct / 100) * sectionH
    traveler.style.transform = `translate(${xPx}px, ${yPx}px) translate(-50%, -50%)`

    const icon = getIconForProgress(scrollProgress)
    if (traveler.textContent !== ICONS[icon]) {
      traveler.textContent = ICONS[icon]
    }
  }

  update(0)

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => update(self.progress)
  })
}
