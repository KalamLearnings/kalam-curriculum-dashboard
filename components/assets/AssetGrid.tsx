/**
 * AssetGrid Component
 *
 * Grid layout for displaying multiple assets.
 * Handles loading states, empty states, and error states.
 */

'use client';

import React from 'react';
import type { Asset } from '@/lib/types/assets';
import { AssetCard } from './AssetCard';

interface AssetGridProps {
  assets: Asset[];
  loading?: boolean;
  error?: string | null;
  selectedAssetId?: string;
  onSelectAsset?: (asset: Asset) => void;
  onDeleteAsset?: (assetId: string) => void;
  selectable?: boolean;
  deletable?: boolean;
  emptyMessage?: string;
}

export function AssetGrid({
  assets,
  loading = false,
  error = null,
  selectedAssetId,
  onSelectAsset,
  onDeleteAsset,
  selectable = false,
  deletable = false,
  emptyMessage = 'No assets found',
}: AssetGridProps) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading assets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Grid of assets
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {assets.map(asset => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={selectedAssetId === asset.id}
          onSelect={onSelectAsset}
          onDelete={onDeleteAsset}
          selectable={selectable}
          deletable={deletable}
        />
      ))}
    </div>
  );
}
