'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Layers,
  Gavel,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FolderKanban,
  FileText,
} from 'lucide-react';
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
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  ConfirmDialog,
  Alert,
  AlertDescription,
} from '@/shared/components/ui';
import { formatCurrency, formatDate } from '@/shared/utils/format';

interface Metrics {
  totalUsers: number;
  totalAuctions: number;
  activeAuctions: number;
  totalBids: number;
  totalCategories: number;
}

interface AdminAuction {
  id: string;
  title: string;
  currentPrice: number;
  status: string;
  endsAt: string;
  createdAt: string;
  cancellationReason?: string | null;
  seller?: { name: string; email: string };
  category?: { name: string };
  _count?: { bids: number };
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { auctions: number };
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [auctions, setAuctions] = useState<AdminAuction[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Moderation cancel modal
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // New category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // Delete category confirmation dialog
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteCatLoading, setDeleteCatLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [metRes, aucRes, catRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/auctions'),
        fetch('/api/categories'),
      ]);

      if (metRes.ok) {
        const m = await metRes.json();
        setMetrics(m.metrics);
      }
      if (aucRes.ok) {
        const a = await aucRes.json();
        setAuctions(a.auctions || []);
      }
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.categories || c.data || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar datos administrativos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/admin/metrics'),
      fetch('/api/auctions'),
      fetch('/api/categories'),
    ])
      .then(async ([metRes, aucRes, catRes]) => {
        if (!active) return;
        if (metRes.ok) {
          const m = await metRes.json();
          setMetrics(m.metrics);
        }
        if (aucRes.ok) {
          const a = await aucRes.json();
          setAuctions(a.auctions || []);
        }
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c.categories || c.data || []);
        }
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Error al cargar datos administrativos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleModerationCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuctionId || !cancelReason.trim()) {
      setError('El motivo de cancelación es obligatorio (Regla 15).');
      return;
    }

    setCancelLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/auctions/${selectedAuctionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar la subasta');

      setSuccess('Subasta cancelada correctamente por moderación.');
      setSelectedAuctionId(null);
      setCancelReason('');
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCatLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear categoría');

      setSuccess(`Categoría "${newCatName}" creada exitosamente.`);
      setNewCatName('');
      setShowCategoryModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;

    setDeleteCatLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/categories/${deleteCatId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar categoría');

      setSuccess('Categoría eliminada exitosamente.');
      setDeleteCatId(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleteCatLoading(false);
    }
  };

  const statItems: StatItem[] = [
    {
      title: 'Subastas Activas',
      value: metrics?.activeAuctions ?? 0,
      description: 'Lotes recibiendo ofertas en vivo',
      icon: Gavel,
    },
    {
      title: 'Total Subastas',
      value: metrics?.totalAuctions ?? 0,
      description: 'Histórico global registrado',
      icon: Layers,
    },
    {
      title: 'Pujas Totales',
      value: metrics?.totalBids ?? 0,
      description: 'Ofertas emitidas en la plataforma',
      icon: FileText,
    },
    {
      title: 'Categorías Activas',
      value: metrics?.totalCategories ?? categories.length,
      description: 'Secciones de colección creadas',
      icon: FolderKanban,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" data-testid="admin-page">
      <PageHeader
        title="Panel de Administración y Moderación"
        description="Gestión integral de categorías, supervisión de lotes y moderación de subastas con auditoría de motivos (Reglas 15, 16 y 17)."
        badge={
          <Badge variant="destructive" className="ml-2 font-mono text-[10px] tracking-wider uppercase">
            Rol: Administrador
          </Badge>
        }
        className="mb-8"
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-emerald-500/20 bg-emerald-500/10 text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="mb-10">
        <StatsGrid stats={statItems} columns={4} />
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="moderation" className="space-y-6">
        <TabsList className="bg-stone-100 p-1 rounded-xl">
          <TabsTrigger value="moderation" className="rounded-lg text-xs font-semibold px-4 py-2">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Moderación de Subastas ({auctions.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg text-xs font-semibold px-4 py-2">
            <FolderKanban className="w-3.5 h-3.5 mr-1.5" />
            Gestión de Categorías ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Auctions Moderation */}
        <TabsContent value="moderation">
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-stone-600">Lote</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600">Vendedor</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600">Categoría</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600 text-right">Precio Actual</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600 text-center">Ofertas</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600 text-right">Moderación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.map((a) => {
                  const isActive = a.status === 'ACTIVE';
                  const isCancelled = a.status === 'CANCELLED';

                  return (
                    <TableRow key={a.id} className="hover:bg-stone-50/60">
                      <TableCell className="max-w-xs">
                        <p className="font-semibold text-stone-900 text-xs truncate">{a.title}</p>
                        {isCancelled && a.cancellationReason && (
                          <p className="text-[11px] text-rose-600 mt-0.5 line-clamp-1 italic">
                            Motivo: {a.cancellationReason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-stone-600">
                        {a.seller?.name || 'Desconocido'}
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
                        {a._count?.bids ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/auctions/${a.id}`}>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          {isActive && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => setSelectedAuctionId(a.id)}
                            >
                              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Category Management */}
        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-stone-500">
              Categorías de colección donde los usuarios clasifican sus subastas.
            </p>
            <Button
              size="sm"
              onClick={() => setShowCategoryModal(true)}
              className="bg-stone-900 text-white hover:bg-stone-800 text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Nueva Categoría
            </Button>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-stone-50">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-stone-600">Nombre de la Categoría</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600">Slug</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600 text-center">Subastas Asociadas</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-600 text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => {
                  const count = c._count?.auctions ?? 0;
                  const canDelete = count === 0;

                  return (
                    <TableRow key={c.id} className="hover:bg-stone-50/60">
                      <TableCell className="font-semibold text-stone-900 text-xs">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-stone-500">
                        {c.slug}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        <Badge variant={count > 0 ? 'secondary' : 'outline'} className="text-[11px]">
                          {count} lote{count === 1 ? '' : 's'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeleteCatId(c.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Eliminar
                          </Button>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic" title="Regla 17: No se puede eliminar una categoría con subastas asociadas.">
                            Protegida (Regla 17)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Moderation Cancel Modal (Rule 15) */}
      <Dialog open={Boolean(selectedAuctionId)} onOpenChange={(open) => !open && setSelectedAuctionId(null)}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleModerationCancel}>
            <DialogHeader>
              <DialogTitle className="text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Cancelar Subasta por Moderación
              </DialogTitle>
              <DialogDescription>
                Esta acción cancelará inmediatamente el lote, incluso si ya posee ofertas de otros usuarios. El motivo quedará públicamente registrado (Regla 15).
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="reason" className="text-xs font-semibold text-stone-700">
                Motivo Obligatorio de Cancelación <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Indica la razón: sospecha de fraude, reporte de réplica no declarada, incumplimiento de normativas..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAuctionId(null)}
              >
                Volver
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelLoading || !cancelReason.trim()}
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar Cancelación por Moderación'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleCreateCategory}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-amber-500" />
                Nueva Categoría
              </DialogTitle>
              <DialogDescription>
                Crea una nueva clasificación para que los coleccionistas puedan publicar sus lotes.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="catName" className="text-xs font-semibold text-stone-700">
                Nombre de la Categoría <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="catName"
                placeholder="Ej. Numismática, Cómics, Memorabilia..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-stone-900 text-white hover:bg-stone-800"
                disabled={catLoading || !newCatName.trim()}
              >
                {catLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Categoría'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog (Rule 17) */}
      <ConfirmDialog
        open={Boolean(deleteCatId)}
        onOpenChange={(open) => !open && setDeleteCatId(null)}
        title="Eliminar Categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría vacía? Esta acción es irreversible."
        confirmText="Sí, eliminar categoría"
        cancelText="Cancelar"
        variant="destructive"
        loading={deleteCatLoading}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
