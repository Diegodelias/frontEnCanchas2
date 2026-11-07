import React from 'react';

interface BrandWordmarkProps {
  tone?: 'light' | 'dark';
  className?: string;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  tone = 'light',
  className = '',
}) => {
  const baseText = tone === 'dark' ? 'text-pitch-ink' : 'text-ink';
  const accentText = tone === 'dark' ? 'text-volt' : 'text-turf dark:text-volt';

  return (
    <span
      className={`inline-flex items-baseline font-display text-2xl sm:text-[1.75rem] font-extrabold tracking-tight leading-none uppercase whitespace-nowrap shrink-0 select-none ${baseText} ${className}`}
    >
      <span>Canchas</span>
      <span className={`ml-0.5 ${accentText}`}>3</span>
    </span>
  );
};
