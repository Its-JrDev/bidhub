'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gavel, AlertCircle, Edit, Trash2, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Button,
  Input,
  Alert,
  AlertDescription,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  Label,
} from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils/format';

interface AuctionActionsProps {
  auctionId: string;
  sellerId: string;
  currentPrice: number;
  minIncrement: number;
  bidCount: number;
  status: string;
  endsAt: string | Date;
  currentUser: { id: string; role: string; name: string } | null;
}

export function AuctionActions({
  auctionId,
  sellerId,
  currentPrice,
  minIncrement,
  bidCount,
  status,
  currentUser,
}: AuctionActionsProps) {
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Seller cancel modal state
  const [showSellerCancel, setShowSellerCancel] = useState(false);

  // Admin moderation modal state
  const [showAdminCancel, setShowAdminCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const minRequired = bidCount === 0 ? currentPrice : currentPrice + minIncrement;
  const isSeller = currentUser?.id === sellerId;
  const isAdmin = currentUser?.role === 'ADMIN';
  const isActive = status === 'ACTIVE';

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numericAmount = parseFloat(bidAmount);
    if (isNaN(numericAmount) || numericAmount < minRequired) {
      setError(`La oferta mínima válida es de ${formatCurrency(minRequired)}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al realizar oferta');
      }

      setSuccess(
        data.extended
          ? '¡Oferta registrada con éxito! El cierre de la subasta se extendió 5 minutos por regla anti-sniping.'
          : '¡Oferta registrada con éxito!'
      );
      setBidAmount('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cancelar');
      setShowSellerCancel(false);
      setSuccess('Subasta cancelada exitosamente.');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setError('El motivo de cancelación es obligatorio.');
      return;
    }

    setAdminLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/auctions/${auctionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cancelar subasta');
      }

      setShowAdminCancel(false);
      setSuccess('Subasta cancelada por moderación administrativa.');
      setCancelReason('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Seller Management Actions (Rules 5, 14) */}
      {isSeller && (
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
            Gestión de Vendedor
          </h4>
          <div className="flex flex-wrap gap-2">
            {isActive && bidCount === 0 ? (
              <>
                <Link href={`/auctions/${auctionId}/edit`}>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Editar Subasta
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowSellerCancel(true)}
                  disabled={loading}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Cancelar Subasta
                </Button>
              </>
            ) : (
              <p className="text-xs text-amber-800">
                {bidCount > 0
                  ? 'Esta subasta ya tiene ofertas. No se puede editar ni cancelar (Regla 5 y 14).'
                  : 'Esta subasta ya no se encuentra activa.'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Admin Moderation Actions (Rules 15, 16) */}
      {isAdmin && (
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Moderación de Administrador
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Los moderadores pueden cancelar cualquier subasta activa indicando un motivo obligatorio.
              </p>
            </div>
            {isActive && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowAdminCancel(true)}
              >
                Cancelar por Moderación
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Bidding Section (Rules 6, 7, 8, 9, 11) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h3 className="font-semibold text-stone-900 text-base mb-1">
          Realizar una Oferta
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Oferta mínima requerida:{' '}
          <span className="font-bold text-stone-900">
            {formatCurrency(minRequired)}
          </span>{' '}
          (Incremento mínimo: {formatCurrency(minIncrement)})
        </p>

        {!currentUser ? (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-center">
            <p className="text-xs text-stone-600 mb-3">
              Debes iniciar sesión para participar y ofertar en esta subasta.
            </p>
            <div className="flex justify-center gap-3">
              <Link href={`/login?redirect=/auctions/${auctionId}`}>
                <Button size="sm">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="sm">Registrarse</Button>
              </Link>
            </div>
          </div>
        ) : isSeller ? (
          <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-center">
            <p className="text-xs font-medium text-stone-700">
              Eres el creador de este lote. No puedes ofertar en tu propia subasta (Regla 6).
            </p>
          </div>
        ) : !isActive ? (
          <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-center">
            <p className="text-xs font-medium text-stone-700">
              Esta subasta está cerrada o cancelada. No se aceptan más ofertas (Regla 7).
            </p>
          </div>
        ) : (
          <form onSubmit={handlePlaceBid} className="space-y-4">
            <div>
              <Label htmlFor="bidAmount" className="text-xs font-medium text-stone-700">
                Monto de tu oferta (USD)
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 font-semibold text-sm">
                  $
                </div>
                <Input
                  id="bidAmount"
                  type="number"
                  step="0.01"
                  min={minRequired}
                  placeholder={minRequired.toFixed(2)}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando oferta...
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4 mr-2" />
                  Confirmar Oferta de {bidAmount ? formatCurrency(parseFloat(bidAmount) || 0) : formatCurrency(minRequired)}
                </>
              )}
            </Button>

            <p className="text-[11px] text-stone-400 text-center leading-relaxed">
              ⏱️ <strong>Regla Anti-Sniping:</strong> Si ofertas dentro de los últimos 5 minutos, el cierre se prorrogará automáticamente 5 minutos más (Regla 11).
            </p>
          </form>
        )}
      </div>

      {/* Seller Cancel Confirm Dialog */}
      <ConfirmDialog
        open={showSellerCancel}
        onOpenChange={setShowSellerCancel}
        title="Cancelar tu Subasta"
        description="¿Estás seguro de que deseas cancelar esta subasta? Esta acción no se puede deshacer y el lote quedará cancelado permanentemente."
        confirmText="Sí, cancelar subasta"
        cancelText="Volver"
        variant="destructive"
        loading={loading}
        onConfirm={handleSellerCancel}
      />

      {/* Admin Moderation Cancel Modal */}
      <Dialog open={showAdminCancel} onOpenChange={setShowAdminCancel}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAdminCancel}>
            <DialogHeader>
              <DialogTitle className="text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Moderación: Cancelar Subasta
              </DialogTitle>
              <DialogDescription>
                Indica el motivo obligatorio por el cual estás cancelando esta subasta. Quedará registrado en la base de datos (Regla 15 y 16).
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="adminReason" className="text-xs font-semibold text-stone-700">
                Motivo de cancelación <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                id="adminReason"
                rows={3}
                placeholder="Ej. Incumplimiento de términos, artículo prohibido o reporte de falsificación..."
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
                onClick={() => setShowAdminCancel(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={adminLoading || !cancelReason.trim()}
              >
                {adminLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Confirmar Cancelación Administrativa'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
