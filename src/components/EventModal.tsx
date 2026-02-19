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
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium font-body text-muted-foreground uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm font-body text-foreground">{value}</dd>
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
        className="bg-card border-t-4 border-accent rounded-2xl shadow-xl max-w-md"
      >
        {event && (
          <>
            {/* Emoji */}
            <div className="flex justify-center pt-2">
              <span className="text-5xl" role="img" aria-hidden="true">
                {event.emoji}
              </span>
            </div>

            {/* Event name */}
            <DialogHeader className="text-center">
              <DialogTitle className="font-heading text-2xl text-foreground">
                {t(eventKey('name'), lang)}
              </DialogTitle>
            </DialogHeader>

            {/* Description */}
            <p className="text-sm text-muted-foreground font-body text-center px-2">
              {t(eventKey('description'), lang)}
            </p>

            {/* Details list */}
            <dl className="grid gap-4 mt-2 px-2">
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
