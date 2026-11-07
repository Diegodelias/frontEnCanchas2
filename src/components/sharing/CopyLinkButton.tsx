import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'icon';
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  url,
  className = '',
  label = 'Copiar link',
  variant = 'secondary',
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      showToast({
        type: 'success',
        title: '¡Link copiado!',
        message: 'El enlace se copió al portapapeles para compartir.',
        durationMs: 3000,
      });

      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.warn('Could not copy to clipboard:', err);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Link copiado' : label}
        title={copied ? '¡Link copiado!' : label}
        className={`w-9 h-9 min-w-[36px] min-h-[36px] inline-flex items-center justify-center rounded-lg border border-line bg-surface text-ink hover:bg-surface-muted transition-colors cursor-pointer ${className}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        ) : (
          <Copy className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`min-h-[40px] px-4 py-2 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
        copied
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
          : variant === 'primary'
          ? 'bg-volt text-volt-ink hover:bg-volt-hover'
          : 'bg-surface border border-line text-ink hover:bg-surface-muted'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>¡Link copiado!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
