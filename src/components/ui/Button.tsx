import React from 'react';

export type ButtonVariant = 'volt' | 'primary' | 'secondary' | 'darkSecondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  volt: 'bg-volt text-volt-ink hover:bg-volt-hover font-semibold border border-transparent',
  primary: 'bg-ink text-surface hover:bg-pitch-elevated font-semibold border border-transparent',
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-surface-muted font-medium',
  darkSecondary:
    'bg-pitch-elevated text-pitch-ink border border-pitch-line hover:border-volt font-medium',
  ghost: 'bg-transparent text-ink-muted hover:text-ink font-medium border border-transparent',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-3.5 py-2 text-xs sm:text-sm',
  md: 'min-h-[44px] px-5 py-2.5 text-sm',
  lg: 'min-h-[48px] px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl whitespace-nowrap cursor-pointer transition-all duration-150 active:scale-[0.97] ease-[cubic-bezier(0.23,1,0.32,1)] disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${
        fullWidth ? 'w-full shrink min-w-0' : 'shrink-0'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
