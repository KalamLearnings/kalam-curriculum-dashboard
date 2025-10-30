/**
 * ImageLibraryModal Component
 *
 * Modal that displays a grid of uploaded images from the asset library
 * Used for selecting images for multiple choice options and other activities
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAssets } from '@/lib/hooks/useAssets';
import { AssetGrid } from '@/components/assets/AssetGrid';
import { AssetCategoryFilter } from '@/components/assets/AssetCategoryFilter';
import { AssetSearchBar } from '@/components/assets/AssetSearchBar';
import { AssetUploadForm } from '@/components/assets/AssetUploadForm';
import type { Asset, AssetUploadData } from '@/lib/types/assets';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  currentImage?: string;
}

export function ImageLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
  currentImage
}: ImageLibraryModalProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const {
    assets,
    loading,
    error,
    selectedCategory,
    searchQuery,
    uploadNewAsset,
    setCategory,
    setSearchQuery,
  } = useAssets({ autoLoad: isOpen });

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleUpload = async (data: AssetUploadData) => {
    const newAsset = await uploadNewAsset(data);
    setSelectedAsset(newAsset);
    setShowUploader(false);
  };

  const handleSelect = () => {
    if (selectedAsset) {
      onSelectImage(selectedAsset.url);
      onClose();
      setSelectedAsset(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Image">
      <div className="p-6">
        {showUploader ? (
          <div className="space-y-4">
            <AssetUploadForm onUpload={handleUpload} />
            <button
              type="button"
              onClick={() => setShowUploader(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to library
            </button>
          </div>
        ) : (
          <>
            {/* Header with upload button */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {assets.length} assets in library
              </p>
              <button
                type="button"
                onClick={() => setShowUploader(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Upload New
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <AssetSearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <AssetCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setCategory}
              />
            </div>

            {/* Asset Grid */}
            <div className="max-h-96 overflow-y-auto">
              <AssetGrid
                assets={assets}
                loading={loading}
                error={error}
                selectedAssetId={selectedAsset?.id}
                onSelectAsset={handleAssetSelect}
                selectable={true}
                emptyMessage="No images in library yet"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelect}
                disabled={!selectedAsset}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Image
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
