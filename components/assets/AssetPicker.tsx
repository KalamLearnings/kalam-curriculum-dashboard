/**
 * AssetPicker Component
 *
 * Reusable component for selecting an asset from the library.
 * Features search, category filtering, and grid display.
 */

'use client';

import React, { useState } from 'react';
import { useAssets } from '@/lib/hooks/useAssets';
import type { Asset, AssetCategory } from '@/lib/types/assets';
import { ASSET_CATEGORIES } from '@/lib/types/assets';

interface AssetPickerProps {
  onSelect: (asset: Asset) => void;
  selectedAssetId?: string | null;
  filterCategory?: AssetCategory; // Optional: pre-filter by category
  emptyMessage?: string;
}

export function AssetPicker({
  onSelect,
  selectedAssetId,
  filterCategory,
  emptyMessage = 'No assets found',
}: AssetPickerProps) {
  const {
    assets,
    loading,
    error,
    selectedCategory,
    searchQuery,
    setCategory,
    setSearchQuery,
  } = useAssets({ initialCategory: filterCategory, autoLoad: true });

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search assets by name or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Category Filter - Only show if not pre-filtered */}
      {!filterCategory && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(undefined)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedCategory === undefined
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.entries(ASSET_CATEGORIES).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => setCategory(key as AssetCategory)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Asset Count */}
      <div className="text-xs text-gray-600">
        {loading ? (
          'Loading assets...'
        ) : (
          `${assets.length} asset${assets.length === 1 ? '' : 's'} ${
            searchQuery ? `matching "${searchQuery}"` :
            selectedCategory ? `in ${ASSET_CATEGORIES[selectedCategory].label}` :
            'in library'
          }`
        )}
      </div>

      {/* Asset Grid */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect(asset)}
                onMouseEnter={() => setHoveredId(asset.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative aspect-square rounded-lg overflow-hidden transition-all ${
                  selectedAssetId === asset.id
                    ? 'ring-4 ring-blue-500 scale-105'
                    : 'ring-2 ring-gray-200 hover:ring-blue-400 hover:scale-105'
                }`}
                title={asset.displayName}
              >
                {/* Image */}
                <img
                  src={asset.url}
                  alt={asset.displayName}
                  className="w-full h-full object-cover"
                />

                {/* Selected Indicator */}
                {selectedAssetId === asset.id && (
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Hover Overlay with Name */}
                {hoveredId === asset.id && selectedAssetId !== asset.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-end p-2 transition-opacity">
                    <p className="text-white text-xs font-medium line-clamp-2">
                      {asset.displayName}
                    </p>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                  {ASSET_CATEGORIES[asset.category].icon}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
