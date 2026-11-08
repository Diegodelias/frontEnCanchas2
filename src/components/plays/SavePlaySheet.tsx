import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Film,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { usePlays } from '../../context/PlaysContext';
import { useToast } from '../../context/ToastContext';
import {
  CaptureMode,
  PlayCategory,
  PlayProcessingStatus,
  SavedPlay,
  SavePlayInput,
} from '../../types/play';
import { ClipWindow, defaultClip } from '../../utils/clip';
import { Button } from '../ui/Button';
import { CaptureModeSelector } from './CaptureModeSelector';
import { ClipRangeControl } from './ClipRangeControl';
import { PlayCategorySelector } from './PlayCategorySelector';
import { PlayProcessingState } from './PlayProcessingState';
import { playDownloadBlock, useClipDownload } from './useClipDownload';

interface SavePlaySheetProps {
  isOpen: boolean;
  momentData: {
    timestamp: number;
    timestampLabel: string;
    matchId: string;
    clubName: string;
    courtName: string;
    dateLabel: string;
    timeSlot: string;
    isLiveMoment?: boolean;
    thumbnailUrl?: string;
    videoSrc?: string;
    /** Duración real del video, si ya se conoce: el fragmento no se pasa del final. */
    videoDuration?: number;
  } | null;
  onSaveConfirmed: (play: SavedPlay) => void;
  onSaveWithDefaultsAndClose: (input: SavePlayInput) => void;
  onViewPlay: (play: SavedPlay) => void;
  onSharePlay: (play: SavedPlay) => void;
  onClose: () => void;
}

export const SavePlaySheet: React.FC<SavePlaySheetProps> = ({
  isOpen,
  momentData,
  onSaveConfirmed,
  onSaveWithDefaultsAndClose,
  onViewPlay,
  onSharePlay,
  onClose,
}) => {
  const { showToast } = useToast();
  const { savePlay } = usePlays();
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const [captureMode, setCaptureMode] = useState<CaptureMode>('video');
  const [category, setCategory] = useState<PlayCategory | undefined>(undefined);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<PlayProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [savedPlayResult, setSavedPlayResult] = useState<SavedPlay | null>(null);
  const { downloadingId, download } = useClipDownload();
  // Fragmento de la jugada: se propone 15 s antes y 5 s después, y el jugador lo ajusta con los botones.
  const [clip, setClip] = useState<ClipWindow>({ start: 0, end: 20 });

  // Reset form when opened for a new moment
  useEffect(() => {
    if (isOpen) {
      setCaptureMode('video');
      setCategory(undefined);
      setCustomTitle('');
      setProcessingStatus('idle');
      setErrorMessage('');
      setSavedPlayResult(null);
      if (momentData) setClip(defaultClip(momentData.timestamp, momentData.videoDuration));
    }
  }, [isOpen, momentData?.timestamp]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleUserDismiss();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, momentData, category, customTitle, captureMode, processingStatus, savedPlayResult]);

  if (!isOpen || !momentData) return null;

  // When user closes with X, Escape, or backdrop without clicking "Guardar":
  // Save with defaults so play is NEVER lost!
  const handleUserDismiss = () => {
    if (processingStatus === 'processing') return;

    if (!savedPlayResult) {
      // Not yet saved: save with defaults (or whatever they picked so far)
      const input: SavePlayInput = {
        matchId: momentData.matchId,
        timestamp: momentData.timestamp,
        timestampLabel: momentData.timestampLabel,
        title: customTitle.trim() || undefined,
        category,
        captureMode,
        clubName: momentData.clubName,
        courtName: momentData.courtName,
        dateLabel: momentData.dateLabel,
        timeSlot: momentData.timeSlot,
        isLiveMoment: momentData.isLiveMoment,
        thumbnailUrl: momentData.thumbnailUrl,
        videoSrc: momentData.videoSrc,
        // El fragmento ajustado; una jugada en vivo no tiene.
        clipStart: momentData.isLiveMoment ? undefined : clip.start,
        clipEnd: momentData.isLiveMoment ? undefined : clip.end,
      };
      onSaveWithDefaultsAndClose(input);
    } else {
      onClose();
    }
  };

  const handleManualSave = async () => {
    setProcessingStatus('processing');
    setErrorMessage('');

    try {
      // Check if URL has ?guardado=error to simulate error
      const urlParams = new URLSearchParams(window.location.search);
      const forceError = urlParams.get('guardado') === 'error';

      // Simulate 700-1100ms processing
      await new Promise((r) => setTimeout(r, 850));

      if (forceError) {
        throw new Error('Error forzado mediante ?guardado=error');
      }

      const input: SavePlayInput = {
        matchId: momentData.matchId,
        timestamp: momentData.timestamp,
        timestampLabel: momentData.timestampLabel,
        title: customTitle.trim() || undefined,
        category,
        captureMode,
        clubName: momentData.clubName,
        courtName: momentData.courtName,
        dateLabel: momentData.dateLabel,
        timeSlot: momentData.timeSlot,
        isLiveMoment: momentData.isLiveMoment,
        thumbnailUrl: momentData.thumbnailUrl,
        videoSrc: momentData.videoSrc,
        // El fragmento ajustado; una jugada en vivo no tiene.
        clipStart: momentData.isLiveMoment ? undefined : clip.start,
        clipEnd: momentData.isLiveMoment ? undefined : clip.end,
      };

      // Se guarda en la cuenta del jugador (backend), no en el navegador.
      const play = await savePlay(input);

      setSavedPlayResult(play);
      setProcessingStatus('ready');
      onSaveConfirmed(play);

      showToast({
        type: 'success',
        title: '¡Jugada guardada!',
        message: play.isLiveMoment
          ? `Se guardó el momento en "${play.title}".`
          : `Se guardaron ${play.duration} segundos en "${play.title}".`,
        durationMs: 4000,
      });
    } catch (err: any) {
      setProcessingStatus('error');
      setErrorMessage(err?.message || 'No se pudo guardar la jugada');
      showToast({
        type: 'error',
        title: 'No se pudo guardar la jugada',
        message: 'Revisá la conexión y volvé a intentar.',
        durationMs: 4500,
      });
    }
  };

  const downloadBlock = savedPlayResult ? playDownloadBlock(savedPlayResult) : null;
  const isDownloading = savedPlayResult !== null && downloadingId === savedPlayResult.id;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-sheet-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleUserDismiss();
        }
      }}
    >
      <div
        ref={sheetRef}
        className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-surface border-t sm:border border-line shadow-2xl text-ink p-5 sm:p-6 space-y-5 animate-in slide-in-from-bottom-4"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-volt/20 text-volt-ink border border-volt/30 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-volt fill-volt" aria-hidden="true" />
              <span>{momentData.isLiveMoment ? 'Momento en vivo' : `Momento ${momentData.timestampLabel}`}</span>
            </div>
            <h2 id="save-sheet-title" className="font-display text-2xl font-bold tracking-tight text-ink leading-tight">
              {processingStatus === 'ready' ? '¡Jugada guardada con éxito!' : 'Grabá tu jugada'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {processingStatus === 'ready'
                ? 'Elegí qué querés hacer ahora o continuá viendo el video.'
                : 'Marcá el momento y elegí cómo querés guardarlo.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleUserDismiss}
            aria-label="Cerrar y conservar jugada"
            className="p-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Processing State View */}
        {processingStatus === 'processing' && (
          <PlayProcessingState status="processing" />
        )}

        {/* Error State View */}
        {processingStatus === 'error' && (
          <PlayProcessingState
            status="error"
            errorMessage={errorMessage}
            onRetry={handleManualSave}
          />
        )}

        {/* Ready / Confirmation View */}
        {processingStatus === 'ready' && savedPlayResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-pitch-elevated border border-pitch-line text-pitch-ink flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-volt text-volt-ink flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate text-pitch-ink">
                  {savedPlayResult.title}
                </p>
                <p className="text-xs text-pitch-muted mt-0.5 truncate">
                  {savedPlayResult.clubName} · {savedPlayResult.timestampLabel}
                </p>
              </div>
            </div>

            {/* Post-save action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant="volt"
                size="md"
                fullWidth
                onClick={() => {
                  onViewPlay(savedPlayResult);
                  onClose();
                }}
              >
                <Eye className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
                <span>Ver jugada</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => {
                  onSharePlay(savedPlayResult);
                }}
              >
                <Share2 className="w-4 h-4 mr-1.5 shrink-0" aria-hidden="true" />
                <span>Compartir</span>
              </Button>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => void download(savedPlayResult)}
                disabled={isDownloading || downloadBlock !== null}
                title={downloadBlock ?? 'Descargar el fragmento de la jugada'}
                className="flex-1 min-h-[44px] px-3 rounded-xl border border-line bg-surface hover:bg-surface-muted text-ink font-semibold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{isDownloading ? 'Preparando el fragmento...' : 'Descargar video'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] px-4 rounded-xl border border-transparent hover:bg-surface-muted text-ink font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Seguir viendo
              </button>
            </div>
          </div>
        )}

        {/* Form View (Idle state before clicking save) */}
        {processingStatus === 'idle' && (
          <div className="space-y-4">
            {/* Modalidad de captura */}
            <CaptureModeSelector
              selectedMode={captureMode}
              onChange={setCaptureMode}
            />

            {/* Clasificación opcional */}
            <PlayCategorySelector
              selectedCategory={category}
              onSelectCategory={setCategory}
            />

            {/* Campo de nombre opcional */}
            <div className="space-y-1.5">
              <label htmlFor="play-custom-title" className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Nombre de la jugada (opcional)
              </label>
              <input
                id="play-custom-title"
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={
                  category
                    ? `Ej: ${category} de contragolpe`
                    : momentData.isLiveMoment
                    ? 'Ej: Golazo en el segundo tiempo'
                    : `Ej: Jugada de ${momentData.timestampLabel}`
                }
                maxLength={60}
                className="w-full h-11 px-3.5 rounded-xl border border-line bg-canvas text-sm font-medium text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-turf"
              />
            </div>

            {/* Fragmento de la jugada: se ajusta con botones grandes (también desde el celular) */}
            {momentData.isLiveMoment ? (
              <div className="p-3 rounded-xl bg-surface-muted border border-line flex items-center gap-2.5 text-xs text-ink-muted">
                <Clock className="w-4 h-4 text-turf shrink-0" aria-hidden="true" />
                <span>
                  Se guarda este <strong className="text-ink font-semibold">momento en vivo</strong>. Las jugadas en vivo no
                  se pueden descargar porque no hay una grabación.
                </span>
              </div>
            ) : (
              <ClipRangeControl
                clip={clip}
                timestamp={momentData.timestamp}
                videoDuration={momentData.videoDuration}
                onChange={setClip}
              />
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleUserDismiss}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Cerrar (guarda por defecto)
              </button>

              <Button
                variant="volt"
                size="md"
                onClick={handleManualSave}
                className="min-w-[130px]"
              >
                Guardar jugada
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
