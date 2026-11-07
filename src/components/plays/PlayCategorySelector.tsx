import React from 'react';
import { Check } from 'lucide-react';
import { PLAY_CATEGORIES, PlayCategory } from '../../types/play';

interface PlayCategorySelectorProps {
  selectedCategory?: PlayCategory;
  onSelectCategory: (category?: PlayCategory) => void;
}

export const PlayCategorySelector: React.FC<PlayCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
          Clasificación rápida
        </label>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory(undefined)}
            className="text-[11px] font-semibold text-turf hover:underline cursor-pointer"
          >
            Quitar
          </button>
        )}
      </div>

      {/* Choice Buttons matching 5_caa1499c.png */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PLAY_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(isSelected ? undefined : cat)}
              aria-pressed={isSelected}
              className={`h-10 px-3 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-volt text-volt-ink font-bold ring-2 ring-volt shadow-xs'
                  : 'bg-surface border border-line text-ink hover:bg-surface-muted hover:border-line-strong'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" aria-hidden="true" />}
              <span className="truncate">{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

