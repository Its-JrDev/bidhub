'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gavel,
  Package,
  PlusCircle,
  Clock,
  CheckCircle,
  ExternalLink,
  Edit,
  Loader2,
} from 'lucide-react';
import { useCurrentUser } from '@/shared/hooks';
import {
  PageHeader,
  StatsGrid,
  StatItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  StatusBadge,
  EmptyState,
  Button,
} from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils/format';

interface UserAuction {
  id: string;
  title: string;
  startingPrice: number;
  currentPrice: number;
  status: string;
  endsAt: string;
  createdAt: string;
  _count?: { bids: number };
  category?: { name: string };
}

interface UserBid {
  id: string;
  amount: number;
  createdAt: string;
  auction: {
    id: string;
    title: string;
    status: string;
    endsAt: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [auctions, setAuctions] = useState<UserAuction[]>([]);
  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const [auctionsRes, bidsRes] = await Promise.all([
        fetch(`/api/auctions?sellerId=${user.id}`),
        fetch('/api/bids/me'),
      ]);

      if (auctionsRes.ok) {
        const data = await auctionsRes.json();
        setAuctions(data.auctions || []);
      }

      if (bidsRes.ok) {
        const data = await bidsRes.json();
        setBids(data.bids || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived stats
  const activeAuctions = auctions.filter((a) => a.status === 'ACTIVE').length;
  const closedAuctions = auctions.filter((a) => a.status === 'CLOSED').length;
  const totalBidVolume = bids.reduce((acc, b) => acc + Number(b.amount || 0), 0);

  const stats: StatItem[] = [
    {
      title: 'Mis Subastas Activas',
      value: `${activeAuctions} / 5`,
      description: 'Límite de 5 simultáneas (Regla 4)',
      icon: Package,
    },
    {
      title: 'Subastas Cerradas con Éxito',
      value: closedAuctions,
      description: 'Lotes adjudicados a postores',
      icon: CheckCircle,
    },
    {
      title: 'Pujas Realizadas',
      value: bids.length,
      description: 'Total de ofertas emitidas',
      icon: Gavel,
    },
    {
      title: 'Volumen Ofertado',
      value: formatCurrency(totalBidVolume),
      description: 'Capital en juego y adjudicado',
      icon: Clock,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" data-testid="dashboard-page">
      <PageHeader
        title="Mi Panel de Usuario"
        description={`Bienvenido de nuevo, ${user?.name || 'Coleccionista'}. Administra tus lotes a subasta y el seguimiento de tus pujas en vivo.`}
        actions={
          <Link href="/auctions/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Publicar Nuevo Lote
            </Button>
          </Link>
        }
        className="mb-8"
      />

      {/* KPI Stats Grid */}
      <div className="mb-10">
        <StatsGrid stats={stats} columns={4} />
      </div>

      {/* Tabs: My Auctions & My Bids */}
      <Tabs defaultValue="auctions" className="space-y-6">
        <TabsList className="bg-stone-100 p-1 rounded-xl">
          <TabsTrigger value="auctions" className="rounded-lg text-xs font-semibold px-4 py-2">
            <Package className="w-3.5 h-3.5 mr-1.5" />
            Mis Subastas ({auctions.length})
          </TabsTrigger>
          <TabsTrigger value="bids" className="rounded-lg text-xs font-semibold px-4 py-2">
            <Gavel className="w-3.5 h-3.5 mr-1.5" />
            Mis Ofertas ({bids.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: My Auctions */}
        <TabsContent value="auctions">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Cargando tus subastas...
            </div>
          ) : auctions.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No tienes subastas publicadas"
              description="Aún no has publicado ningún artículo para subasta. ¡Comienza ahora y alcanza a cientos de coleccionistas!"
              action={{
                label: 'Publicar Primera Subasta',
                onClick: () => router.push('/auctions/new'),
              }}
            />
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-stone-600">Lote</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600">Categoría</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600">Estado</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600 text-right">Precio Actual</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600 text-center">Ofertas</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600">Cierre</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map((a) => {
                    const bidCount = a._count?.bids ?? 0;
                    const canEdit = a.status === 'ACTIVE' && bidCount === 0;

                    return (
                      <TableRow key={a.id} className="hover:bg-stone-50/60">
                        <TableCell className="font-semibold text-stone-900 text-xs max-w-xs truncate">
                          {a.title}
                        </TableCell>
                        <TableCell className="text-xs text-stone-600">
                          {a.category?.name || 'General'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={a.status} />
                        </TableCell>
                        <TableCell className="text-xs font-bold text-stone-900 text-right">
                          {formatCurrency(a.currentPrice)}
                        </TableCell>
                        <TableCell className="text-xs text-stone-600 text-center">
                          {bidCount}
                        </TableCell>
                        <TableCell className="text-xs text-stone-500">
                          {formatDate(a.endsAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEdit && (
                              <Link href={`/auctions/${a.id}/edit`}>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-stone-600 hover:text-stone-900">
                                  <Edit className="w-3.5 h-3.5 mr-1" />
                                  Editar
                                </Button>
                              </Link>
                            )}
                            <Link href={`/auctions/${a.id}`}>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: My Bids (Rule 20) */}
        <TabsContent value="bids">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Cargando tus ofertas...
            </div>
          ) : bids.length === 0 ? (
            <EmptyState
              icon={Gavel}
              title="Aún no has participado en ninguna puja"
              description="Explora el catálogo de coleccionables y realiza tu primera oferta para ganar piezas exclusivas."
              action={{
                label: 'Explorar Catálogo',
                onClick: () => router.push('/auctions'),
              }}
            />
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-stone-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-stone-600">Subasta</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600">Estado Subasta</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600 text-right">Monto Ofertado</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600">Fecha de la Puja</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-600 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((b) => (
                    <TableRow key={b.id} className="hover:bg-stone-50/60">
                      <TableCell className="font-semibold text-stone-900 text-xs">
                        {b.auction?.title}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={b.auction?.status} />
                      </TableCell>
                      <TableCell className="text-xs font-bold text-amber-700 text-right">
                        {formatCurrency(b.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-stone-500">
                        {formatDate(b.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/auctions/${b.auction?.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Ver Subasta
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
