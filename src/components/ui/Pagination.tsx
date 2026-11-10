import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Descripción del listado para lectores de pantalla. */
  label: string;
}

/** Números de página a mostrar: todos si son pocos; si no, primero, último y los vecinos de la actual con «…». */
function pageItems(page: number, totalPages: number): (number | 'gap-start' | 'gap-end')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items: (number | 'gap-start' | 'gap-end')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(totalPages - 1, page + 1);
  if (from > 2) items.push('gap-start');
  for (let n = from; n <= to; n++) items.push(n);
  if (to < totalPages - 1) items.push('gap-end');
  items.push(totalPages);
  return items;
}

const BASE =
  'min-w-[44px] min-h-[44px] px-3 inline-flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors cursor-pointer';

/** Controles de página. No se muestra si todo entra en una sola página. */
export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, label }) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={label} className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`${BASE} border-line text-ink hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {pageItems(page, totalPages).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Página ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${BASE} ${
              item === page
                ? 'bg-ink text-canvas border-ink'
                : 'border-line text-ink hover:bg-surface-muted'
            }`}
          >
            {item}
          </button>
        ) : (
          <span key={item} aria-hidden="true" className="min-w-[24px] text-center text-ink-muted">
            …
          </span>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={`${BASE} border-line text-ink hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  );
};
