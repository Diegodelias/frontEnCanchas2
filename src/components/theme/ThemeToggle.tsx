import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'switch';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  variant = 'icon',
}) => {
  const { toggleTheme, isDark } = useTheme();

  const titleText = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  // Switch variant (for mobile drawer or dedicated settings row)
  if (variant === 'switch') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {showLabel && (
          <span className="text-xs font-semibold text-ink-muted select-none">
            {isDark ? 'Modo oscuro' : 'Modo claro'}
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={titleText}
          title={titleText}
          onClick={toggleTheme}
          className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-line bg-surface-muted p-0.5 transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-turf select-none"
        >
          <span className="sr-only">{titleText}</span>
          <span
            className={`pointer-events-none flex h-4.5 w-4.5 transform items-center justify-center rounded-full bg-surface shadow-xs transition duration-200 ease-in-out border border-line ${
              isDark ? 'translate-x-5 bg-pitch-elevated border-volt/30' : 'translate-x-0 bg-white'
            }`}
          >
            {isDark ? (
              <Moon className="w-2.5 h-2.5 text-volt" aria-hidden="true" />
            ) : (
              <Sun className="w-2.5 h-2.5 text-amber-500" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>
    );
  }

  // Icon button variant (standard for desktop & mobile headers)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={titleText}
      title={titleText}
      onClick={toggleTheme}
      className={`w-10 h-10 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg border border-line bg-surface text-ink hover:bg-surface-muted hover:border-line-strong transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-turf shrink-0 self-center my-auto ${className}`}
    >
      <span className="sr-only">{titleText}</span>
      {isDark ? (
        <Moon
          className="w-4 h-4 text-volt transition-transform duration-200 hover:scale-110"
          aria-hidden="true"
        />
      ) : (
        <Sun
          className="w-4 h-4 text-amber-500 transition-transform duration-200 hover:rotate-45"
          aria-hidden="true"
        />
      )}
    </button>
  );
};
