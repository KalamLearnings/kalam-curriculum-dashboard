/**
 * Assets Library Page
 *
 * Centralized asset management for curriculum images.
 * Upload once, use everywhere.
 */

'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAssets } from '@/lib/hooks/useAssets';
import { AssetUploadModal } from '@/components/assets/AssetUploadModal';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { CategoryFilter } from '@/components/shared/category-filter';
import { MediaGrid } from '@/components/shared/media-grid';
import { MediaCard } from '@/components/shared/media-card';
import { Card, CardContent } from '@/components/ui/card';
import { ASSET_CATEGORIES, type AssetCategory, type AssetUploadData } from '@/lib/types/assets';

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

  const categories = Object.entries(ASSET_CATEGORIES).map(([value, { label, icon }]) => ({
    value: value as AssetCategory,
    label,
    icon,
  }));

  return (
    <div
      className="min-h-screen bg-background py-8 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="fixed inset-0 bg-primary/20 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-background rounded-lg shadow-2xl p-12 border-4 border-dashed border-primary">
            <div className="text-center">
              <div className="text-6xl mb-4">📤</div>
              <p className="text-2xl font-bold text-foreground mb-2">Drop image here</p>
              <p className="text-muted-foreground">to add it to your asset library</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Asset Library"
          description="Upload once, use everywhere in your curriculum"
          action={{
            label: 'Upload Asset',
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => setUploadModalOpen(true),
          }}
        >
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div>
              <span className="font-semibold text-foreground">{assets.length}</span> assets
            </div>
            {selectedCategory && <div className="text-primary">Filtered by category</div>}
            {searchQuery && (
              <div className="text-primary">Search results for &quot;{searchQuery}&quot;</div>
            )}
          </div>
        </PageHeader>

        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search assets by name or tag..."
            />
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={setCategory}
              totalCount={assets.length}
              color="blue"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <MediaGrid
              items={assets}
              loading={loading}
              error={error}
              emptyMessage={
                searchQuery
                  ? `No assets found matching "${searchQuery}"`
                  : selectedCategory
                  ? 'No assets in this category yet'
                  : 'No assets uploaded yet. Click "Upload Asset" to get started!'
              }
              emptyIcon="📦"
              renderItem={(asset) => (
                <MediaCard
                  key={asset.id}
                  type="image"
                  id={asset.id}
                  name={asset.name}
                  displayName={asset.displayName}
                  previewUrl={asset.url}
                  tags={asset.tags}
                  category={ASSET_CATEGORIES[asset.category]?.label}
                  deletable
                  onDelete={() => removeAsset(asset.id)}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>

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
