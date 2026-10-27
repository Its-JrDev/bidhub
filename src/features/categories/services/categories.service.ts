import { db } from '@/lib/db';

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
}

export const categoriesService = {
  /**
   * List all categories with their total auction count.
   */
  async list() {
    return await db.category.findMany({
      include: {
        _count: {
          select: { auctions: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Get single category by ID.
   */
  async getById(id: string) {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { auctions: true },
        },
      },
    });
    if (!category) {
      const error = new Error('Categoría no encontrada.');
      (error as any).status = 404;
      throw error;
    }
    return category;
  },

  /**
   * Create a category (Admin only).
   */
  async create(data: CreateCategoryDTO) {
    const slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const existing = await db.category.findFirst({
      where: {
        OR: [{ name: data.name.trim() }, { slug }],
      },
    });

    if (existing) {
      const error = new Error('Ya existe una categoría con ese nombre o slug.');
      (error as any).status = 409;
      throw error;
    }

    return await db.category.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
      },
    });
  },

  /**
   * Update a category (Admin only).
   */
  async update(id: string, data: UpdateCategoryDTO) {
    const category = await db.category.findUnique({ where: { id } });
    if (!category) {
      const error = new Error('Categoría no encontrada.');
      (error as any).status = 404;
      throw error;
    }

    return await db.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
      },
    });
  },

  /**
   * Delete a category (Admin only) enforcing Rule 17.
   */
  async delete(id: string) {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: { select: { auctions: true } },
      },
    });

    if (!category) {
      const error = new Error('Categoría no encontrada.');
      (error as any).status = 404;
      throw error;
    }

    // Rule 17: Category with associated auctions CANNOT be deleted
    if (category._count.auctions > 0) {
      const error = new Error('No se puede eliminar una categoría que tiene subastas asociadas.');
      (error as any).status = 409;
      throw error;
    }

    return await db.category.delete({
      where: { id },
    });
  },
};
