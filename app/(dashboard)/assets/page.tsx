/**
 * Assets Library Page
 *
 * Centralized asset management for curriculum images.
 * Upload once, use everywhere.
 */

'use client';

import React, { useState } from 'react';
import { useAssets } from '@/lib/hooks/useAssets';
import { AssetGrid } from '@/components/assets/AssetGrid';
import { AssetCategoryFilter } from '@/components/assets/AssetCategoryFilter';
import { AssetSearchBar } from '@/components/assets/AssetSearchBar';
import { AssetUploadModal } from '@/components/assets/AssetUploadModal';
import type { AssetUploadData } from '@/lib/types/assets';

export default function AssetsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const {
    assets,
    loading,
    error,
    selectedCategory,
    searchQuery,
    uploadNewAsset,
    removeAsset,
    setCategory,
    setSearchQuery,
    refetch,
  } = useAssets({ autoLoad: true });

  const handleUpload = async (data: AssetUploadData) => {
    await uploadNewAsset(data);
    setDroppedFile(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide overlay if leaving the main container
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (validTypes.includes(file.type)) {
        setDroppedFile(file);
        setUploadModalOpen(true);
      } else {
        alert('Please drop a valid image file (JPG, PNG, or WebP)');
      }
    }
  };

  const handleCloseModal = () => {
    setUploadModalOpen(false);
    setDroppedFile(null);
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl p-12 border-4 border-dashed border-blue-500">
            <div className="text-center">
              <div className="text-6xl mb-4">📤</div>
              <p className="text-2xl font-bold text-gray-900 mb-2">Drop image here</p>
              <p className="text-gray-600">to add it to your asset library</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asset Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload once, use everywhere in your curriculum
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + Upload Asset
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
            <div>
              <span className="font-semibold text-gray-900">{assets.length}</span> assets
            </div>
            {selectedCategory && (
              <div className="text-blue-600">
                Filtered by category
              </div>
            )}
            {searchQuery && (
              <div className="text-blue-600">
                Search results for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <AssetSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Category Filter */}
            <AssetCategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setCategory}
            />
          </div>
        </div>

        {/* Asset Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AssetGrid
            assets={assets}
            loading={loading}
            error={error}
            onDeleteAsset={removeAsset}
            deletable={true}
            emptyMessage={
              searchQuery
                ? `No assets found matching "${searchQuery}"`
                : selectedCategory
                ? 'No assets in this category yet'
                : 'No assets uploaded yet. Click "Upload Asset" to get started!'
            }
          />
        </div>
      </div>

      {/* Upload Modal */}
      <AssetUploadModal
        isOpen={uploadModalOpen}
        onClose={handleCloseModal}
        onUpload={handleUpload}
        defaultCategory={selectedCategory}
        initialFile={droppedFile}
      />
    </div>
  );
}
