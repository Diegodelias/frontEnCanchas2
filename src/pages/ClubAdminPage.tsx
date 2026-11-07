import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Lock,
  Play,
  Printer,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  Sliders,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MOCK_COMPLEXES } from '../data/mockComplexes';
import { MOCK_MATCHES } from '../data/mockMatches';
import { buildLiveStreamPath, buildMatchPath, buildQrScanPath, ROUTES } from '../routes/paths';

export const ClubAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeRole, switchRole } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'cameras' | 'matches' | 'settings' | 'metrics'>('cameras');
  const [selectedClubId, setSelectedClubId] = useState<string>('estacion-norte');
  const [qrModalCourtId, setQrModalCourtId] = useState<string | null>(null);

  // Settings form state
  const [accessPolicy, setAccessPolicy] = useState<'open' | 'turn_players' | 'qr_only'>('turn_players');
  const [cameraPrice, setCameraPrice] = useState<number>(2500);
  const [includedInRent, setIncludedInRent] = useState<boolean>(true);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Cameras state
  const [cameras, setCameras] = useState([
    {
      id: 'cam-en-cancha-1',
      courtName: 'Cancha 1 (Fútbol 5)',
      model: 'Axis P1375 IP 1080p 60fps',
      rtspUrl: 'rtsp://admin:****@192.168.1.101:554/live',
      status: 'live' as const,
      fps: 60,
      bitrateMbps: 4.8,
      recordingActive: true,
      currentMatch: 'Turno 20:00 hs · Los Cuervos vs La Academia',
    },
    {
      id: 'cam-en-cancha-2',
      courtName: 'Cancha 2 (Fútbol 5)',
      model: 'Hikvision DS-2CD2043G2-I',
      rtspUrl: 'rtsp://admin:****@192.168.1.102:554/live',
      status: 'idle' as const,
      fps: 0,
      bitrateMbps: 0,
      recordingActive: false,
      currentMatch: 'Próximo turno: 21:00 hs',
    },
    {
      id: 'cam-en-cancha-3',
      courtName: 'Cancha 3 (Fútbol 7 Techada)',
      model: 'Dahua IPC-HFW2431S-S-S2',
      rtspUrl: 'rtsp://admin:****@192.168.1.103:554/live',
      status: 'live' as const,
      fps: 60,
      bitrateMbps: 5.1,
      recordingActive: true,
      currentMatch: 'Turno 20:00 hs · Torneo Nocturno F7',
    },
  ]);

  const clubMatches = MOCK_MATCHES.filter(
    (m) => m.clubId === selectedClubId || m.clubId === 'estacion-norte'
  );

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      showToast({
        title: 'Configuración actualizada',
        message: 'Las reglas de acceso y tarifas del complejo se guardaron correctamente.',
        type: 'success',
      });
    }, 400);
  };

  const handleTestCameraSignal = (id: string) => {
    showToast({
      title: 'Comprobando señal RTSP',
      message: 'Conexión verificada con éxito: latencia 48ms, 1080p 60fps sin pérdida de paquetes.',
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header Panel */}
          <div className="p-6 rounded-2xl bg-surface border border-line flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-turf-ink px-2.5 py-0.5 rounded bg-turf-soft">
                  Panel de Administración de Complejo
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  SISTEMA ONLINE
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink flex items-center gap-3">
                <Building2 className="w-8 h-8 text-turf shrink-0" aria-hidden="true" />
                <span>Estación Norte Fútbol</span>
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                Belgrano, Buenos Aires · 3 canchas conectadas al sistema de grabación HD Canchas3
              </p>
            </div>

            {/* Role indicator & Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link to={buildLiveStreamPath('cam-en-f5')}>
                <Button variant="volt" size="sm">
                  <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Ver señal en vivo</span>
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setQrModalCourtId('cancha-1')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-surface hover:bg-surface-muted text-xs font-semibold text-ink transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-turf shrink-0" aria-hidden="true" />
                <span>Cartel QR para rejas</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
                <span>Cámaras activas</span>
                <Camera className="w-4 h-4 text-turf" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-ink tabular-nums">
                2 / 3 <span className="text-xs font-normal text-emerald-500">Transmitiendo</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
                <span>Partidos grabados (Mes)</span>
                <Video className="w-4 h-4 text-turf" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-ink tabular-nums">
                142 <span className="text-xs font-normal text-ink-muted">142 hs grabadas</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
                <span>Jugadas guardadas</span>
                <TrendingUp className="w-4 h-4 text-volt" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-ink tabular-nums">
                847 <span className="text-xs font-normal text-volt-ink font-semibold">+24% vs mes ant.</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between text-ink-muted text-xs font-medium">
                <span>Jugadores vinculados</span>
                <Users className="w-4 h-4 text-turf" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-display font-extrabold text-ink tabular-nums">
                512 <span className="text-xs font-normal text-ink-muted">Comunidad activa</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-line overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('cameras')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'cameras'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Canchas y Cámaras IP ({cameras.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Partidos del Complejo ({clubMatches.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Reglas de Acceso y Tarifas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`pb-3 px-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'metrics'
                  ? 'border-turf text-turf-ink'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Métricas de Audiencia</span>
            </button>
          </div>

          {/* TAB 1: Canchas y Cámaras IP */}
          {activeTab === 'cameras' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                    Cámaras instaladas en predio
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-muted">
                    Supervisión de streams RTSP, fps en tiempo real y cartelera QR para cada cancha.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      showToast({
                        title: 'Actualizando estado',
                        message: 'Sondeando encoders de video en red local...',
                        type: 'info',
                      });
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Escanear red IP</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {cameras.map((cam) => (
                  <div
                    key={cam.id}
                    className="p-5 rounded-2xl bg-surface border border-line flex flex-col justify-between space-y-4 hover:border-line-strong transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-ink">
                          {cam.courtName}
                        </span>
                        {cam.status === 'live' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            GRABANDO HD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-muted text-ink-muted">
                            <Clock className="w-3 h-3" />
                            EN ESPERA
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-ink-muted font-mono">{cam.model}</p>

                      <div className="mt-3.5 p-3 rounded-lg bg-canvas border border-line space-y-1.5 text-xs font-mono">
                        <p className="flex justify-between text-ink-muted">
                          <span>Bitrate:</span>
                          <span className="font-semibold text-ink">{cam.bitrateMbps} Mbps</span>
                        </p>
                        <p className="flex justify-between text-ink-muted">
                          <span>Cuadros/seg:</span>
                          <span className="font-semibold text-ink">{cam.fps} fps</span>
                        </p>
                        <p className="flex justify-between text-ink-muted truncate">
                          <span>RTSP:</span>
                          <span className="text-turf truncate max-w-[150px]">{cam.rtspUrl}</span>
                        </p>
                      </div>

                      <div className="mt-3 text-xs text-ink-muted">
                        <span className="font-semibold text-ink">Actividad actual:</span>
                        <p className="mt-0.5 text-ink-muted">{cam.currentMatch}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-line flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleTestCameraSignal(cam.id)}
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Probar señal</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => setQrModalCourtId(cam.id)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-surface hover:bg-surface-muted text-xs font-semibold text-ink transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-turf" />
                          <span>Cartel QR</span>
                        </button>
                      </div>

                      {cam.status === 'live' && (
                        <Link to={buildLiveStreamPath('cam-en-f5')} className="w-full">
                          <Button variant="volt" size="sm" fullWidth>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Ver transmisión</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Partidos del Complejo */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                    Historial de partidos grabados
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-muted">
                    Accedé a los videos almacenados, compartí links con capitanes y verificá descargas.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-line bg-surface">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Partido / Cancha</th>
                      <th className="py-3 px-4">Fecha y Turno</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Vistas</th>
                      <th className="py-3 px-4">Jugadas</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {clubMatches.map((m) => (
                      <tr key={m.id} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-display font-bold text-ink">{m.title}</p>
                          <p className="text-xs text-ink-muted">{m.courtName}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-ink-muted">
                          <p className="text-ink font-semibold">{m.dateLabel}</p>
                          <p className="text-xs">{m.timeSlot} hs</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-turf-ink px-2 py-0.5 rounded bg-turf-soft">
                            <CheckCircle2 className="w-3 h-3" />
                            HD DISPONIBLE
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-ink">
                          84 reproducciones
                        </td>
                        <td className="py-3.5 px-4 font-mono tabular-nums text-volt-ink font-semibold">
                          12 guardadas
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link to={buildMatchPath(m.id)}>
                              <Button variant="volt" size="sm">
                                <Play className="w-3 h-3 fill-current" />
                                <span>Ver</span>
                              </Button>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                showToast({
                                  title: 'Descarga iniciada',
                                  message: `Descargando video MP4 de 1080p: ${m.title}`,
                                  type: 'success',
                                });
                              }}
                              title="Descargar archivo MP4 completo"
                              className="p-2 rounded-lg border border-line hover:bg-surface-muted text-ink transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Reglas de Acceso y Tarifas */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  Reglas de acceso y comercialización
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted">
                  Configurá la privacidad de las grabaciones, el precio por turno y la disponibilidad de descargas.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-line space-y-6">
                {/* 1. Política de Privacidad */}
                <div>
                  <label className="font-display text-base font-bold text-ink block mb-1">
                    Privacidad de las grabaciones
                  </label>
                  <p className="text-xs text-ink-muted mb-3">
                    Determiná quiénes pueden acceder al reproductor de los partidos jugados en tus canchas.
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        id: 'turn_players',
                        title: 'Exclusivo para jugadores del turno (Recomendado)',
                        desc: 'Se envía link por WhatsApp/email a los capitanes. No aparece en listados públicos.',
                      },
                      {
                        id: 'open',
                        title: 'Público y abierto en el buscador',
                        desc: 'Cualquier persona puede encontrar el partido por fecha y cancha y revivirlo.',
                      },
                      {
                        id: 'qr_only',
                        title: 'Solo escaneando el QR físico en el predio',
                        desc: 'Acceso restringido a quienes estuvieron presentes en el complejo.',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          accessPolicy === opt.id
                            ? 'border-turf bg-turf-soft text-turf-ink'
                            : 'border-line bg-canvas text-ink hover:bg-surface-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name="accessPolicy"
                          value={opt.id}
                          checked={accessPolicy === opt.id}
                          onChange={() => setAccessPolicy(opt.id as any)}
                          className="mt-1 text-turf focus:ring-turf"
                        />
                        <div>
                          <p className="text-sm font-bold text-ink">{opt.title}</p>
                          <p className="text-xs text-ink-muted mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Tarifa y Cobro */}
                <div className="pt-5 border-t border-line">
                  <label className="font-display text-base font-bold text-ink block mb-1">
                    Tarifa del servicio de cámara HD
                  </label>
                  <p className="text-xs text-ink-muted mb-3">
                    Establecé el valor comercial por partido grabado en tu complejo.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-ink-muted block mb-1.5">
                        Precio por partido ($ ARS)
                      </span>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-sm text-ink-muted font-bold">$</span>
                        <input
                          type="number"
                          value={cameraPrice}
                          onChange={(e) => setCameraPrice(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border border-line bg-canvas text-sm font-bold text-ink focus:outline-none focus:border-turf"
                        />
                      </div>
                    </div>

                    <div className="flex items-center pt-5 sm:pt-6">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includedInRent}
                          onChange={(e) => setIncludedInRent(e.target.checked)}
                          className="w-4 h-4 rounded text-turf focus:ring-turf"
                        />
                        <span className="text-xs font-medium text-ink">
                          Incluir servicio de grabación en el precio del alquiler
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Período de Retención */}
                <div className="pt-5 border-t border-line">
                  <label className="font-display text-base font-bold text-ink block mb-1">
                    Período de retención de video
                  </label>
                  <p className="text-xs text-ink-muted mb-3">
                    Los partidos se almacenan durante este período antes de archivarse automáticamente.
                  </p>

                  <div className="flex items-center gap-3">
                    {[14, 30, 60].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setRetentionDays(days)}
                        className={`py-2 px-4 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          retentionDays === days
                            ? 'border-turf bg-turf-soft text-turf-ink'
                            : 'border-line bg-canvas text-ink hover:bg-surface-muted'
                        }`}
                      >
                        {days} días
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-line flex items-center justify-end">
                  <Button
                    variant="volt"
                    size="md"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span>{isSavingSettings ? 'Guardando...' : 'Guardar reglas del club'}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Métricas */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                  Métricas de audiencia y jugadas
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted">
                  Datos de engagement de los jugadores que visitan tu complejo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
                  <h3 className="font-display text-lg font-bold text-ink">Jugadas más guardadas</h3>
                  <div className="space-y-3">
                    {[
                      { tag: 'Golazo', count: 412, pct: '48%' },
                      { tag: 'Atajada', count: 218, pct: '26%' },
                      { tag: 'Caño / Lujo', count: 142, pct: '17%' },
                      { tag: 'Blooper', count: 75, pct: '9%' },
                    ].map((item) => (
                      <div key={item.tag} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-ink">{item.tag}</span>
                          <span className="text-turf font-mono">{item.count} clips ({item.pct})</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-canvas overflow-hidden">
                          <div
                            className="h-full bg-turf rounded-full"
                            style={{ width: item.pct }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
                  <h3 className="font-display text-lg font-bold text-ink">Distribución por Cancha</h3>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-canvas border border-line flex justify-between items-center">
                      <span className="font-sans font-bold text-ink">Cancha 1 (F5)</span>
                      <span className="text-volt font-bold">64 partidos grabados · 480 clips</span>
                    </div>
                    <div className="p-3 rounded-lg bg-canvas border border-line flex justify-between items-center">
                      <span className="font-sans font-bold text-ink">Cancha 2 (F5)</span>
                      <span className="text-ink-muted">42 partidos grabados · 210 clips</span>
                    </div>
                    <div className="p-3 rounded-lg bg-canvas border border-line flex justify-between items-center">
                      <span className="font-sans font-bold text-ink">Cancha 3 (F7 Techada)</span>
                      <span className="text-turf font-bold">36 partidos grabados · 157 clips</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Printable Court QR Modal */}
      {qrModalCourtId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-line p-6 shadow-2xl text-ink text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl bg-turf-soft flex items-center justify-center text-turf">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-turf-ink font-mono">
                Cartel Oficial Canchas3 para Reja
              </p>
              <h3 className="font-display text-2xl font-bold text-ink mt-1">
                Cancha 1 · Estación Norte
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                Los jugadores escanean este código con la cámara de su celular para abrir la transmisión en vivo o buscar su partido grabado.
              </p>
            </div>

            {/* Simulated Printed Sign Preview */}
            <div className="p-6 rounded-xl bg-white text-zinc-900 border-2 border-dashed border-zinc-300 space-y-3 shadow-inner">
              <div className="inline-block p-4 rounded-xl bg-zinc-900 text-white">
                <QrCode className="w-36 h-36 mx-auto text-[#c4f236]" />
              </div>
              <div>
                <p className="font-extrabold text-sm uppercase tracking-wider text-zinc-900">
                  Mirá tu partido grabado en vivo
                </p>
                <p className="text-[11px] text-zinc-600 font-mono">
                  canchas3.com/qr/cancha-1
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="volt"
                size="md"
                fullWidth
                onClick={() => {
                  window.open(buildQrScanPath('cancha-1'), '_blank');
                  setQrModalCourtId(null);
                }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir enlace como jugador</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setQrModalCourtId(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
