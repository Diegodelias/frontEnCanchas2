import React, { useEffect, useState } from 'react';
import { CheckCircle2, FlaskConical, Ticket, X } from 'lucide-react';
import { playsApi } from '../../services/playsApi';
import type { PlayerQuotaInfo, PlayPayment } from '../../types/quota';
import { formatPesos } from '../../utils/money';
import { Button } from '../ui/Button';

interface PackPurchaseModalProps {
  /** El cupo del jugador y el paquete vigente, o null si no se pudieron cargar. */
  quota: PlayerQuotaInfo | null;
  /** Se llama al cerrar, y al resolver un pago, para que el cupo se vuelva a leer. */
  onClose: () => void;
  onResolved: () => void;
}

type Step = 'offer' | 'checkout' | 'success';

/**
 * Oferta del paquete de jugadas extra al llegar al límite, y pantalla de pago **de demostración**: no se cobra nada ni
 * se piden datos de pago. Aprobar suma las jugadas del paquete al cupo y rechazar no suma nada.
 */
export const PackPurchaseModal: React.FC<PackPurchaseModalProps> = ({ quota, onClose, onResolved }) => {
  const [step, setStep] = useState<Step>('offer');
  const [payment, setPayment] = useState<PlayPayment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [granted, setGranted] = useState<{ plays: number; total: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onClose]);

  const pack = quota?.pack ?? null;

  const handleBuy = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      setPayment(await playsApi.startPackPurchase());
      setStep('checkout');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar la compra. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async (outcome: 'approve' | 'reject') => {
    if (busy || !payment) return;
    setBusy(true);
    setError(null);
    try {
      const resolved = await playsApi.resolvePackPurchase(payment.id, outcome);
      onResolved();
      if (outcome === 'approve') {
        setGranted({ plays: resolved.payment.plays, total: resolved.quota.total });
        setStep('success');
      } else {
        setPayment(null);
        setNotice('Pago rechazado. No se cobró nada y no se sumaron jugadas.');
        setStep('offer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos resolver el pago. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pack-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-line p-6 shadow-2xl text-ink space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-turf-soft text-turf-ink flex items-center justify-center">
            {step === 'success' ? (
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Ticket className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
            className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {step === 'offer' && (
          <>
            <div>
              <h3 id="pack-modal-title" className="font-display text-xl font-bold tracking-tight text-ink">
                Llegaste al límite de jugadas
              </h3>
              {quota ? (
                <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">
                  Tenés <span className="font-semibold text-ink">{quota.used} de {quota.total}</span> jugadas guardadas.
                  Podés borrar alguna para liberar lugar o sumar un paquete de jugadas extra.
                </p>
              ) : (
                <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">
                  Llegaste al máximo de jugadas guardadas. Borrá alguna para liberar lugar.
                </p>
              )}
            </div>

            {pack && (
              <div className="p-4 rounded-xl border border-line bg-canvas flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Paquete de {pack.plays} jugadas extra</p>
                  <p className="text-xs text-ink-muted">Se suman a tu cupo y no vencen.</p>
                </div>
                <p className="font-display text-2xl font-extrabold text-ink">{formatPesos(pack.price)}</p>
              </div>
            )}

            {notice && (
              <p role="status" className="text-sm text-ink">
                {notice}
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="pt-1 flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={onClose} disabled={busy}>
                Ahora no
              </Button>
              {pack && (
                <Button variant="volt" size="sm" onClick={() => void handleBuy()} disabled={busy}>
                  {busy ? 'Iniciando…' : 'Comprar paquete'}
                </Button>
              )}
            </div>
          </>
        )}

        {step === 'checkout' && payment && (
          <>
            <div>
              <h3 id="pack-modal-title" className="font-display text-xl font-bold tracking-tight text-ink">
                Pago de demostración
              </h3>
              <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">
                Es una simulación para la demo: no se cobra nada ni se piden datos de pago. Elegí qué resultado querés ver.
              </p>
            </div>

            <div
              className="flex items-start gap-2 p-3 rounded-lg border border-line bg-surface-muted text-xs text-ink"
              role="note"
            >
              <FlaskConical className="w-4 h-4 shrink-0 mt-0.5 text-turf" aria-hidden="true" />
              <span>
                <span className="font-semibold">Pago de demostración.</span> Mercado Pago todavía no está conectado.
              </span>
            </div>

            <div className="p-4 rounded-xl border border-line bg-canvas space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Paquete</span>
                <span className="font-semibold text-ink">{payment.plays} jugadas extra</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Total</span>
                <span className="font-display text-xl font-extrabold text-ink">{formatPesos(payment.price)}</span>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="pt-1 flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => void handleResolve('reject')} disabled={busy}>
                Rechazar pago
              </Button>
              <Button variant="volt" size="sm" onClick={() => void handleResolve('approve')} disabled={busy}>
                {busy ? 'Procesando…' : 'Aprobar pago'}
              </Button>
            </div>
          </>
        )}

        {step === 'success' && granted && (
          <>
            <div>
              <h3 id="pack-modal-title" className="font-display text-xl font-bold tracking-tight text-ink">
                ¡Listo! Sumamos {granted.plays} jugadas
              </h3>
              <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">
                Ahora podés guardar hasta <span className="font-semibold text-ink">{granted.total}</span> jugadas. Fue un
                pago de demostración: no se cobró nada.
              </p>
            </div>
            <div className="pt-1 flex justify-end">
              <Button variant="volt" size="sm" onClick={onClose}>
                Seguir
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
