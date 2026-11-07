/**
 * Configuración Mock del MVP Canchas3 (Requerimientos MGV)
 *
 * Este archivo centraliza las decisiones de negocio y técnicas que el cliente
 * MGV aún mantiene abiertas o en evaluación. Permite cambiar parámetros de demo
 * sin requerir cambios estructurales de código.
 */

export type MonetizationModel = 'free_demo' | 'freemium' | 'pay_per_match' | 'subscription';
export type RetentionPolicy = '14_days' | '30_days' | '60_days' | 'indefinite';
export type StreamingBackendSim = 'simulated_mp4' | 'rtsp_stream' | 'hls_adaptive';

export interface ClubAccessRules {
  clubId: string;
  clubName: string;
  allowOpenViewing: boolean; // ¿Cualquiera con el link puede ver el partido o solo los que jugaron?
  requireLoginToWatch: boolean;
  allowFullMatchDownload: boolean; // ¿Se puede descargar el archivo completo de 60 minutos?
  allowClipsDownload: boolean; // ¿Se pueden descargar las jugadas cortas de 20s?
  qrCourtAccessEnabled: boolean; // ¿Hay sticker con código QR en la reja de la cancha para ver la transmisión?
  retentionDays: number;
  monetization: MonetizationModel;
  matchPriceArs: number;
}

export interface MvpPlatformConfig {
  version: string;
  targetClient: 'MGV';
  // Decisiones de acceso y login
  requireLoginToWatch: boolean;
  requireLoginToSavePlay: boolean;
  allowGuestAccess: boolean;

  // Decisiones de descarga y exportación
  allowFullMatchDownload: boolean;
  allowClipShare: boolean;

  // Decisiones de retención
  retentionPolicy: RetentionPolicy;
  retentionDaysNumber: number;

  // Decisiones de QR e ingreso en campo
  qrAccessInCourt: boolean;

  // Modelo de monetización
  monetizationModel: MonetizationModel;
  defaultPriceArs: number;

  // Configuración de streaming
  streamingBackend: StreamingBackendSim;

  // Reglas configurables por club
  clubsConfig: Record<string, ClubAccessRules>;
}

export const INITIAL_MVP_CONFIG: MvpPlatformConfig = {
  version: '6.1-MVP-MGV',
  targetClient: 'MGV',

  // 1. Acceso y Login: en esta etapa el login es opcional (flujo invitado habilitado)
  requireLoginToWatch: false,
  requireLoginToSavePlay: false,
  allowGuestAccess: true,

  // 2. Descargas: clips de jugadas habilitados; descarga del partido completo en evaluación
  allowFullMatchDownload: false,
  allowClipShare: true,

  // 3. Retención: 30 días como parámetro inicial sugerido
  retentionPolicy: '30_days',
  retentionDaysNumber: 30,

  // 4. QR en cancha: preparado conceptualmente para acceso directo con cámara del celular
  qrAccessInCourt: true,

  // 5. Monetización: modo demo libre, preparado para cobro por partido o suscripción
  monetizationModel: 'free_demo',
  defaultPriceArs: 2500,

  // 6. Streaming: simulado con MP4 local, interfaz lista para proxy RTSP/HLS
  streamingBackend: 'simulated_mp4',

  clubsConfig: {
    'estacion-norte': {
      clubId: 'estacion-norte',
      clubName: 'Estación Norte Fútbol',
      allowOpenViewing: true,
      requireLoginToWatch: false,
      allowFullMatchDownload: false,
      allowClipsDownload: true,
      qrCourtAccessEnabled: true,
      retentionDays: 30,
      monetization: 'free_demo',
      matchPriceArs: 2500,
    },
    'deportivo-palermo': {
      clubId: 'deportivo-palermo',
      clubName: 'Club Deportivo Palermo',
      allowOpenViewing: false,
      requireLoginToWatch: true,
      allowFullMatchDownload: true,
      allowClipsDownload: true,
      qrCourtAccessEnabled: true,
      retentionDays: 45,
      monetization: 'freemium',
      matchPriceArs: 3000,
    },
  },
};
