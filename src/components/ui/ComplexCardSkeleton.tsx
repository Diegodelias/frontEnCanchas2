import React from 'react';

export const ComplexCardSkeleton: React.FC = () => {
  return (
    <div
      className="flex flex-col bg-surface border border-line rounded-2xl overflow-hidden animate-pulse"
      aria-hidden="true"
    >
      <div className="w-full aspect-[4/3] bg-surface-muted" />
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="h-3.5 w-32 bg-surface-muted rounded" />
        <div className="mt-2.5 h-7 w-52 bg-surface-muted rounded" />
        <div className="mt-3 h-4 w-44 bg-surface-muted rounded" />
        <div className="mt-auto pt-5">
          <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="h-3 w-10 bg-surface-muted rounded" />
              <div className="h-5 w-20 bg-surface-muted rounded" />
            </div>
            <div className="h-10 w-44 bg-surface-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
