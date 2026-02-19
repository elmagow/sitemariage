import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $language } from '@/stores/language';
import { t } from '@/i18n/translations';
import { cn } from '@/lib/utils';

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
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    // Hydration-safe: update on mount to sync server/client date
    setMounted(true);
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
    <div aria-live="polite" className="flex items-center justify-center gap-3 sm:gap-5 flex-wrap">
      {/* Months tile */}
      <div
        className={cn(
          'inline-flex flex-col items-center px-7 py-4 sm:px-8 sm:py-5',
          'bg-gradient-to-b from-card/80 to-card/40',
          'border border-accent/20 rounded-xl shadow-sm',
        )}
      >
        <span
          className="text-accent font-heading text-4xl sm:text-5xl md:text-6xl tabular-nums"
          suppressHydrationWarning
        >
          {countdown.months}
        </span>
        <span className="text-foreground/50 font-body text-xs uppercase tracking-[0.15em] mt-1.5">
          {monthLabel}
        </span>
      </div>

      {/* Decorative separator */}
      <span className="text-accent/60 text-base select-none" aria-hidden="true">✧</span>

      {/* Days tile */}
      <div
        className={cn(
          'inline-flex flex-col items-center px-7 py-4 sm:px-8 sm:py-5',
          'bg-gradient-to-b from-card/80 to-card/40',
          'border border-accent/20 rounded-xl shadow-sm',
        )}
      >
        <span
          className="text-accent font-heading text-4xl sm:text-5xl md:text-6xl tabular-nums"
          suppressHydrationWarning
        >
          {countdown.days}
        </span>
        <span className="text-foreground/50 font-body text-xs uppercase tracking-[0.15em] mt-1.5">
          {dayLabel}
        </span>
      </div>
    </div>
  );
}
