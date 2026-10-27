import { PrismaClient, Role, AuctionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BidHub database...');

  // 1. Password hashing
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const userPasswordHash = await bcrypt.hash('User123!', 10);

  // 2. Users (Admin and sample collectors)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bidhub.com' },
    update: {},
    create: {
      email: 'admin@bidhub.com',
      name: 'Administrador BidHub',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: 'carlos@example.com' },
    update: {},
    create: {
      email: 'carlos@example.com',
      name: 'Carlos Mendoza',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  const bidder1 = await prisma.user.upsert({
    where: { email: 'sofia@example.com' },
    update: {},
    create: {
      email: 'sofia@example.com',
      name: 'Sofía Valenzuela',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  const bidder2 = await prisma.user.upsert({
    where: { email: 'lucas@example.com' },
    update: {},
    create: {
      email: 'lucas@example.com',
      name: 'Lucas Duarte',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  console.log('✅ Users created:', { admin: admin.email, seller1: seller1.email, bidder1: bidder1.email, bidder2: bidder2.email });

  // 3. Categories
  const categoriesData = [
    { name: 'Cartas Coleccionables', slug: 'cartas', description: 'Pokémon, Magic: The Gathering, Yu-Gi-Oh! y tarjetas deportivas certificadas.' },
    { name: 'Relojes Vintage', slug: 'relojes', description: 'Piezas mecánicas y automáticas de alta relojería de colección.' },
    { name: 'Discos de Vinilo', slug: 'vinilos', description: 'Primeras prensadas, ediciones limitadas y vinilos de colección.' },
    { name: 'Figuras de Acción', slug: 'figuras', description: 'Estatuas, figuras escala y juguetes vintage en su empaque original.' },
    { name: 'Arte y Antigüedades', slug: 'arte', description: 'Pinturas, monedas raras y objetos históricos de colección.' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log('✅ Categories seeded:', Object.keys(categories).length);

  // 4. Sample Auctions in all 4 states (ACTIVE, CLOSED, DESERTED, CANCELLED)
  const now = new Date();

  // 4.1 Subasta ACTIVA (Cartas) con ofertas
  const activeAuction = await prisma.auction.create({
    data: {
      title: 'Charizard 1st Edition Base Set Shadowless PSA 9 (1999)',
      description: 'Carta holográfica certificada por PSA grado 9 Mint. Estado impecable con estuche sellado original.',
      imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80',
      startingPrice: 500.0,
      minIncrement: 25.0,
      endsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // En 3 días
      status: AuctionStatus.ACTIVE,
      sellerId: seller1.id,
      categoryId: categories['cartas'],
      bids: {
        create: [
          {
            amount: 500.0,
            bidderId: bidder1.id,
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          },
          {
            amount: 550.0,
            bidderId: bidder2.id,
            createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          },
          {
            amount: 600.0,
            bidderId: bidder1.id,
            createdAt: new Date(now.getTime() - 30 * 60 * 1000),
          },
        ],
      },
    },
  });

  // 4.2 Subasta ACTIVA (Relojes) sin ofertas aún
  await prisma.auction.create({
    data: {
      title: 'Seiko 6139-6002 "Pogue" Chronograph Original (1974)',
      description: 'El primer cronógrafo automático en el espacio. Esfera dorada original, bisel Pepsi sin restaurar.',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      startingPrice: 750.0,
      minIncrement: 50.0,
      endsAt: new Date(now.getTime() + 18 * 60 * 60 * 1000), // En 18 horas
      status: AuctionStatus.ACTIVE,
      sellerId: seller1.id,
      categoryId: categories['relojes'],
    },
  });

  // 4.3 Subasta CERRADA (Vinilos) con ganador
  await prisma.auction.create({
    data: {
      title: 'Pink Floyd - The Dark Side of the Moon (1st UK Pressing, 1973)',
      description: 'Matriz A2/B2, prisma sólido en etiqueta Harvest. Incluye los 2 pósters y los 2 stickers originales.',
      imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
      startingPrice: 120.0,
      minIncrement: 10.0,
      endsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Cerró ayer
      status: AuctionStatus.CLOSED,
      sellerId: seller1.id,
      categoryId: categories['vinilos'],
      bids: {
        create: [
          {
            amount: 120.0,
            bidderId: bidder2.id,
            createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
          },
          {
            amount: 150.0,
            bidderId: bidder1.id,
            createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
          },
        ],
      },
    },
  });

  // 4.4 Subasta DESIERTA (Figuras) - Cerró sin ofertas
  await prisma.auction.create({
    data: {
      title: 'Sideshow Collectibles Darth Vader Mythos Statue 1/4',
      description: 'Estatua numerada de coleccionista. Caja de arte original y empaque de transporte.',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      startingPrice: 850.0,
      minIncrement: 50.0,
      endsAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // Cerró hace 2 días
      status: AuctionStatus.DESERTED,
      sellerId: seller1.id,
      categoryId: categories['figuras'],
    },
  });

  // 4.5 Subasta CANCELADA por moderador con motivo
  await prisma.auction.create({
    data: {
      title: 'Rolex Submariner 16610 No-Date Vintage (Año 1991)',
      description: 'Reloj vintage con pátina natural en marcadores tritium.',
      imageUrl: 'https://images.unsplash.com/photo-1547996160-71dfabb1d5b1?auto=format&fit=crop&w=800&q=80',
      startingPrice: 3200.0,
      minIncrement: 100.0,
      endsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: AuctionStatus.CANCELLED,
      cancellationReason: 'Subasta cancelada por moderación: sospecha de dial no original y falta de documentación de procedencia.',
      sellerId: seller1.id,
      categoryId: categories['relojes'],
    },
  });

  console.log('✅ Seed completed successfully with 5 sample auctions across all 4 states.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
