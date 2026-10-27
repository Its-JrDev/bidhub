import { z } from 'zod';

export const placeBidSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type PlaceBidFormValues = z.infer<typeof placeBidSchema>;
