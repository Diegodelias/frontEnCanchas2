import React from 'react';
import { useSite } from '../../context/SiteContext';

interface BrandWordmarkProps {
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * Parte el nombre en el texto y el número del final, que va resaltado («Canchas3» → «Canchas» + «3»). Si el nombre no
 * termina en número, o es solo un número, no hay parte resaltada.
 */
export function splitWordmark(name: string): { base: string; accent: string } {
  const match = name.match(/^(.*?)(\d+)$/);
  return match && match[1] ? { base: match[1], accent: match[2]! } : { base: name, accent: '' };
}

/** Un nombre largo achica el logo para que entre en la barra, sobre todo en el celular. */
const LONG_NAME_LENGTH = 14;

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  tone = 'light',
  className = '',
}) => {
  const { name } = useSite();
  const { base, accent } = splitWordmark(name);
  const baseText = tone === 'dark' ? 'text-pitch-ink' : 'text-ink';
  const accentText = tone === 'dark' ? 'text-volt' : 'text-turf dark:text-volt';
  const size = name.length > LONG_NAME_LENGTH ? 'text-lg sm:text-xl' : 'text-2xl sm:text-[1.75rem]';

  return (
    <span
      className={`inline-flex items-baseline font-display ${size} font-extrabold tracking-tight leading-none uppercase whitespace-nowrap shrink-0 select-none ${baseText} ${className}`}
    >
      <span>{base}</span>
      {accent && <span className={`ml-0.5 ${accentText}`}>{accent}</span>}
    </span>
  );
};
