import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $language } from '@/stores/language';
import { t } from '@/i18n/translations';

const WEDDING_DATE = new Date('2026-10-18T00:00:00');

function getCountdown() {
  const now = new Date();
  if (now >= WEDDING_DATE) {
    return { months: 0, days: 0, passed: true };
  }

  // Calculate months and remaining days
  let months = (WEDDING_DATE.getFullYear() - now.getFullYear()) * 12
    + (WEDDING_DATE.getMonth() - now.getMonth());

  // If the day hasn't been reached yet in the target month, subtract a month
  if (WEDDING_DATE.getDate() < now.getDate()) {
    months -= 1;
  }

  // Calculate remaining days after whole months
  const tempDate = new Date(now);
  tempDate.setMonth(tempDate.getMonth() + months);
  const diffMs = WEDDING_DATE.getTime() - tempDate.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return { months, days, passed: false };
}

export function Countdown() {
  const lang = useStore($language);
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    // Update once on mount and then daily
    setCountdown(getCountdown());
    const interval = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000 * 60 * 60); // Update every hour
    return () => clearInterval(interval);
  }, []);

  if (countdown.passed) {
    return (
      <div aria-live="polite" className="text-center">
        <p className="text-accent font-heading text-2xl">
          {t('countdown.celebration', lang)}
        </p>
      </div>
    );
  }

  const monthLabel = countdown.months === 1
    ? t('countdown.month_singular', lang)
    : t('countdown.months', lang);
  const dayLabel = countdown.days === 1
    ? t('countdown.day_singular', lang)
    : t('countdown.days', lang);

  return (
    <div aria-live="polite" className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
      {/* Months tile */}
      <div className="inline-flex flex-col items-center px-5 py-3 sm:px-6 sm:py-4 border border-accent/30 rounded-lg bg-card/50">
        <span className="text-accent font-heading text-3xl sm:text-4xl md:text-5xl">
          {countdown.months}
        </span>
        <span className="text-foreground/60 font-body text-xs sm:text-sm uppercase tracking-wider mt-1">
          {monthLabel}
        </span>
      </div>

      {/* Decorative separator */}
      <span className="text-accent/50 text-sm" aria-hidden="true">◆</span>

      {/* Days tile */}
      <div className="inline-flex flex-col items-center px-5 py-3 sm:px-6 sm:py-4 border border-accent/30 rounded-lg bg-card/50">
        <span className="text-accent font-heading text-3xl sm:text-4xl md:text-5xl">
          {countdown.days}
        </span>
        <span className="text-foreground/60 font-body text-xs sm:text-sm uppercase tracking-wider mt-1">
          {dayLabel}
        </span>
      </div>
    </div>
  );
}
