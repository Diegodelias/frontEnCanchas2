import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Share2,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { Match } from '../../types/match';
import { SavedPlay } from '../../types/play';
import {
  buildMatchShareUrl,
  buildPlayShareUrl,
  buildWhatsAppMatchShareUrl,
  buildWhatsAppPlayShareUrl,
  copyTextToClipboard,
  formatVideoTime,
} from '../../utils/sharing';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  activePlay?: SavedPlay | null;
  currentTimestamp?: number; // seconds
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  match,
  activePlay,
  currentTimestamp = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'match' | 'play'>(
    activePlay ? 'play' : 'match'
  );
  const [copiedType, setCopiedType] = useState<'match' | 'play' | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(activePlay ? 'play' : 'match');
    setCopiedType(null);
  }, [isOpen, activePlay]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchUrl = buildMatchShareUrl(match.id);
  const playId = activePlay?.id || `jugada-${Math.floor(currentTimestamp)}`;
  const playTitle = activePlay?.title || `Jugada en ${match.courtName}`;
  const playTimeFormatted = formatVideoTime(activePlay?.startTime ?? currentTimestamp);
  const playUrl = buildPlayShareUrl(playId);

  const whatsappMatchUrl = buildWhatsAppMatchShareUrl(
    match.title,
    match.clubName,
    match.id
  );

  const whatsappPlayUrl = buildWhatsAppPlayShareUrl(
    playTitle,
    match.clubName,
    playId,
    playTimeFormatted
  );

  const { showToast } = useToast();

  const handleCopy = async (type: 'match' | 'play', textToCopy: string) => {
    const success = await copyTextToClipboard(textToCopy);
    if (success) {
      setCopiedType(type);
      showToast({
        type: 'success',
        title: '¡Link copiado!',
        message: 'Enlace copiado al portapapeles para compartir.',
        durationMs: 3000,
      });
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[var(--c3-backdrop)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-surface text-ink border border-line rounded-t-2xl sm:rounded-xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-turf-soft flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-turf" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Compartir
              </span>
              <h2
                id="share-modal-title"
                className="font-display text-2xl font-bold tracking-tight text-ink"
              >
                Elegí qué querés compartir
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de compartir"
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-line text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab switcher: Partido vs Jugada */}
        <div className="mt-4 p-1 rounded-lg bg-surface-muted border border-line flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('match')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'match'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Video className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Partido completo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('play')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'play'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0 text-turf" aria-hidden="true" />
            <span>Jugada específica</span>
          </button>
        </div>

        {/* Content for Partido */}
        {activeTab === 'match' && (
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-lg bg-canvas border border-line text-xs">
              <span className="block font-semibold text-ink text-sm">
                {match.title}
              </span>
              <span className="block mt-0.5 text-ink-muted">
                {match.clubName} · {match.courtName} · {match.dateLabel}
              </span>
              <span className="block mt-2 font-mono text-ink-muted break-all select-all">
                {matchUrl}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsappMatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Por WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" aria-hidden="true" />
              </a>

              <Button
                variant={copiedType === 'match' ? 'volt' : 'secondary'}
                onClick={() => handleCopy('match', matchUrl)}
                className="w-full"
              >
                {copiedType === 'match' ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>¡Link copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Copiar link</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Content for Jugada */}
        {activeTab === 'play' && (
          <div className="mt-5 space-y-4">
            <div className="p-3.5 rounded-lg bg-canvas border border-line text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink text-sm">
                  {playTitle}
                </span>
                <span className="font-mono px-2 py-0.5 rounded bg-turf-soft text-turf-ink font-semibold tabular-nums">
                  {playTimeFormatted} hs
                </span>
              </div>
              <span className="block mt-1 text-ink-muted">
                {match.clubName} · {match.courtName}
              </span>
              <span className="block mt-2 font-mono text-ink-muted break-all select-all">
                {playUrl}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={whatsappPlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Por WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" aria-hidden="true" />
              </a>

              <Button
                variant={copiedType === 'play' ? 'volt' : 'secondary'}
                onClick={() => handleCopy('play', playUrl)}
                className="w-full"
              >
                {copiedType === 'play' ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>¡Link copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Copiar link</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-line text-center">
          <p className="text-xs text-ink-muted">
            Los links son públicos y no comparten datos personales.
          </p>
        </div>
      </div>
    </div>
  );
};
