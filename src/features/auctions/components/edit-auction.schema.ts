import { z } from 'zod';

export const editAuctionSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría válida'),
  startingPrice: z.coerce.number().positive('El precio inicial debe ser mayor a 0').optional(),
  minIncrement: z.coerce.number().positive('El incremento mínimo debe ser mayor a 0').optional(),
  imageUrl: z.string().url('Ingresa una URL de imagen válida').optional().or(z.literal('')),
});

export type EditAuctionFormValues = z.infer<typeof editAuctionSchema>;
