import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../../data/landingContent';
import { StepItem } from '../../types/canchas';
import { Button } from '../ui/Button';

interface HowItWorksSectionProps {
  onPrimaryCta: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onPrimaryCta,
}) => {
  return (
    <section
      id="como-funciona"
      className="py-14 sm:py-20 bg-surface border-b border-line scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-turf-ink">
              Cómo funciona
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink">
              De la idea a la cancha en tres pasos
            </h2>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onPrimaryCta}
            className="self-start md:self-auto"
          >
            Reservá tu cancha
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line border-t border-b border-line">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article
              key={step.number}
              className="py-8 md:py-9 md:px-7 first:md:pl-0 last:md:pr-0 flex flex-col"
            >
              <StepCourtSchematic type={step.visualType} />

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl font-extrabold text-turf tabular-nums">
                  {step.number}
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
              </div>

              <p className="mt-2.5 text-sm sm:text-base text-ink-muted leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const StepCourtSchematic: React.FC<{ type: StepItem['visualType'] }> = ({
  type,
}) => {
  if (type === 'discover') {
    return (
      <div
        className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-pitch border border-pitch-line/80 shadow-md group transition-all duration-200 hover:border-volt/40"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 400 240"
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="radar-glow" cx="130" cy="120" r="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c4f236" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#156e39" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#09100c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pitch-grad-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#156e39" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0e4b26" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="pitch-grad-2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a8043" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#11532c" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Background Stadium Canvas */}
          <rect width="400" height="240" fill="#09100c" />

          {/* Tactical Urban / Pitch Grid */}
          <g stroke="#18271e" strokeWidth="1" strokeDasharray="3 4">
            <line x1="0" y1="40" x2="400" y2="40" />
            <line x1="0" y1="80" x2="400" y2="80" />
            <line x1="0" y1="120" x2="400" y2="120" />
            <line x1="0" y1="160" x2="400" y2="160" />
            <line x1="0" y1="200" x2="400" y2="200" />
            <line x1="80" y1="0" x2="80" y2="240" />
            <line x1="160" y1="0" x2="160" y2="240" />
            <line x1="240" y1="0" x2="240" y2="240" />
            <line x1="320" y1="0" x2="320" y2="240" />
          </g>

          {/* Radar Scanning Rings emanating from User Beacon */}
          <circle cx="130" cy="120" r="140" fill="url(#radar-glow)" />
          <circle cx="130" cy="120" r="42" stroke="#c4f236" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="130" cy="120" r="88" stroke="#c4f236" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="4 4" />
          <circle cx="130" cy="120" r="132" stroke="#c4f236" strokeWidth="1" strokeOpacity="0.15" />

          {/* Nearby Pitch 1 (Tactical View with Markings) */}
          <g transform="translate(60, 50)">
            <rect width="140" height="88" rx="6" fill="url(#pitch-grad-1)" stroke="#2f4e3b" strokeWidth="1.5" />
            {/* Turf stripes */}
            <rect x="0" y="0" width="35" height="88" fill="#ffffff" fillOpacity="0.05" />
            <rect x="70" y="0" width="35" height="88" fill="#ffffff" fillOpacity="0.05" />
            {/* Markings */}
            <rect x="6" y="6" width="128" height="76" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" rx="2" fill="none" />
            <line x1="70" y1="6" x2="70" y2="82" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" />
            <circle cx="70" cy="44" r="16" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.2" fill="none" />
            <rect x="6" y="24" width="22" height="40" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" fill="none" />
            <rect x="112" y="24" width="22" height="40" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" fill="none" />
          </g>

          {/* Secondary Pitch 2 */}
          <g transform="translate(230, 105)">
            <rect width="125" height="78" rx="5" fill="url(#pitch-grad-2)" stroke="#233a2c" strokeWidth="1" />
            <rect x="5" y="5" width="115" height="68" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" rx="2" fill="none" />
            <line x1="62.5" y1="5" x2="62.5" y2="73" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
            <circle cx="62.5" cy="39" r="14" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" fill="none" />
          </g>

          {/* User Location Pulse Beacon */}
          <circle cx="130" cy="120" r="14" fill="#c4f236" fillOpacity="0.25" />
          <circle cx="130" cy="120" r="6" fill="#c4f236" />
          <circle cx="130" cy="120" r="2.5" fill="#09100c" />

          {/* Highlighted Complex Location Callout Badge */}
          <g transform="translate(150, 24)">
            <rect width="186" height="42" rx="8" fill="#111c16" stroke="#c4f236" strokeWidth="1.2" strokeOpacity="0.9" />
            <circle cx="16" cy="21" r="5" fill="#c4f236" />
            <text x="28" y="18" fill="#ffffff" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="11" fontWeight="700">Estación Norte · F5</text>
            <text x="28" y="32" fill="#c4f236" fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fontWeight="600">A 4 cuadras · 3 canchas</text>
          </g>

          {/* Tactical Search Coordinates overlay */}
          <text x="18" y="222" fill="#587063" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.5">MAPA DISPONIBLE · BUENOS AIRES</text>
        </svg>
      </div>
    );
  }

  if (type === 'schedule') {
    return (
      <div
        className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-pitch border border-pitch-line/80 shadow-md group transition-all duration-200 hover:border-volt/40"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 400 240"
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="active-slot-glow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4f236" />
              <stop offset="100%" stopColor="#a7df17" />
            </linearGradient>
          </defs>

          {/* Background Stadium Canvas */}
          <rect width="400" height="240" fill="#09100c" />

          {/* Header schedule bar */}
          <g transform="translate(24, 18)">
            <rect width="352" height="38" rx="8" fill="#111c16" stroke="#1f3427" strokeWidth="1" />
            {/* Date picker chips */}
            <rect x="8" y="7" width="86" height="24" rx="5" fill="#1c3024" stroke="#c4f236" strokeWidth="1" strokeOpacity="0.5" />
            <circle cx="18" cy="19" r="3" fill="#c4f236" />
            <text x="26" y="22" fill="#ffffff" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700">HOY VIERNES</text>

            <rect x="100" y="7" width="60" height="24" rx="5" fill="#142119" />
            <text x="114" y="22" fill="#6f8a7a" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="600">SÁBADO</text>

            {/* Camera badge on right */}
            <g transform="translate(242, 9)">
              <rect width="102" height="20" rx="4" fill="#09100c" stroke="#253e2e" strokeWidth="1" />
              <circle cx="10" cy="10" r="3" fill="#ef4444" />
              <text x="18" y="13.5" fill="#e2ede5" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fontWeight="600">CÁMARA HD ACTIVA</text>
            </g>
          </g>

          {/* Pitch label banner */}
          <g transform="translate(24, 70)">
            <text x="0" y="10" fill="#a4bcad" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.5">CANCHA 1 · FÚTBOL 5 (SINTÉTICO FORBO PRO)</text>
          </g>

          {/* 3 Match Time Slots */}
          {/* Slot 1: 19:00 (Ocupado / Reservado) */}
          <g transform="translate(24, 94)">
            <rect width="106" height="88" rx="8" fill="#101813" stroke="#1c2c21" strokeWidth="1" />
            <text x="14" y="26" fill="#6b8073" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="16" fontWeight="800">19:00</text>
            <text x="60" y="23" fill="#586e61" fontFamily="'JetBrains Mono', monospace" fontSize="9">HS</text>
            <rect x="14" y="38" width="56" height="18" rx="4" fill="#18231c" />
            <text x="20" y="50" fill="#6b8073" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fontWeight="600">Ocupado</text>
            <line x1="14" y1="68" x2="92" y2="68" stroke="#1c2c21" strokeWidth="1" />
            <text x="14" y="80" fill="#4d6154" fontFamily="'JetBrains Mono', monospace" fontSize="8.5">NO DISPONIBLE</text>
          </g>

          {/* Slot 2: 20:00 (SELECTED / PROTAGONIST - GLOWING VOLT) */}
          <g transform="translate(138, 88)">
            <rect width="128" height="100" rx="10" fill="#16271c" stroke="#c4f236" strokeWidth="2" />
            <g transform="translate(0, 0)">
              {/* Top banner in active card */}
              <rect width="128" height="24" rx="8" fill="url(#active-slot-glow)" />
              <text x="12" y="16" fill="#09100c" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="900" letterSpacing="0.5">TURNO ELEGIDO</text>
              {/* Check circle icon */}
              <circle cx="112" cy="12" r="6" fill="#09100c" />
              <path d="M109.5 12L111.5 14L114.5 10" stroke="#c4f236" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {/* Time */}
            <text x="14" y="54" fill="#ffffff" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="20" fontWeight="900">20:00</text>
            <text x="74" y="50" fill="#c4f236" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="700">HS</text>
            {/* Price tag */}
            <text x="14" y="74" fill="#c4f236" fontFamily="'JetBrains Mono', monospace" fontSize="12" fontWeight="700">$28.000</text>
            <text x="14" y="90" fill="#8ba695" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9">Grabación HD incluida</text>
          </g>

          {/* Slot 3: 21:00 (Disponible) */}
          <g transform="translate(274, 94)">
            <rect width="102" height="88" rx="8" fill="#111c16" stroke="#253c2d" strokeWidth="1" />
            <text x="14" y="26" fill="#d2ded6" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="16" fontWeight="800">21:00</text>
            <text x="60" y="23" fill="#819c8d" fontFamily="'JetBrains Mono', monospace" fontSize="9">HS</text>
            <rect x="14" y="38" width="66" height="18" rx="4" fill="#182d20" />
            <text x="20" y="50" fill="#75db95" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fontWeight="700">Disponible</text>
            <line x1="14" y1="68" x2="88" y2="68" stroke="#1f3426" strokeWidth="1" />
            <text x="14" y="80" fill="#88a192" fontFamily="'JetBrains Mono', monospace" fontSize="9">$30.000</text>
          </g>

          {/* Footer hint */}
          <text x="24" y="218" fill="#587063" fontFamily="'JetBrains Mono', monospace" fontSize="9">1-TAP SELECTION · SIN LLAMADAS NI DEMORAS</text>
        </svg>
      </div>
    );
  }

  // Visual for Step 3: "confirm" ("03 Confirmá y jugá")
  return (
    <div
      className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-pitch border border-pitch-line/80 shadow-md group transition-all duration-200 hover:border-volt/40"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 240"
        className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ticket-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#142119" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0b140f" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="ball-shadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background Stadium Canvas */}
        <rect width="400" height="240" fill="#09100c" />

        {/* Full Regulation Soccer Pitch with mowing stripes */}
        <g transform="translate(24, 18)">
          <rect width="352" height="204" rx="8" fill="#135b30" stroke="#254734" strokeWidth="1.5" />

          {/* Mowed lawn vertical stripes */}
          <g fill="#166d3a">
            <rect x="0" y="0" width="44" height="204" />
            <rect x="88" y="0" width="44" height="204" />
            <rect x="176" y="0" width="44" height="204" />
            <rect x="264" y="0" width="44" height="204" />
          </g>

          {/* Regulation Touchlines */}
          <rect x="10" y="10" width="332" height="184" rx="4" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" fill="none" />
          {/* Halfway line */}
          <line x1="176" y1="10" x2="176" y2="194" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" />
          {/* Center circle */}
          <circle cx="176" cy="102" r="36" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" fill="none" />
          {/* Center spot */}
          <circle cx="176" cy="102" r="3" fill="#ffffff" fillOpacity="0.8" />
          {/* Penalty boxes left & right */}
          <rect x="10" y="54" width="56" height="96" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.8" fill="none" />
          <rect x="10" y="76" width="22" height="52" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" fill="none" />
          <rect x="286" y="54" width="56" height="96" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.8" fill="none" />
          <rect x="320" y="76" width="22" height="52" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" fill="none" />

          {/* Corner arcs */}
          <path d="M10 20 A10 10 0 0 1 20 10" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" fill="none" />
          <path d="M332 10 A10 10 0 0 1 342 20" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" fill="none" />
          <path d="M10 184 A10 10 0 0 0 20 194" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" fill="none" />
          <path d="M332 194 A10 10 0 0 0 342 184" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" fill="none" />
        </g>

        {/* 3D Soccer Ball resting on the pitch */}
        <g transform="translate(64, 126)">
          <ellipse cx="22" cy="38" rx="16" ry="5" fill="url(#ball-shadow)" />
          <circle cx="22" cy="22" r="16" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
          {/* Classic black pentagons */}
          <polygon points="22,14 28,18 26,25 18,25 16,18" fill="#0f172a" />
          <polygon points="22,6 26,10 20,11" fill="#0f172a" />
          <polygon points="34,18 38,22 36,26 31,24 32,19" fill="#0f172a" />
          <polygon points="10,18 6,22 8,26 13,24 12,19" fill="#0f172a" />
        </g>

        {/* Digital Match Confirmation Card Overlay */}
        <g transform="translate(142, 50)">
          <rect width="216" height="138" rx="12" fill="url(#ticket-grad)" stroke="#c4f236" strokeWidth="1.5" />

          {/* Top badge with verified icon */}
          <g transform="translate(16, 16)">
            <circle cx="14" cy="14" r="14" fill="#c4f236" />
            <path d="M9 14.5L12.5 18L19 10.5" stroke="#09100c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <text x="36" y="14" fill="#ffffff" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="13" fontWeight="800">TURNO CONFIRMADO</text>
            <text x="36" y="26" fill="#c4f236" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700">RESERVA INMEDIATA</text>
          </g>

          {/* Divider dashed */}
          <line x1="16" y1="56" x2="200" y2="56" stroke="#253a2d" strokeWidth="1" strokeDasharray="3 3" />

          {/* Details */}
          <text x="16" y="74" fill="#a0b8aa" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="600">VIERNES 20:00 HS · CANCHA 1</text>
          <text x="16" y="90" fill="#e5eee8" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="12" fontWeight="700">Estación Norte (Fútbol 5)</text>

          {/* Live Recording Camera pill badge */}
          <g transform="translate(16, 104)">
            <rect width="184" height="20" rx="4" fill="#182c20" stroke="#2e4e3a" strokeWidth="1" />
            <circle cx="10" cy="10" r="3.5" fill="#ef4444" />
            <text x="18" y="13.5" fill="#c8dfd1" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fontWeight="600">CÁMARA GRABANDO EL PARTIDO</text>
          </g>
        </g>
      </svg>
    </div>
  );
};
