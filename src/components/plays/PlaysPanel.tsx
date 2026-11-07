import React, { useState } from 'react';
import {
  Bookmark,
  Check,
  CheckCircle2,
  Film,
  Mail,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlays } from '../../context/PlaysContext';
import { useToast } from '../../context/ToastContext';
import { SavedPlay } from '../../types/play';
import { Button } from '../ui/Button';
import { DeletePlayDialog } from './DeletePlayDialog';
import { PlayCard } from './PlayCard';

interface PlaysPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySelected: (play: SavedPlay) => void;
  onShareSelected: (play: SavedPlay) => void;
  onTriggerSavePlay: () => void;
  matchId?: string;
}

export const PlaysPanel: React.FC<PlaysPanelProps> = ({
  isOpen,
  onClose,
  onPlaySelected,
  onShareSelected,
  onTriggerSavePlay,
  matchId,
}) => {
  const { authMode, user, sendMagicLink, setAuthMode } = useAuth();
  const { savedPlays, deletePlay, updatePlay, assignAllPlaysToUser } = usePlays();
  const { showToast } = useToast();

  const [playToDelete, setPlayToDelete] = useState<SavedPlay | null>(null);
  const [editingPlay, setEditingPlay] = useState<SavedPlay | null>(null);
  const [editingTitleText, setEditingTitleText] = useState<string>('');

  // Guest email magic link inside panel
  const [guestEmail, setGuestEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter plays if matchId is supplied (show all or match plays)
  const plays = matchId
    ? savedPlays.filter((p) => p.matchId === matchId || p.isLiveMoment)
    : savedPlays;

  const handleDeleteConfirm = async () => {
    if (!playToDelete) return;
    const title = playToDelete.title;
    await deletePlay(playToDelete.id);
    setPlayToDelete(null);
    showToast({
      type: 'info',
      title: 'Jugada eliminada',
      message: `"${title}" se eliminó de tus jugadas guardadas.`,
      durationMs: 3000,
    });
  };

  const handleStartEditTitle = (play: SavedPlay) => {
    setEditingPlay(play);
    setEditingTitleText(play.title);
  };

  const handleSaveEditTitle = async () => {
    if (!editingPlay) return;
    const trimmed = editingTitleText.trim();
    if (trimmed && trimmed !== editingPlay.title) {
      await updatePlay(editingPlay.id, { title: trimmed });
      showToast({
        type: 'success',
        title: 'Nombre actualizado',
        message: `La jugada ahora se llama "${trimmed}".`,
        durationMs: 2500,
      });
    }
    setEditingPlay(null);
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.includes('@')) return;

    setIsSendingEmail(true);
    try {
      await sendMagicLink(guestEmail);
      setAuthMode('registered');
      await assignAllPlaysToUser();
      setEmailSentSuccess(true);
      showToast({
        type: 'success',
        title: '¡Enlace mágico enviado!',
        message: `Enviamos el acceso a ${guestEmail}. Tus jugadas ya están sincronizadas.`,
        durationMs: 4500,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plays-panel-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[85vh] rounded-2xl bg-[#121815]/95 border border-white/15 text-white flex flex-col shadow-2xl backdrop-blur-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar matching 1_0134639b.png and 7_fa7d0ba7.png */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="w-6" aria-hidden="true" />
          <h3
            id="plays-panel-title"
            className="font-display text-lg font-bold tracking-tight text-white text-center flex-1"
          >
            Jugadas
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de jugadas"
            className="w-7 h-7 rounded-lg text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Edit Title Dialog Modal (if active) */}
          {editingPlay && (
            <div className="p-3.5 rounded-xl bg-pitch-elevated border border-volt/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-volt">
                  Editar nombre
                </span>
                <button
                  type="button"
                  onClick={() => setEditingPlay(null)}
                  className="text-pitch-muted hover:text-pitch-ink p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={editingTitleText}
                onChange={(e) => setEditingTitleText(e.target.value)}
                maxLength={60}
                className="w-full h-10 px-3 rounded-lg bg-pitch border border-pitch-line text-sm text-pitch-ink focus:outline-none focus:border-volt"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingPlay(null)}>
                  Cancelar
                </Button>
                <Button variant="volt" size="sm" onClick={handleSaveEditTitle}>
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {/* Empty state (exact match to 1_0134639b.png) */}
          {plays.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-white/15 bg-white/5 text-center text-xs text-white/80 leading-relaxed">
              Todavía no grabaste jugadas. Tocá el botón rojo para grabar una y compartirla.
            </div>
          ) : (
            /* Populated plays list (exact match to 7_fa7d0ba7.png) */
            <div className="space-y-2">
              {plays.map((play, idx) => (
                <PlayCard
                  key={play.id}
                  play={play}
                  indexNumber={idx + 1}
                  layout="compact"
                  onPlay={onPlaySelected}
                  onShare={onShareSelected}
                  onDelete={() => setPlayToDelete(play)}
                  onEditTitle={handleStartEditTitle}
                />
              ))}
            </div>
          )}

          {/* Highlights / Applause detection row matching 1_0134639b.png & 7_fa7d0ba7.png */}
          <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-white/90">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">👏</span>
              <span>19 aplausos detectados</span>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast({
                  type: 'info',
                  title: 'Momentos destacados',
                  message: 'El sistema acústico detectó 19 momentos de ovación en el partido.',
                  durationMs: 3500,
                });
              }}
              className="text-xs font-bold text-[#f59e0b] hover:underline cursor-pointer"
            >
              Ver
            </button>
          </div>

          {/* Guest Cloud Save Banner (matches reference 1_0134639b.png) */}
          {authMode === 'guest' && !emailSentSuccess ? (
            <div className="p-4 rounded-xl bg-black/40 border border-[#f59e0b]/40 space-y-3">
              <h4 className="font-display text-sm font-bold tracking-tight text-white">
                Guardá tus jugadas en la nube
              </h4>
              <form onSubmit={handleMagicLinkSubmit} className="space-y-2.5">
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Tu email"
                  className="w-full h-10 px-3 rounded-lg bg-[#1f2824] border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#f59e0b]"
                />
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-full h-10 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black font-display font-extrabold text-xs uppercase tracking-wider flex items-center justify-center transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSendingEmail ? 'Enviando enlace...' : 'CREAR MI PERFIL GRATIS'}
                </button>
              </form>
              <p className="text-[11px] text-white/60 text-center">
                Te mandamos un link para entrar.
              </p>
            </div>
          ) : (
            /* Registered / synced confirmation matching 7_fa7d0ba7.png */
            <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-white/90">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold" aria-hidden="true">✔</span>
                <span>Guardadas en tu perfil</span>
              </div>
              <a
                href="/perfil"
                className="text-xs font-bold text-[#f59e0b] hover:underline flex items-center gap-1"
              >
                <span>Ver</span>
                <span aria-hidden="true" className="text-[10px]">↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        <div className="p-3.5 border-t border-white/10 bg-black/40 flex items-center justify-center">
          <Button
            variant="volt"
            size="sm"
            fullWidth
            onClick={() => {
              onClose();
              onTriggerSavePlay();
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Grabar otra jugada</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeletePlayDialog
        isOpen={Boolean(playToDelete)}
        playTitle={playToDelete?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPlayToDelete(null)}
      />
    </div>
  );
};
