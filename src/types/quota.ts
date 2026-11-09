/** Cupo gratuito y paquete de jugadas extra que configura el superadmin (`/api/platform/play-settings`). */
export interface PlaySettings {
  /** Jugadas guardadas que cada jugador puede tener gratis. */
  freeQuota: number;
  /** Jugadas que trae el paquete extra. */
  packPlays: number;
  /** Precio del paquete, en pesos argentinos enteros. */
  packPrice: number;
}

/** El paquete de jugadas extra que se ofrece al llegar al cupo. */
export interface PlayPack {
  plays: number;
  /** Pesos argentinos enteros. */
  price: number;
}

/** El uso y el cupo de un jugador: el total es el cupo gratuito más sus jugadas extra. */
export interface PlayerQuota {
  /** Jugadas guardadas ahora. */
  used: number;
  freeQuota: number;
  extraPlays: number;
  total: number;
}

/** `GET /api/plays/quota`: el cupo del jugador y el paquete vigente. */
export interface PlayerQuotaInfo extends PlayerQuota {
  pack: PlayPack;
}

export type PlayPaymentStatus = 'pending' | 'approved' | 'rejected';

/** Un intento de compra del paquete. Hoy es siempre una demostración (`provider: 'simulated'`): no se cobra nada. */
export interface PlayPayment {
  id: string;
  plays: number;
  price: number;
  status: PlayPaymentStatus;
  provider: string;
  createdAt: string;
  resolvedAt: string | null;
}

/** Respuesta de aprobar o rechazar un intento: el pago resuelto y el cupo que queda. */
export interface ResolvedPayment {
  payment: PlayPayment;
  quota: PlayerQuota;
}
