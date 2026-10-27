import { z } from 'zod';

export const categorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
