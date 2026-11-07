import React, { useState } from 'react';
import { CourtVisualVariant, SportType } from '../../types/canchas';

interface ComplexImagePlaceholderProps {
  imageUrl?: string;
  name: string;
  zone: string;
  sports: SportType[];
  variant: CourtVisualVariant;
}

export const ComplexImagePlaceholder: React.FC<ComplexImagePlaceholderProps> = ({
  imageUrl,
  name,
  zone,
  sports,
  variant,
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  if (imageUrl && !hasImageError) {
    return (
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-pitch">
        <img
          src={imageUrl}
          alt={`${name} — Complejo de fútbol en ${zone}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setHasImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[16/10] overflow-hidden bg-pitch select-none"
      role="img"
      aria-label={`Ilustración arquitectónica de canchas de fútbol en ${name}, ${zone} (${sports.join(', ')})`}
    >
      <CourtArchitecturalIllustration variant={variant} />
    </div>
  );
};

const CourtArchitecturalIllustration: React.FC<{ variant: CourtVisualVariant }> = ({
  variant,
}) => {
  switch (variant) {
    case 'multi-pitch':
      return (
        <svg
          viewBox="0 0 640 400"
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mp-pitch-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#146635" />
              <stop offset="100%" stopColor="#0d4724" />
            </linearGradient>
            <linearGradient id="mp-pitch-2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#197a40" />
              <stop offset="100%" stopColor="#11552c" />
            </linearGradient>
          </defs>
          <rect width="640" height="400" fill="#09100c" />
          {/* Subtle perimeter glow */}
          <circle cx="320" cy="200" r="280" fill="#156e39" fillOpacity="0.08" />

          {/* Left 7v7 pitch */}
          <rect
            x="48"
            y="54"
            width="324"
            height="292"
            rx="6"
            fill="url(#mp-pitch-1)"
            stroke="#2f543d"
            strokeWidth="2"
          />
          {/* Mowing stripes */}
          <g fill="#ffffff" fillOpacity="0.04">
            <rect x="48" y="54" width="81" height="292" />
            <rect x="210" y="54" width="81" height="292" />
          </g>
          {/* Markings */}
          <rect
            x="56"
            y="62"
            width="308"
            height="276"
            rx="4"
            stroke="#ffffff"
            strokeOpacity="0.75"
            strokeWidth="1.8"
          />
          <line
            x1="210"
            y1="62"
            x2="210"
            y2="338"
            stroke="#ffffff"
            strokeOpacity="0.75"
            strokeWidth="1.8"
          />
          <circle
            cx="210"
            cy="200"
            r="44"
            stroke="#c4f236"
            strokeOpacity="0.85"
            strokeWidth="2.2"
          />
          <circle cx="210" cy="200" r="4" fill="#c4f236" />
          <rect
            x="56"
            y="126"
            width="54"
            height="148"
            stroke="#ffffff"
            strokeOpacity="0.65"
            strokeWidth="1.8"
          />
          <rect
            x="310"
            y="126"
            width="54"
            height="148"
            stroke="#ffffff"
            strokeOpacity="0.65"
            strokeWidth="1.8"
          />

          {/* Right two 5v5 pitches */}
          <rect
            x="396"
            y="54"
            width="196"
            height="134"
            rx="6"
            fill="url(#mp-pitch-2)"
            stroke="#c4f236"
            strokeOpacity="0.6"
            strokeWidth="2"
          />
          <rect
            x="404"
            y="62"
            width="180"
            height="118"
            rx="3"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
          <line
            x1="494"
            y1="62"
            x2="494"
            y2="180"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
          <circle
            cx="494"
            cy="121"
            r="24"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />

          <rect
            x="396"
            y="212"
            width="196"
            height="134"
            rx="6"
            fill="url(#mp-pitch-2)"
            stroke="#2f543d"
            strokeWidth="2"
          />
          <rect
            x="404"
            y="220"
            width="180"
            height="118"
            rx="3"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
          <line
            x1="494"
            y1="220"
            x2="494"
            y2="338"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
          <circle
            cx="494"
            cy="279"
            r="24"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'night-stadium':
      return (
        <svg
          viewBox="0 0 640 400"
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="floodlight-1" cx="56" cy="48" r="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c4f236" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c4f236" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floodlight-2" cx="584" cy="48" r="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c4f236" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c4f236" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floodlight-3" cx="56" cy="352" r="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c4f236" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c4f236" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floodlight-4" cx="584" cy="352" r="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c4f236" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#c4f236" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="stadium-turf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#166e3a" />
              <stop offset="100%" stopColor="#0f4f29" />
            </linearGradient>
          </defs>
          <rect width="640" height="400" fill="#060b08" />

          {/* Floodlights back illumination */}
          <circle cx="56" cy="48" r="160" fill="url(#floodlight-1)" />
          <circle cx="584" cy="48" r="160" fill="url(#floodlight-2)" />
          <circle cx="56" cy="352" r="160" fill="url(#floodlight-3)" />
          <circle cx="584" cy="352" r="160" fill="url(#floodlight-4)" />

          <rect
            x="56"
            y="48"
            width="528"
            height="304"
            rx="8"
            fill="url(#stadium-turf)"
            stroke="#274633"
            strokeWidth="2.5"
          />

          {/* Mowing stripes */}
          <g fill="#ffffff" fillOpacity="0.045">
            <rect x="56" y="48" width="66" height="304" />
            <rect x="188" y="48" width="66" height="304" />
            <rect x="320" y="48" width="66" height="304" />
            <rect x="452" y="48" width="66" height="304" />
          </g>

          {/* Markings */}
          <rect
            x="68"
            y="60"
            width="504"
            height="280"
            rx="4"
            stroke="#ffffff"
            strokeOpacity="0.85"
            strokeWidth="2.2"
          />
          <line
            x1="320"
            y1="60"
            x2="320"
            y2="340"
            stroke="#ffffff"
            strokeOpacity="0.85"
            strokeWidth="2.2"
          />
          <circle
            cx="320"
            cy="200"
            r="60"
            stroke="#c4f236"
            strokeOpacity="0.9"
            strokeWidth="2.5"
          />
          <circle cx="320" cy="200" r="5" fill="#c4f236" />

          {/* Penalty boxes */}
          <rect
            x="68"
            y="114"
            width="92"
            height="172"
            stroke="#ffffff"
            strokeOpacity="0.75"
            strokeWidth="2"
          />
          <rect
            x="68"
            y="150"
            width="36"
            height="100"
            stroke="#ffffff"
            strokeOpacity="0.65"
            strokeWidth="1.8"
          />
          <rect
            x="480"
            y="114"
            width="92"
            height="172"
            stroke="#ffffff"
            strokeOpacity="0.75"
            strokeWidth="2"
          />
          <rect
            x="536"
            y="150"
            width="36"
            height="100"
            stroke="#ffffff"
            strokeOpacity="0.65"
            strokeWidth="1.8"
          />

          {/* Corner floodlight lamp beacons */}
          <circle cx="56" cy="48" r="8" fill="#c4f236" />
          <circle cx="584" cy="48" r="8" fill="#c4f236" />
          <circle cx="56" cy="352" r="8" fill="#c4f236" />
          <circle cx="584" cy="352" r="8" fill="#c4f236" />
        </svg>
      );

    case 'rooftop-pitch':
    case 'soccer-turf':
    case 'indoor-pitch':
    case 'clubhouse-turf':
    default:
      return (
        <svg
          viewBox="0 0 640 400"
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="general-turf" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#156e39" />
              <stop offset="100%" stopColor="#0e4b26" />
            </linearGradient>
          </defs>
          <rect width="640" height="400" fill="#09100c" />

          {/* Turf mowing stripes */}
          <g fill="#187a40" fillOpacity="0.25">
            <rect x="64" y="54" width="64" height="292" />
            <rect x="192" y="54" width="64" height="292" />
            <rect x="320" y="54" width="64" height="292" />
            <rect x="448" y="54" width="64" height="292" />
          </g>

          {/* Outer pitch boundary */}
          <rect
            x="64"
            y="54"
            width="512"
            height="292"
            rx="6"
            fill="url(#general-turf)"
            fillOpacity="0.55"
            stroke="#2b4d38"
            strokeWidth="2.5"
          />

          {/* Regulation pitch markings */}
          <rect
            x="76"
            y="66"
            width="488"
            height="268"
            rx="4"
            stroke="#ffffff"
            strokeOpacity="0.8"
            strokeWidth="2.2"
          />
          <line
            x1="320"
            y1="66"
            x2="320"
            y2="334"
            stroke="#ffffff"
            strokeOpacity="0.8"
            strokeWidth="2.2"
          />
          <circle
            cx="320"
            cy="200"
            r="54"
            stroke="#c4f236"
            strokeOpacity="0.85"
            strokeWidth="2.5"
          />
          <circle cx="320" cy="200" r="4.5" fill="#c4f236" />

          {/* Penalty areas */}
          <rect
            x="76"
            y="122"
            width="82"
            height="156"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="2"
          />
          <rect
            x="482"
            y="122"
            width="82"
            height="156"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="2"
          />

          {/* Broadcast Live Indicator */}
          <g transform="translate(460, 24)">
            <rect width="116" height="22" rx="4" fill="#111c16" stroke="#253e2e" strokeWidth="1" />
            <circle cx="12" cy="11" r="3.5" fill="#ef4444" />
            <text x="22" y="14.5" fill="#e2ede5" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="600">CÁMARA IP HD</text>
          </g>
        </svg>
      );
  }
};
