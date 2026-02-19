import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { $language } from '@/stores/language';
import { $rsvpOpen } from '@/stores/rsvp-open';
import { t } from '@/i18n/translations';
import type { TranslationKey } from '@/i18n/translations';
import { rsvpSchema, type RsvpFormData } from '@/schemas/rsvp';
import { events } from '@/data/events';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const GAS_URL = import.meta.env.PUBLIC_GAS_URL || 'PASTE_YOUR_GAS_URL_HERE';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function RsvpForm() {
  const lang = useStore($language);
  const isOpen = useStore($rsvpOpen);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: '',
      email: '',
      events: [],
      guestCount: 0,
      dietary: '',
      message: '',
    },
  });

  const handleClose = (open: boolean) => {
    if (!open) {
      $rsvpOpen.set(false);
      // Only reset form if submission was successful
      if (status === 'success') {
        reset();
        setStatus('idle');
      }
    }
  };

  const onSubmit = async (data: RsvpFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      // Create URLSearchParams — NEVER FormData
      const params = new URLSearchParams();
      params.set('name', data.name);
      params.set('email', data.email);
      params.set('events', data.events.join(','));
      params.set('guestCount', String(data.guestCount));
      params.set('dietary', data.dietary ?? '');
      params.set('message', data.message ?? '');

      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        signal: controller.signal,
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error && err.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : t('rsvp.error_message', lang)
      );
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        aria-describedby={undefined}
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain"
      >
        {/* Decorative gold line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent mb-4" />

        {status === 'success' ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="text-5xl" role="img" aria-hidden="true">
              🎉
            </span>
            <h2 className="font-heading text-3xl text-accent">
              {t('rsvp.success_title', lang)}
            </h2>
            <p className="text-muted-foreground/80 font-body">
              {t('rsvp.success_message', lang)}
            </p>
            <Button
              type="button"
              onClick={() => handleClose(false)}
              className="btn-primary min-h-11 mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              ✓
            </Button>
          </div>
        ) : (
          /* ── Form state (idle / submitting / error) ── */
          <>
            <DialogHeader className="text-center">
              <DialogTitle className="font-heading text-2xl sm:text-3xl text-foreground">
                {t('rsvp.title', lang)}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80 font-body">
                {t('rsvp.subtitle', lang)}
              </DialogDescription>
            </DialogHeader>

            {/* Error banner */}
            {status === 'error' && (
              <div
                className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center"
                role="alert"
              >
                <p className="font-heading font-semibold text-primary">
                  {t('rsvp.error_title', lang)}
                </p>
                <p className="text-sm text-foreground mt-1 font-body">
                  {errorMessage || t('rsvp.error_message', lang)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetry}
                  className="min-h-11 mt-3"
                >
                  {t('rsvp.error_retry', lang)}
                </Button>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-5"
            >
              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rsvp-name" className="font-body font-medium text-foreground/80 text-sm">
                  {t('rsvp.name_label', lang)}
                </Label>
                <Input
                  id="rsvp-name"
                  {...register('name')}
                  autoComplete="name"
                  placeholder={t('rsvp.name_placeholder', lang)}
                  disabled={status === 'submitting'}
                  aria-invalid={!!errors.name}
                  className="min-h-11 bg-background/60 border-border/60 focus:border-accent"
                />
                {errors.name && (
                  <p className="text-xs text-primary font-body" role="alert">
                    {t('rsvp.error_name_required', lang)}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rsvp-email" className="font-body font-medium text-foreground/80 text-sm">
                  {t('rsvp.email_label', lang)}
                </Label>
                <Input
                  id="rsvp-email"
                  type="email"
                  {...register('email')}
                  autoComplete="email"
                  spellCheck={false}
                  placeholder={t('rsvp.email_placeholder', lang)}
                  disabled={status === 'submitting'}
                  aria-invalid={!!errors.email}
                  className="min-h-11 bg-background/60 border-border/60 focus:border-accent"
                />
                {errors.email && (
                  <p className="text-xs text-primary font-body" role="alert">
                    {t('rsvp.error_email_invalid', lang)}
                  </p>
                )}
              </div>

              {/* Events attending */}
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium font-body mb-1">
                  {t('rsvp.events_label', lang)}
                </legend>
                <Controller
                  name="events"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-3">
                      {events.map((event) => {
                        const isChecked = field.value.includes(event.id);
                        return (
                          <label
                            key={event.id}
                            className="flex items-center gap-3 min-h-11 cursor-pointer hover:bg-background/40 rounded-lg px-2 -mx-2 transition-colors"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const updated = checked
                                  ? [...field.value, event.id]
                                  : field.value.filter(
                                      (id: string) => id !== event.id
                                    );
                                field.onChange(updated);
                              }}
                              disabled={status === 'submitting'}
                              className="size-5"
                            />
                            <span className="font-body text-sm text-foreground">
                              {event.emoji}{' '}
                              {t(
                                `${event.translationKey}.name` as TranslationKey,
                                lang
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.events && (
                  <p className="text-xs text-primary font-body" role="alert">
                    {t('rsvp.error_events_required', lang)}
                  </p>
                )}
              </fieldset>

              {/* Additional guests */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rsvp-guests" className="font-body font-medium text-foreground/80 text-sm">
                  {t('rsvp.guests_label', lang)}
                </Label>
                <p className="text-xs text-muted-foreground font-body">
                  {t('rsvp.guests_description', lang)}
                </p>
                <Input
                  id="rsvp-guests"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={9}
                  {...register('guestCount', { valueAsNumber: true })}
                  autoComplete="off"
                  disabled={status === 'submitting'}
                  className="min-h-11 max-w-24 bg-background/60 border-border/60 focus:border-accent"
                />
              </div>

              {/* Dietary requirements */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="rsvp-dietary"
                  className="font-body font-medium text-foreground/80 text-sm"
                >
                  {t('rsvp.dietary_label', lang)}
                </Label>
                <Textarea
                  id="rsvp-dietary"
                  {...register('dietary')}
                  placeholder={t('rsvp.dietary_placeholder', lang)}
                  disabled={status === 'submitting'}
                  rows={2}
                  className="min-h-11 bg-background/60 border-border/60 focus:border-accent"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="rsvp-message"
                  className="font-body font-medium text-foreground/80 text-sm"
                >
                  {t('rsvp.message_label', lang)}
                </Label>
                <Textarea
                  id="rsvp-message"
                  {...register('message')}
                  placeholder={t('rsvp.message_placeholder', lang)}
                  disabled={status === 'submitting'}
                  rows={3}
                  className="min-h-11 bg-background/60 border-border/60 focus:border-accent"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-primary min-h-11 w-full rounded-xl bg-primary text-primary-foreground font-heading uppercase tracking-wider hover:bg-primary/90 transition-colors"
              >
                {status === 'submitting' ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('rsvp.submitting', lang)}
                  </span>
                ) : (
                  t('rsvp.submit', lang)
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
