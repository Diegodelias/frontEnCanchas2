import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  Edit2,
  Film,
  MapPin,
  Play,
  Plus,
  Share2,
  Trash2,
  Video,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlays } from '../../context/PlaysContext';
import { useToast } from '../../context/ToastContext';
import { buildMatchPath, buildPlayPath, ROUTES } from '../../routes/paths';
import { matchesService } from '../../services/matchesService';
import { Match } from '../../types/match';
import { SavedPlay } from '../../types/play';
import { DeletePlayDialog } from '../plays/DeletePlayDialog';
import { PlayCard } from '../plays/PlayCard';
import { ShareModal } from '../sharing/ShareModal';
import { Button } from '../ui/Button';

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user, authMode } = useAuth();
  const { savedPlays, savedMatchIds, deletePlay, updatePlay, toggleSaveMatch } = usePlays();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'plays' | 'matches'>('plays');
  const [loadedMatches, setLoadedMatches] = useState<Match[]>([]);
  const [playToDelete, setPlayToDelete] = useState<SavedPlay | null>(null);

  // Edit title modal state
  const [editingPlay, setEditingPlay] = useState<SavedPlay | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Sharing state
  const [shareTarget, setShareTarget] = useState<{
    match: Match;
    play?: SavedPlay;
  } | null>(null);

  // Load matches metadata for saved matches
  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      if (savedMatchIds.length === 0) {
        setLoadedMatches([]);
        return;
      }
      try {
        const matches = await matchesService.getSavedMatches(savedMatchIds);
        if (!cancelled) {
          setLoadedMatches(matches);
        }
      } catch (err) {
        console.warn('Could not load saved matches:', err);
      }
    }

    loadMatches();
    return () => {
      cancelled = true;
    };
  }, [savedMatchIds]);

  // Group plays by month (e.g. "NOVIEMBRE 2026")
  const groupedPlays = React.useMemo(() => {
    const groups: Record<string, SavedPlay[]> = {};

    savedPlays.forEach((play) => {
      const date = new Date(play.createdAt || Date.now());
      const monthYear = date
        .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
        .toUpperCase();
      const groupKey = monthYear || 'NOVIEMBRE 2026';

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(play);
    });

    return groups;
  }, [savedPlays]);

  // Calculate unique matches count
  const uniqueMatchCount = React.useMemo(() => {
    const ids = new Set(savedPlays.map((p) => p.matchId));
    return ids.size;
  }, [savedPlays]);

  const handleDeleteConfirm = async () => {
    if (!playToDelete) return;
    const title = playToDelete.title;
    await deletePlay(playToDelete.id);
    setPlayToDelete(null);
    showToast({
      type: 'info',
      title: 'Jugada eliminada',
      message: `"${title}" fue eliminada de tu perfil.`,
      durationMs: 3000,
    });
  };

  const handleStartEdit = (play: SavedPlay) => {
    setEditingPlay(play);
    setEditingTitleText(play.title);
  };

  const handleSaveEdit = async () => {
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

  const handlePlayCardPlay = (play: SavedPlay) => {
    navigate(buildPlayPath(play.id));
  };

  const handleSharePlay = (play: SavedPlay) => {
    const match = loadedMatches.find((m) => m.id === play.matchId) || {
      id: play.matchId,
      title: play.title,
      clubId: '',
      clubName: play.clubName,
      courtId: '',
      courtName: play.courtName,
      dayId: '',
      dateLabel: play.dateLabel,
      timeSlot: play.timeSlot,
      status: 'available' as const,
      videoSrc: play.videoSrc ?? null,
      duration: 60,
      recordedAt: play.createdAt,
    };
    setShareTarget({ match, play });
  };

  const handleShareMatch = (match: Match) => {
    setShareTarget({ match });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-pitch text-volt font-display text-2xl sm:text-3xl font-extrabold flex items-center justify-center border border-pitch-line shrink-0">
            {user?.avatar}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">
                {user?.name}
              </h1>
              {authMode === 'registered' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-turf-soft text-turf-ink">
                  <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                  PERFIL ACTIVO
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-ink-muted">
              {user?.email}
            </p>

            <div className="mt-2.5 flex items-center gap-3 text-xs font-mono text-ink-muted">
              <span className="font-semibold text-ink">
                {savedPlays.length} {savedPlays.length === 1 ? 'jugada' : 'jugadas'} en {uniqueMatchCount}{' '}
                {uniqueMatchCount === 1 ? 'partido' : 'partidos'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{savedMatchIds.length} partidos guardados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="volt"
            size="md"
            onClick={() => navigate(ROUTES.HOME)}
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Buscar partido</span>
          </Button>
        </div>
      </div>

      {/* Tabs Switcher: Mis jugadas (Main) vs Partidos guardados */}
      <div className="border-b border-line flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('plays')}
          className={`pb-3 font-display text-xl font-bold flex items-center gap-2 transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'plays'
              ? 'border-turf text-ink'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          <Zap className="w-4 h-4 text-turf shrink-0" aria-hidden="true" />
          <span>Mis jugadas ({savedPlays.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`pb-3 font-display text-xl font-bold flex items-center gap-2 transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'matches'
              ? 'border-turf text-ink'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          <Video className="w-4 h-4 text-turf shrink-0" aria-hidden="true" />
          <span>Partidos completos ({savedMatchIds.length})</span>
        </button>
      </div>

      {/* TAB 1: Mis Jugadas (Primary content, matching reference 8_cac3471b.png) */}
      {activeTab === 'plays' && (
        <div className="space-y-6">
          {/* Header Bar: "Mis jugadas" */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Mis jugadas
            </h2>
          </div>

          {savedPlays.length === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-14 rounded-2xl bg-surface border border-line text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-muted text-ink-muted flex items-center justify-center mx-auto">
                <Film className="w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Todavía no tenés jugadas guardadas
                </h2>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                  Cuando estés mirando un partido o una cancha en vivo, tocá{' '}
                  <strong className="text-ink">Guardar jugada</strong> para marcar los mejores 20 segundos y compartirlos con tu equipo.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="volt" size="md" onClick={() => navigate(ROUTES.HOME)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Buscar un partido para ver</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Grouped by month list */
            Object.entries(groupedPlays).map(([monthLabel, plays]) => (
              <section key={monthLabel} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-line">
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {monthLabel}
                  </h2>
                  <span className="font-mono text-xs text-ink-muted">
                    {plays.length} {plays.length === 1 ? 'jugada' : 'jugadas'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {plays.map((play, idx) => (
                    <PlayCard
                      key={play.id}
                      play={play}
                      indexNumber={idx + 1}
                      layout="profile"
                      onPlay={handlePlayCardPlay}
                      onShare={handleSharePlay}
                      onDelete={(p) => setPlayToDelete(p)}
                      onEditTitle={handleStartEdit}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Partidos Guardados */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {loadedMatches.length === 0 ? (
            <div className="p-8 sm:p-14 rounded-2xl bg-surface border border-line text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-muted text-ink-muted flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink">
                No tenés partidos guardados
              </h2>
              <p className="text-sm text-ink-muted">
                Podés guardar partidos completos desde la página principal para volver a verlos cuando quieras.
              </p>
              <Button variant="volt" size="md" onClick={() => navigate(ROUTES.HOME)}>
                Explorar partidos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {loadedMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-surface border border-line rounded-2xl p-5 flex flex-col justify-between hover:border-line-strong transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-turf-soft text-turf-ink font-semibold">
                        {match.courtName}
                      </span>
                      <span className="text-ink-muted">{match.timeSlot} hs</span>
                    </div>

                    <h3 className="mt-3 font-display text-xl font-bold text-ink">
                      {match.title}
                    </h3>

                    <p className="mt-1 text-xs text-ink-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-turf shrink-0" aria-hidden="true" />
                      <span>{match.clubName}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-line flex items-center justify-between gap-2">
                    <Button
                      variant="volt"
                      size="sm"
                      onClick={() => navigate(buildMatchPath(match.id))}
                    >
                      <Play className="w-3.5 h-3.5 fill-volt-ink" aria-hidden="true" />
                      <span>Ver partido</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShareMatch(match)}
                        aria-label="Compartir partido"
                        className="w-9 h-9 rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-surface-muted flex items-center justify-center cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSaveMatch(match.id)}
                        aria-label="Quitar de guardados"
                        className="w-9 h-9 rounded-lg border border-line text-ink-muted hover:text-red-500 hover:bg-surface-muted flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Title Dialog Modal */}
      {editingPlay && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-line p-5 shadow-2xl text-ink space-y-4">
            <h3 className="font-display text-lg font-bold text-ink">
              Editar nombre de la jugada
            </h3>
            <input
              type="text"
              value={editingTitleText}
              onChange={(e) => setEditingTitleText(e.target.value)}
              maxLength={60}
              className="w-full h-11 px-3.5 rounded-xl border border-line bg-canvas text-sm font-medium text-ink focus:outline-none focus:border-turf"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingPlay(null)}>
                Cancelar
              </Button>
              <Button variant="volt" size="sm" onClick={handleSaveEdit}>
                Guardar nombre
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Play Confirmation Dialog */}
      <DeletePlayDialog
        isOpen={Boolean(playToDelete)}
        playTitle={playToDelete?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPlayToDelete(null)}
      />

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          isOpen={Boolean(shareTarget)}
          onClose={() => setShareTarget(null)}
          match={shareTarget.match}
          activePlay={shareTarget.play}
        />
      )}
    </div>
  );
};
