/**
 * Audio Library Page
 *
 * Centralized audio asset management for curriculum sounds.
 * Upload once, use everywhere.
 */

'use client';

import React, { useState } from 'react';
import { useAudio } from '@/lib/hooks/useAudio';
import { AudioGrid } from '@/components/audio/AudioGrid';
import { AudioCategoryFilter } from '@/components/audio/AudioCategoryFilter';
import { AudioSearchBar } from '@/components/audio/AudioSearchBar';
import { AudioUploadModal } from '@/components/audio/AudioUploadModal';
import { SUPPORTED_AUDIO_TYPES } from '@/lib/types/audio';
import type { AudioUploadData } from '@/lib/types/audio';

export default function AudioPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const {
    audioAssets,
    loading,
    error,
    selectedCategory,
    searchQuery,
    uploadNewAudio,
    removeAudio,
    setCategory,
    setSearchQuery,
  } = useAudio({ autoLoad: true });

  const handleUpload = async (data: AudioUploadData) => {
    await uploadNewAudio(data);
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

      if (SUPPORTED_AUDIO_TYPES.includes(file.type)) {
        setDroppedFile(file);
        setUploadModalOpen(true);
      } else {
        alert('Please drop a valid audio file (MP3, WAV, OGG, or M4A)');
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
        <div className="fixed inset-0 bg-purple-500 bg-opacity-20 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl p-12 border-4 border-dashed border-purple-500">
            <div className="text-center">
              <div className="text-6xl mb-4">&#127925;</div>
              <p className="text-2xl font-bold text-gray-900 mb-2">Drop audio here</p>
              <p className="text-gray-600">to add it to your audio library</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audio Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload once, use everywhere in your curriculum
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              + Add Audio
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
            <div>
              <span className="font-semibold text-gray-900">{audioAssets.length}</span> audio files
            </div>
            {selectedCategory && (
              <div className="text-purple-600">
                Filtered by category
              </div>
            )}
            {searchQuery && (
              <div className="text-purple-600">
                Search results for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <AudioSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Category Filter */}
            <AudioCategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setCategory}
            />
          </div>
        </div>

        {/* Audio Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <AudioGrid
            audioAssets={audioAssets}
            loading={loading}
            error={error}
            onDeleteAudio={removeAudio}
            deletable={true}
            emptyMessage={
              searchQuery
                ? `No audio found matching "${searchQuery}"`
                : selectedCategory
                ? 'No audio in this category yet'
                : 'No audio yet. Click "Add Audio" to get started!'
            }
          />
        </div>
      </div>

      {/* Upload Modal */}
      <AudioUploadModal
        isOpen={uploadModalOpen}
        onClose={handleCloseModal}
        onUpload={handleUpload}
        defaultCategory={selectedCategory}
        initialFile={droppedFile}
      />
    </div>
  );
}
