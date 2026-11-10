import {
  BenefitItem,
  FaqItem,
  OwnerBenefitItem,
  PlaceholderModalInfo,
  StepItem,
  TestimonialItem,
} from '../types/canchas';

export const NAV_LINKS = [
  { label: 'Canchas en vivo', href: '/en-vivo' },
  { label: 'Complejos', href: '#complejos' },
  { label: 'Para complejos', href: '#para-complejos' },
];

export const HOW_IT_WORKS_STEPS: StepItem[] = [
  {
    number: '01',
    title: 'Buscá tu partido o cancha',
    description:
      'Seleccioná tu complejo deportivo, la cancha, el día y el horario en el que jugaste tu partido.',
    imageSrc: '/assets/como-funciona/paso-1-buscar.webp',
    imageAlt: 'Un jugador consulta su teléfono junto a una cancha de fútbol 5 al atardecer.',
  },
  {
    number: '02',
    title: 'Reviví la grabación en HD',
    description:
      'Accedé al video transmitido por cámaras inteligentes instaladas en el complejo sin camarógrafo.',
    imageSrc: '/assets/como-funciona/paso-2-grabacion.webp',
    imageAlt: 'Un jugador mira en una tablet la repetición de un partido junto a la cancha.',
  },
  {
    number: '03',
    title: 'Marcá tu jugada y compartila',
    description:
      'Con un toque recortás los mejores 20 segundos de tu gol o atajada para descargar y compartir en WhatsApp o Instagram.',
    imageSrc: '/assets/como-funciona/paso-3-jugada.webp',
    imageAlt: 'Tres compañeros de fútbol comparten una jugada en un teléfono después del partido.',
  },
];

export const PLAYER_BENEFITS: BenefitItem[] = [
  {
    id: 'disponibilidad',
    title: 'Disponibilidad actualizada',
    description:
      'Consultá los turnos libres por cancha y por día sin depender de mensajes ni demoras.',
    iconName: 'calendar-check',
  },
  {
    id: 'reserva-rapida',
    title: 'Reserva rápida',
    description:
      'Completá tu reserva en pocos pasos desde el celular o la computadora.',
    iconName: 'zap',
  },
  {
    id: 'precios-claros',
    title: 'Precios claros',
    description:
      'Ves el valor del turno por cancha y franja horaria antes de confirmar.',
    iconName: 'receipt',
  },
  {
    id: 'ubicacion',
    title: 'Ubicación precisa',
    description:
      'Identificá rápido el barrio y la dirección exacta de cada complejo deportivo.',
    iconName: 'map-pin',
  },
  {
    id: 'confirmacion',
    title: 'Confirmación inmediata',
    description:
      'Recibís el resumen de tu turno al instante para compartirlo con quienes juegan.',
    iconName: 'check-circle',
  },
];

export const OWNER_SECTION_COPY = {
  kicker: 'Para complejos deportivos',
  headline: 'Equipá tus canchas con cámaras inteligentes y fidelizá a tus jugadores',
  description:
    'Instalá el sistema automatizado de cámaras en tu club. Ofrecé a los jugadores revivir sus partidos y compartir sus jugadas, mientras gestionás turnos y atraés nuevos equipos.',
  ctaLabel: 'Quiero sumar mi complejo',
  secondaryLabel: 'Soy dueño de un complejo',
};

export const OWNER_BENEFITS: OwnerBenefitItem[] = [
  {
    id: 'mas-reservas',
    title: 'Más reservas',
    description:
      'Mostrá tus horarios libres a personas que están buscando dónde jugar en tu zona.',
    iconName: 'trending-up',
  },
  {
    id: 'agenda-centralizada',
    title: 'Agenda centralizada',
    description:
      'Visualizá todas tus canchas organizadas por horario y superficie en una misma grilla.',
    iconName: 'layout-grid',
  },
  {
    id: 'pagos-confirmaciones',
    title: 'Pagos y confirmaciones',
    description:
      'Ordená las confirmaciones de cada turno y evitá superposiciones o huecos sin aviso.',
    iconName: 'wallet',
  },
  {
    id: 'estadisticas',
    title: 'Estadísticas',
    description:
      'Seguí la ocupación por día, cancha y franja horaria para aprovechar mejor cada turno.',
    iconName: 'bar-chart',
  },
];

export const EXAMPLE_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testimonio-1',
    quote:
      'Elegimos el complejo y el horario en el que jugamos y ahí estaba el video del partido, sin camarógrafo ni nada. Fue ver el gol de nuevo y no parar de reírnos.',
    authorName: 'Martín Echeverría',
    authorRole: 'Organizador de partido semanal',
    sportContext: 'Fútbol 5 · Palermo',
  },
  {
    id: 'testimonio-2',
    quote:
      'Marqué mi atajada, recorté los segundos y la mandé al grupo de WhatsApp en un toque. Se ve bien, en HD, y todos pudieron mirarla desde el celular.',
    authorName: 'Lucía Ferreyra',
    authorRole: 'Jugadora de torneo amateur',
    sportContext: 'Fútbol 7 · Belgrano',
  },
  {
    id: 'testimonio-3',
    quote:
      'Siempre discutíamos si la pelota había entrado o no. Ahora abrimos el partido, vemos la jugada y se terminó la discusión.',
    authorName: 'Nicolás Paredes',
    authorRole: 'Jugador de los jueves',
    sportContext: 'Fútbol 5 · Villa Crespo',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'ver-video',
    question: '¿Cómo veo el video de mi partido?',
    answer:
      'Elegí el complejo, la cancha, el día y el horario en el que jugaste desde el buscador de arriba y abrí el partido en video HD. Es el video de las cámaras instaladas en el complejo, sin camarógrafo.',
  },
  {
    id: 'guardar-compartir-jugada',
    question: '¿Cómo guardo y comparto una jugada?',
    answer:
      'Mientras mirás el partido, marcá la jugada: recortás unos 20 segundos y los descargás o los compartís por WhatsApp o Instagram. Para guardarla en tu perfil tenés que ingresar con tu mail.',
  },
  {
    id: 'como-reservar',
    question: '¿Cómo hago para reservar una cancha en Canchas3?',
    answer:
      'Elegí el complejo desde el buscador o desde el listado, seleccioná la cancha, el día y el horario disponible, y completá tu nombre y WhatsApp para confirmar la reserva en pocos pasos.',
  },
  {
    id: 'cancelaciones',
    question: '¿Cómo funcionan las cancelaciones o cambios de horario?',
    answer:
      'Cada complejo establece su plazo de anticipación para reprogramar o cancelar un turno sin cargo. Al confirmar tu reserva ves las condiciones del club y podés contactarte directo por WhatsApp si surge un imprevisto.',
  },
  {
    id: 'registrar-complejo',
    question: '¿Cómo puedo registrar mi complejo deportivo?',
    answer:
      'Hacé clic en "Quiero sumar mi complejo", completá el formulario con el nombre de tu espacio, un contacto y tu ciudad, y nuestro equipo se comunica para ayudarte a cargar tus canchas y horarios.',
  },
];

export const PLACEHOLDER_MODALS: Record<string, PlaceholderModalInfo> = {
  ingresar: {
    title: 'Ingresar a tu cuenta',
    subtitle: 'Acceso de jugadores y complejos',
    description:
      'El inicio de sesión y el historial personal de reservas estarán disponibles en la próxima etapa de Canchas3. Por ahora podés explorar complejos y simular reservas directamente desde esta página.',
    actionLabel: 'Seguir explorando canchas',
  },
  terminos: {
    title: 'Términos y condiciones',
    subtitle: 'Información general de uso',
    description:
      'Este enlace es un placeholder de demostración visual para Canchas3. En la versión productiva detallará las condiciones de reserva, políticas de cada complejo y uso de la plataforma.',
    actionLabel: 'Entendido',
  },
  privacidad: {
    title: 'Política de privacidad',
    subtitle: 'Cuidado de tus datos',
    description:
      'Este enlace es un placeholder de demostración visual. En esta vista previa no se almacenan datos personales ni se envían formularios a servidores externos.',
    actionLabel: 'Entendido',
  },
  contacto: {
    title: 'Contacto Canchas3',
    subtitle: 'Atención a jugadores y clubes',
    description:
      'Escribinos a hola@canchas3.com.ar o usá el formulario "Quiero sumar mi complejo" si administrás un club deportivo.',
    actionLabel: 'Cerrar',
  },
  redes: {
    title: 'Redes sociales de Canchas3',
    subtitle: 'Comunidad futbolera',
    description:
      'Los accesos a redes sociales son placeholders en esta vista previa interactiva de Canchas3.',
    actionLabel: 'Volver a la página',
  },
};
