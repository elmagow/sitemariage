import { z } from 'zod';

export const rsvpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  events: z.array(z.string()).min(1),
  guestCount: z.number().int().min(0).max(9),
  dietary: z.string(),
  message: z.string(),
});

export type RsvpFormData = z.infer<typeof rsvpSchema>;
