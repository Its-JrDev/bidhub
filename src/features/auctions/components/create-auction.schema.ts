import { z } from 'zod';

export const createAuctionSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría válida'),
  startingPrice: z.coerce.number().positive('El precio inicial debe ser mayor a 0'),
  minIncrement: z.coerce.number().positive('El incremento mínimo debe ser mayor a 0'),
  endsAt: z.string().refine((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) return false;
    const now = Date.now();
    const diffHours = (date.getTime() - now) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    return diffHours >= 0.99 && diffDays <= 7.05; // 1 hora a 7 días (con tolerancia)
  }, 'La fecha de cierre debe estar entre 1 hora y 7 días a partir de ahora (Regla 2)'),
  imageUrl: z.string().url('Ingresa una URL de imagen válida').optional().or(z.literal('')),
});

export type CreateAuctionFormValues = z.infer<typeof createAuctionSchema>;
