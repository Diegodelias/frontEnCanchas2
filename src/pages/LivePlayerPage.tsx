import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, Radio } from 'lucide-react';
import { LivePlayer } from '../components/live/LivePlayer';
import { buildLiveStreamPath, ROUTES } from '../routes/paths';
import { liveCameraService } from '../services/liveCameraService';
import { LiveCamera } from '../types/liveCamera';

export const LivePlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const { cameraId } = useParams<{ cameraId: string }>();
  const [searchParams] = useSearchParams();
  const forceError = searchParams.get('estado') === 'error';

  const [currentCamera, setCurrentCamera] = useState<LiveCamera | null>(null);
  const [allCameras, setAllCameras] = useState<LiveCamera[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!cameraId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      try {
        const [cam, list] = await Promise.all([
          liveCameraService.getLiveCameraById(cameraId),
          liveCameraService.getLiveCameras(),
        ]);

        if (cancelled) return;

        if (!cam) {
          setNotFound(true);
        } else {
          setCurrentCamera(cam);
          setAllCameras(list);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [cameraId]);

  // Si el ID no existe, navegar a la ruta 404
  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  if (isLoading || !currentCamera) {
    return (
      <div className="w-full h-[100dvh] bg-pitch text-pitch-ink flex flex-col items-center justify-center p-6 text-center">
        <Radio className="w-10 h-10 text-volt animate-spin mb-4" aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold text-white">
          Conectando a la cancha en vivo...
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-pitch-muted">
          Iniciando transmisión segura de demostración
        </p>
      </div>
    );
  }

  const handleSelectCamera = (nextCameraId: string) => {
    navigate(buildLiveStreamPath(nextCameraId));
  };

  return (
    <LivePlayer
      camera={currentCamera}
      allCameras={allCameras}
      onSelectCamera={handleSelectCamera}
      forceError={forceError}
    />
  );
};
