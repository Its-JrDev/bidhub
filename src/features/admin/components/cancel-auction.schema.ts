import { z } from 'zod';

export const cancelAuctionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type CancelAuctionFormValues = z.infer<typeof cancelAuctionSchema>;
