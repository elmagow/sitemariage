import { useStore } from '@nanostores/react';

import { $language } from '@/stores/language';
import { $activeEvent } from '@/stores/active-event';
import { t } from '@/i18n/translations';
import type { TranslationKey } from '@/i18n/translations';
import { getEventById } from '@/data/events';
import type { EventId } from '@/data/events';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5 border-s-2 border-accent/30 ps-3">
      <dt className="text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground font-body font-medium">
        {label}
      </dt>
      <dd className="text-sm sm:text-base font-body text-foreground">{value}</dd>
    </div>
  );
}

export function EventModal() {
  const lang = useStore($language);
  const activeEventId = useStore($activeEvent);

  const isOpen = activeEventId !== null;
  const event = activeEventId ? getEventById(activeEventId as EventId) : null;

  const handleClose = (open: boolean) => {
    if (!open) {
      $activeEvent.set(null);
    }
  };

  // Build translation key helper
  const eventKey = (suffix: string): TranslationKey => {
    if (!event) return 'hero.title'; // fallback, never rendered
    return `${event.translationKey}.${suffix}` as TranslationKey;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        aria-describedby={undefined}
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl max-w-md"
      >
        {/* Decorative gold line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent mb-4" />

        {event && (
          <>
            {/* Emoji */}
            <div className="flex justify-center pt-2">
              <span className="text-6xl" role="img" aria-hidden="true">
                {event.emoji}
              </span>
            </div>

            {/* Event name */}
            <DialogHeader className="text-center">
              <DialogTitle className="font-heading text-2xl sm:text-3xl text-foreground">
                {t(eventKey('name'), lang)}
              </DialogTitle>
            </DialogHeader>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground/80 font-body text-center px-2">
              {t(eventKey('description'), lang)}
            </p>

            {/* Details list */}
            <dl className="grid gap-5 mt-2 px-2">
              <DetailRow
                label={t('event.label_date', lang)}
                value={t(eventKey('date'), lang)}
              />
              <DetailRow
                label={t('event.label_time', lang)}
                value={t(eventKey('time'), lang)}
              />
              <DetailRow
                label={t('event.label_location', lang)}
                value={t(eventKey('location'), lang)}
              />
              <DetailRow
                label={t('event.label_address', lang)}
                value={t(eventKey('address'), lang)}
              />
              <DetailRow
                label={t('event.label_transport', lang)}
                value={t(eventKey('transport'), lang)}
              />
              <DetailRow
                label={t('event.label_dress_code', lang)}
                value={t(eventKey('dress_code'), lang)}
              />
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
