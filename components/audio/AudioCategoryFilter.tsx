/**
 * AudioCategoryFilter Component
 *
 * Tab-based filter for selecting audio categories.
 * Shows all categories and allows "All" selection.
 */

'use client';

import React from 'react';
import type { AudioCategory } from '@/lib/types/audio';
import { AUDIO_CATEGORIES } from '@/lib/types/audio';

interface AudioCategoryFilterProps {
  selectedCategory?: AudioCategory;
  onCategoryChange: (category: AudioCategory | undefined) => void;
  audioCounts?: Record<AudioCategory, number>;
}

export function AudioCategoryFilter({
  selectedCategory,
  onCategoryChange,
  audioCounts,
}: AudioCategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {/* All Categories Button */}
      <button
        onClick={() => onCategoryChange(undefined)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
          ${!selectedCategory
            ? 'bg-purple-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        <span>All</span>
        {audioCounts && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full
            ${!selectedCategory ? 'bg-purple-500' : 'bg-gray-200'}
          `}>
            {Object.values(audioCounts).reduce((sum, count) => sum + count, 0)}
          </span>
        )}
      </button>

      {/* Category Buttons */}
      {Object.entries(AUDIO_CATEGORIES).map(([key, { label }]) => {
        const categoryKey = key as AudioCategory;
        const count = audioCounts?.[categoryKey] || 0;

        return (
          <button
            key={key}
            onClick={() => onCategoryChange(categoryKey)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
              ${selectedCategory === categoryKey
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{label}</span>
            {audioCounts && (
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${selectedCategory === categoryKey ? 'bg-purple-500' : 'bg-gray-200'}
              `}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
