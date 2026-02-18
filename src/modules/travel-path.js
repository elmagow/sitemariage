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

/**
 * Build a lookup table of 200 evenly-spaced points along the snake path.
 * Done once at init — avoids expensive getPointAtLength calls during scroll.
 * Each entry: { y: 0–100, x: 0–100 } in viewBox units.
 */
function buildPathLUT(snakePath, steps) {
  const lut = []
  if (!snakePath || !snakePath.getTotalLength) return lut
  const totalLen = snakePath.getTotalLength()
  for (let i = 0; i <= steps; i++) {
    const pt = snakePath.getPointAtLength((i / steps) * totalLen)
    lut.push({ x: pt.x, y: pt.y })
  }
  return lut
}

/**
 * Binary search the LUT for the x value at a given y (0–100).
 * LUT is sorted by y (snake only goes downward).
 */
function getXAtY(lut, targetY) {
  if (!lut.length) return 50
  let lo = 0, hi = lut.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (lut[mid].y < targetY) lo = mid + 1
    else hi = mid
  }
  // Interpolate between lo-1 and lo for smoothness
  if (lo > 0) {
    const a = lut[lo - 1], b = lut[lo]
    const dy = b.y - a.y
    if (dy > 0) {
      const t = (targetY - a.y) / dy
      return a.x + (b.x - a.x) * t
    }
  }
  return lut[lo].x
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

  // Pre-compute lookup table (one-time, ~200 getPointAtLength calls)
  const LUT = buildPathLUT(snakePath, 200)

  // Cache section dimensions (recalc on resize)
  let sectionH = section.offsetHeight
  let vpH = window.innerHeight

  const onResize = () => {
    sectionH = section.offsetHeight
    vpH = window.innerHeight
  }
  window.addEventListener('resize', onResize, { passive: true })

  /**
   * Update traveler position using GPU-composited transform.
   * No top/left changes = no layout reflow = smooth on mobile.
   */
  function updateTraveler(scrollProgress) {
    // Viewport center's position within the section (as % of section height)
    const centerInSection = scrollProgress * (sectionH - vpH) + vpH / 2
    const yPct = (centerInSection / sectionH) * 100

    // LUT lookup — fast, no SVG calls
    const xPct = getXAtY(LUT, yPct)

    // Use transform instead of top/left — GPU composited, no layout thrash
    const xPx = (xPct / 100) * section.offsetWidth
    const yPx = (yPct / 100) * sectionH
    traveler.style.transform = `translate(${xPx}px, ${yPx}px) translate(-50%, -50%)`

    const icon = getIconForProgress(scrollProgress)
    if (traveler.textContent !== ICONS[icon]) {
      traveler.textContent = ICONS[icon]
    }
  }

  // Position at start
  updateTraveler(0)

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end:   'bottom bottom',
    scrub: true,
    onUpdate: (self) => updateTraveler(self.progress)
  })
}
