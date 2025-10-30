/**
 * AssetCategoryFilter Component
 *
 * Tab-based filter for selecting asset categories.
 * Shows all categories with icons and allows "All" selection.
 */

'use client';

import React from 'react';
import type { AssetCategory } from '@/lib/types/assets';
import { ASSET_CATEGORIES } from '@/lib/types/assets';

interface AssetCategoryFilterProps {
  selectedCategory?: AssetCategory;
  onCategoryChange: (category: AssetCategory | undefined) => void;
  assetCounts?: Record<AssetCategory, number>;
}

export function AssetCategoryFilter({
  selectedCategory,
  onCategoryChange,
  assetCounts,
}: AssetCategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {/* All Categories Button */}
      <button
        onClick={() => onCategoryChange(undefined)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
          ${!selectedCategory
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        <span>🗂️</span>
        <span>All</span>
        {assetCounts && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full
            ${!selectedCategory ? 'bg-blue-500' : 'bg-gray-200'}
          `}>
            {Object.values(assetCounts).reduce((sum, count) => sum + count, 0)}
          </span>
        )}
      </button>

      {/* Category Buttons */}
      {Object.entries(ASSET_CATEGORIES).map(([key, { label, icon }]) => {
        const categoryKey = key as AssetCategory;
        const count = assetCounts?.[categoryKey] || 0;

        return (
          <button
            key={key}
            onClick={() => onCategoryChange(categoryKey)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
              ${selectedCategory === categoryKey
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {assetCounts && (
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${selectedCategory === categoryKey ? 'bg-blue-500' : 'bg-gray-200'}
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
