import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ICONS = {
  plane:    '✈️',
  car:      '🚗',
  dinner:   '🥂',
  beach:    '🏖️',
  wedding:  '🤵🏻‍♂️👰🏻‍♀️',
}

// Icon transitions happen at the MIDPOINT between consecutive stops,
// so the emoji changes smoothly halfway through each segment rather than at the stop dots.
// Stop y-positions: 2, 17, 31, 46, 61, 75, 90 (progress 0, 0.17, 0.33, 0.50, 0.67, 0.83, 1.0)
// Transition thresholds = midpoint of each pair of consecutive stops:
//   car → plane   at (0.17+0.33)/2 = 0.25
//   plane → dinner at (0.33+0.50)/2 = 0.415
//   dinner → beach at (0.50+0.67)/2 = 0.585
//   beach → wedding at (0.67+0.83)/2 = 0.75
//   wedding → plane at (0.83+1.00)/2 = 0.915
const STOPS = [
  { progress: 0,      icon: 'car'     },   // Paris → Mairie: car
  { progress: 0.25,   icon: 'plane'   },   // midpoint Mairie↔Tel Aviv
  { progress: 0.415,  icon: 'dinner'  },   // midpoint Tel Aviv↔Welcome Dinner
  { progress: 0.585,  icon: 'beach'   },   // midpoint Welcome Dinner↔Beach Party
  { progress: 0.75,   icon: 'wedding' },   // midpoint Beach Party↔Wedding
  { progress: 0.915,  icon: 'plane'   },   // midpoint Wedding↔Return
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

  // Cache layout dimensions — updated via ResizeObserver instead of per-frame reads
  let sectionWidth  = section.offsetWidth
  let sectionHeight = section.offsetHeight

  const ro = new ResizeObserver(entries => {
    for (const entry of entries) {
      sectionWidth  = entry.contentBoxSize?.[0]?.inlineSize ?? entry.target.offsetWidth
      sectionHeight = entry.contentBoxSize?.[0]?.blockSize  ?? entry.target.offsetHeight
    }
  })
  ro.observe(section)

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

  // The snake path runs from y=2 to y=90 in viewBox units (0–100).
  // Map scroll progress 0–1 directly to that y range so the
  // traveler starts at the very top of the line (y=2) at progress=0.
  const PATH_Y_START = 2
  const PATH_Y_END   = 90

  // Collect all stop dots + their y-positions for color animation
  const stopDots = []
  section.querySelectorAll('.journey-stop').forEach(stop => {
    const dot = stop.querySelector('.stop-dot')
    if (!dot) return
    // Read --sy from inline style (e.g. "10%") → number
    const syStr = stop.style.getPropertyValue('--sy').trim()
    const sy = parseFloat(syStr) || 0
    stopDots.push({ dot, sy })
  })

  function update(scrollProgress) {
    // progress 0→1 maps to y 2→90 in viewBox units
    const yPct = PATH_Y_START + scrollProgress * (PATH_Y_END - PATH_Y_START)
    const xPct = getXAtY(yPct)

    // Single transform — GPU composited, CSS transition smooths it
    const xPx = (xPct / 100) * sectionWidth
    const yPx = (yPct / 100) * sectionHeight
    traveler.style.transform = `translate(${xPx}px, ${yPx}px) translate(-50%, -50%)`

    const icon = getIconForProgress(scrollProgress)
    if (traveler.textContent !== ICONS[icon]) {
      traveler.textContent = ICONS[icon]
    }

    // Dot color: turns green once the traveler reaches it,
    // stays green until the traveler scrolls back above it
    for (const { dot, sy } of stopDots) {
      if (yPct >= sy - 1) {
        dot.classList.add('stop-dot--active')
      } else {
        dot.classList.remove('stop-dot--active')
      }
    }
  }

  update(0)

  ScrollTrigger.create({
    trigger: section,
    start: 'top 40%',       // animation begins when section top is 40% down the viewport
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => update(self.progress)
  })
}
