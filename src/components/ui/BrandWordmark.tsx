import React from 'react';
import { logoColorValue, type LogoColor } from '../../data/logoPalette';
import { useSite } from '../../context/SiteContext';

interface BrandWordmarkProps {
  tone?: 'light' | 'dark';
  className?: string;
  /** Para la vista previa del panel: si se pasan, se usan en lugar del nombre y el color vigentes del sitio. */
  name?: string;
  logoColor?: LogoColor | null;
}

/**
 * Parte el nombre en el texto normal y la parte resaltada. Resalta, en este orden, el número del final («Canchas3» →
 * «Canchas» + «3»), la última palabra si hay dos o más («Club Central» → «Club » + «Central») o nada. Conserva los
 * espacios internos tal como se escribieron.
 */
export function splitWordmark(name: string): { base: string; accent: string } {
  const digits = name.match(/^(.*?)(\d+)$/);
  if (digits && digits[1]) return { base: digits[1], accent: digits[2]! };

  const lastWord = name.match(/^(.*\S)(\s+)(\S+)$/);
  if (lastWord) return { base: lastWord[1]! + lastWord[2]!, accent: lastWord[3]! };

  return { base: name, accent: '' };
}

/** Un nombre largo achica el logo para que entre en la barra, sobre todo en el celular. */
const LONG_NAME_LENGTH = 14;

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  tone = 'light',
  className = '',
  name: nameOverride,
  logoColor: colorOverride,
}) => {
  const site = useSite();
  const name = nameOverride ?? site.name;
  const logoColor = colorOverride === undefined ? site.logoColor : colorOverride;
  // Mientras no se sabe el nombre verdadero, el logo reserva su lugar sin mostrar el de relleno («Canchas3»), para
  // que no parpadee con el nombre equivocado. Con valores pasados por propiedades (vista previa del panel) se ve siempre.
  const pending = nameOverride === undefined && colorOverride === undefined && !site.ready;
  const { base, accent } = splitWordmark(name);
  const onDark = tone === 'dark';

  // Sin color elegido, los colores de siempre. Con color, el de la paleta: va a la parte resaltada, o a todo el logo
  // si no hay resalte. En el pie (tone dark) siempre la variante para fondo oscuro.
  const baseClass = onDark ? 'text-pitch-ink' : 'text-ink';
  const accentClass = onDark ? 'text-volt' : 'text-turf dark:text-volt';
  const colorStyle = logoColor ? { color: logoColorValue(logoColor, onDark) } : undefined;
  const wholeLogo = Boolean(logoColor) && !accent;
  const size = name.length > LONG_NAME_LENGTH ? 'text-lg sm:text-xl' : 'text-2xl sm:text-[1.75rem]';

  return (
    <span
      className={`inline-flex items-baseline font-display ${size} font-extrabold tracking-tight leading-none whitespace-pre shrink-0 select-none ${baseClass} ${pending ? 'invisible' : ''} ${className}`}
      style={wholeLogo ? colorStyle : undefined}
      aria-hidden={pending ? true : undefined}
    >
      <span>{base}</span>
      {accent && (
        <span className={logoColor ? undefined : accentClass} style={colorStyle}>
          {accent}
        </span>
      )}
    </span>
  );
};
