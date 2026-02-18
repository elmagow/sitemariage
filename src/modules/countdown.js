/**
 * countdown.js
 * Simple countdown to the wedding date showing months and days only.
 * Called once from main.js; updates once per minute (no seconds needed).
 */

const WEDDING_DATE = new Date('2026-10-18T00:00:00');

function pad(n) {
  return String(n).padStart(2, '0');
}

export function initCountdown() {
  const monthsEl = document.getElementById('cd-months');
  const daysEl   = document.getElementById('cd-days');

  if (!monthsEl || !daysEl) return; // guard: elements not in DOM

  function tick() {
    const now = new Date();

    if (WEDDING_DATE <= now) {
      monthsEl.textContent = '00';
      daysEl.textContent   = '00';
      return;
    }

    // Calculate full months remaining
    let months = (WEDDING_DATE.getFullYear() - now.getFullYear()) * 12
                 + (WEDDING_DATE.getMonth() - now.getMonth());

    // Build the date that is exactly `months` months from now
    const afterMonths = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());

    // If we overshot (e.g. now is Jan 31, afterMonths would be Mar 3), step back one month
    if (afterMonths > WEDDING_DATE) months--;

    // Remaining days after subtracting whole months
    const base = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
    const diffMs = WEDDING_DATE - base;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    monthsEl.textContent = pad(months);
    daysEl.textContent   = pad(days);
  }

  tick(); // run immediately — no blank flash
  setInterval(tick, 60_000); // refresh every minute
}
