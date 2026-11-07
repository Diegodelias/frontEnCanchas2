import React from 'react';
import { AlertTriangle, Radio, Wifi, WifiOff } from 'lucide-react';
import { LiveCameraStatus } from '../../types/liveCamera';

interface LiveStatusBadgeProps {
  status: LiveCameraStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  if (status === 'live') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-wider uppercase rounded-md bg-red-600/90 text-white shadow-xs ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
        {showLabel && <span>EN VIVO</span>}
      </span>
    );
  }

  if (status === 'connecting') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded-md bg-amber-500/90 text-slate-950 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Radio className="w-3 h-3 animate-spin" aria-hidden="true" />
        {showLabel && <span>CONECTANDO</span>}
      </span>
    );
  }

  if (status === 'no_signal') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded-md bg-zinc-700 text-zinc-200 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <WifiOff className="w-3 h-3 text-amber-400" aria-hidden="true" />
        {showLabel && <span>SIN SEÑAL</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded-md bg-zinc-800 text-zinc-400 ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <AlertTriangle className="w-3 h-3 text-zinc-500" aria-hidden="true" />
      {showLabel && <span>NO DISPONIBLE</span>}
    </span>
  );
};
