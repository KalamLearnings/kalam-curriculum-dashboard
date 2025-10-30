/**
 * AssetCard Component
 *
 * Displays a single asset with image, name, and actions.
 * Reusable component for both library view and selection modals.
 */

'use client';

import React, { useState } from 'react';
import type { Asset } from '@/lib/types/assets';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface AssetCardProps {
  asset: Asset;
  isSelected?: boolean;
  onSelect?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  selectable?: boolean;
  deletable?: boolean;
}

export function AssetCard({
  asset,
  isSelected = false,
  onSelect,
  onDelete,
  selectable = false,
  deletable = false,
}: AssetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(asset.id);
    } catch (error) {
      console.error('Error deleting asset:', error);
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(asset);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', asset.url);
    console.error('Asset data:', asset);
    setImageError(true);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative group rounded-lg overflow-hidden border-2 transition-all
        ${selectable ? 'cursor-pointer hover:scale-105' : ''}
        ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
        }
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center">
        {imageError ? (
          <div className="flex flex-col items-center justify-center p-2">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-xs text-red-500 text-center">Failed to load</div>
          </div>
        ) : (
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-full object-contain p-2"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
          ✓
        </div>
      )}

      {/* Delete Button */}
      {deletable && onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          className="
            absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6
            flex items-center justify-center opacity-0 group-hover:opacity-100
            transition-opacity text-sm shadow-md hover:bg-red-600
          "
          title="Delete asset"
        >
          ✕
        </button>
      )}

      {/* Asset Info */}
      <div className="p-2 bg-white border-t border-gray-200">
        <p className="text-xs text-gray-700 font-medium truncate" title={asset.displayName}>
          {asset.displayName}
        </p>
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {asset.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 2 && (
              <span className="text-xs text-gray-400">
                +{asset.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}
