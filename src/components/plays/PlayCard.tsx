import React, { useState } from 'react';
import { Download, Edit2, Eye, MoreHorizontal, Play, Share2, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SavedPlay } from '../../types/play';

interface PlayCardProps {
  play: SavedPlay;
  onPlay: (play: SavedPlay) => void;
  onShare: (play: SavedPlay) => void;
  onDelete: (play: SavedPlay) => void;
  onEditTitle?: (play: SavedPlay) => void;
  layout?: 'compact' | 'profile';
  indexNumber?: number;
}

export const PlayCard: React.FC<PlayCardProps> = ({
  play,
  onPlay,
  onShare,
  onDelete,
  onEditTitle,
  layout = 'compact',
  indexNumber,
}) => {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleSimulatedDownload = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDownloading(true);
    showToast({
      type: 'info',
      title: 'Descarga simulada iniciada',
      message: `Preparando archivo MP4 para "${play.title}" (20s).`,
      durationMs: 3500,
    });

    setTimeout(() => {
      setIsDownloading(false);
      showToast({
        type: 'success',
        title: 'Descarga simulada completada',
        message: 'En la versión final, este botón descargará el fragmento en alta calidad.',
        durationMs: 3000,
      });
    }, 1800);
  };

  // Compact layout (used inside the player PlaysPanel - matches 7_fa7d0ba7.png)
  if (layout === 'compact') {
    return (
      <div className="group relative flex items-center justify-between gap-3 p-3 rounded-xl bg-pitch-elevated/80 hover:bg-pitch-elevated border border-pitch-line/80 hover:border-pitch-line transition-all">
        {/* Play Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-pitch-ink truncate">
              {indexNumber !== undefined ? `${indexNumber}. ` : ''}
              {play.title}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-pitch-muted">
            <button
              type="button"
              onClick={() => onPlay(play)}
              className="inline-flex items-center gap-1 text-pitch-muted hover:text-volt transition-colors cursor-pointer"
            >
              <Play className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
              <span>{play.timestampLabel}</span>
            </button>

            {onEditTitle && (
              <button
                type="button"
                onClick={() => onEditTitle(play)}
                aria-label="Editar nombre de la jugada"
                title="Editar nombre"
                className="hover:text-pitch-ink p-0.5 rounded cursor-pointer transition-colors"
              >
                <Edit2 className="w-3 h-3" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(play)}
              aria-label="Eliminar jugada"
              title="Eliminar"
              className="hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Quick Actions (matches 7_fa7d0ba7.png row buttons: Eye, Download, Share) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onPlay(play)}
            aria-label="Ver jugada"
            title="Ver jugada"
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 text-pitch-muted hover:text-pitch-ink flex items-center justify-center transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleSimulatedDownload}
            aria-label="Descargar jugada (simulada)"
            title="Descargar"
            disabled={isDownloading}
            className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 text-pitch-muted hover:text-pitch-ink flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onShare(play)}
            aria-label="Compartir jugada"
            title="Compartir"
            className="w-8 h-8 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4 fill-current stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Profile layout (matching reference image 8_cac3471b.png)
  return (
    <div className="flex flex-col rounded-2xl bg-surface border border-line overflow-hidden shadow-xs hover:border-line-strong hover:-translate-y-0.5 transition-all duration-200">
      {/* 16:9 Video Preview with Center Play Button (exact look from 8_cac3471b.png) */}
      <div className="relative aspect-video w-full bg-pitch-surface overflow-hidden group">
        {/* Pitch net pattern preview texture */}
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(#1f8a48_1.2px,transparent_1.2px)] [background-size:16px_16px]" />
        
        {/* Diagonal wire-mesh fence overlay simulation */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 24px), repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 24px)',
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-pitch via-pitch/40 to-transparent z-10" />

        {/* Center Circular Play Button matching 8_cac3471b.png */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            type="button"
            onClick={() => onPlay(play)}
            aria-label={`Reproducir ${play.title}`}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-[#f59e0b] hover:text-black border border-white/30 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xl group-hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
          </button>
        </div>

        {/* Timestamp tag */}
        <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[11px] font-mono font-semibold text-white border border-white/15">
          {play.timestampLabel}
        </div>

        {play.category && (
          <div className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-volt font-display font-bold text-xs uppercase tracking-wider border border-volt/30 shadow-xs">
            {play.category}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-ink leading-tight truncate">
              {play.title}
            </h3>
          </div>

          {/* Unboxed clean metadata matching 8_cac3471b.png: "22 K Locos X El Futbol · 5/11" */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted truncate">
            <span className="font-semibold text-ink">{play.clubName}</span>
            <span aria-hidden="true">·</span>
            <span>{play.courtName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{play.dateLabel}</span>
          </div>
        </div>

        {/* Actions Bar matching 8_cac3471b.png: COMPARTIR button + Download + More options */}
        <div className="pt-3 border-t border-line flex items-center gap-2 relative">
          {/* Prominent COMPARTIR CTA (high contrast amber/volt) */}
          <button
            type="button"
            onClick={() => onShare(play)}
            className="flex-1 min-h-[42px] px-4 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-black font-display font-extrabold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Share2 className="w-4 h-4 shrink-0 stroke-[2.5]" aria-hidden="true" />
            <span>Compartir</span>
          </button>

          {/* Download button */}
          <button
            type="button"
            onClick={handleSimulatedDownload}
            disabled={isDownloading}
            aria-label="Descargar jugada (simulada)"
            title="Descargar video"
            className="w-10 h-10 min-w-[40px] rounded-xl border border-line bg-surface hover:bg-surface-muted text-ink flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Options Menu button (...) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((prev) => !prev)}
              aria-label="Más opciones"
              title="Más opciones"
              className="w-10 h-10 min-w-[40px] rounded-xl border border-line bg-surface hover:bg-surface-muted text-ink flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-surface border border-line shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                {onEditTitle && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onEditTitle(play);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Cambiar nombre</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onDelete(play);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar jugada</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

