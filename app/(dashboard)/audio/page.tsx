/**
 * Audio Library Page
 *
 * Centralized audio asset management for curriculum sounds.
 * Upload once, use everywhere.
 */

'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAudio } from '@/lib/hooks/useAudio';
import { AudioUploadModal } from '@/components/audio/AudioUploadModal';
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { CategoryFilter } from '@/components/shared/category-filter';
import { MediaGrid } from '@/components/shared/media-grid';
import { MediaCard } from '@/components/shared/media-card';
import { Card, CardContent } from '@/components/ui/card';
import {
  AUDIO_CATEGORIES,
  SUPPORTED_AUDIO_TYPES,
  type AudioCategory,
  type AudioUploadData,
} from '@/lib/types/audio';

export default function AudioPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [editingAudio, setEditingAudio] = useState<typeof audioAssets[0] | null>(null);

  const {
    audioAssets,
    loading,
    error,
    selectedCategory,
    searchQuery,
    uploadNewAudio,
    removeAudio,
    updateAudio,
    replaceAudio,
    refetch,
    setCategory,
    setSearchQuery,
  } = useAudio({ autoLoad: true });

  const handleUpload = async (data: AudioUploadData) => {
    await uploadNewAudio(data);
    setDroppedFile(null);
  };

  const handleUpdate = async (id: string, data: AudioUploadData) => {
    if (data.file) {
      // Replace file at same storage path (keeps same URL)
      await replaceAudio(id, data.file, {
        displayName: data.displayName,
        tags: data.tags,
        metadata: data.metadata,
      });
    } else {
      // Just update metadata (name, tags, and TTS metadata if present)
      await updateAudio(id, {
        displayName: data.displayName,
        tags: data.tags,
        metadata: data.metadata,
      });
    }
    setEditingAudio(null);
  };

  const handleEdit = (audio: typeof audioAssets[0]) => {
    setEditingAudio(audio);
    setUploadModalOpen(true);
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
    setEditingAudio(null);
  };

  const categories = Object.entries(AUDIO_CATEGORIES).map(([value, { label }]) => ({
    value: value as AudioCategory,
    label,
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
        <div className="fixed inset-0 bg-purple-500/20 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-background rounded-lg shadow-2xl p-12 border-4 border-dashed border-purple-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-2xl font-bold text-foreground mb-2">Drop audio here</p>
              <p className="text-muted-foreground">to add it to your audio library</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Audio Library"
          description="Upload once, use everywhere in your curriculum"
          action={{
            label: 'Add Audio',
            icon: <Plus className="h-4 w-4 mr-2" />,
            onClick: () => setUploadModalOpen(true),
          }}
        >
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div>
              <span className="font-semibold text-foreground">{audioAssets.length}</span> audio
              files
            </div>
            {selectedCategory && <div className="text-purple-600">Filtered by category</div>}
            {searchQuery && (
              <div className="text-purple-600">Search results for &quot;{searchQuery}&quot;</div>
            )}
          </div>
        </PageHeader>

        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search audio by name or tag..."
            />
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={setCategory}
              totalCount={audioAssets.length}
              color="purple"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <MediaGrid
              items={audioAssets}
              loading={loading}
              error={error}
              emptyMessage={
                searchQuery
                  ? `No audio found matching "${searchQuery}"`
                  : selectedCategory
                  ? 'No audio in this category yet'
                  : 'No audio yet. Click "Add Audio" to get started!'
              }
              emptyIcon="🎵"
              renderItem={(audio) => (
                <MediaCard
                  key={audio.id}
                  type="audio"
                  id={audio.id}
                  name={audio.name}
                  displayName={audio.displayName}
                  audioUrl={audio.url}
                  duration={audio.durationMs}
                  tags={audio.tags}
                  category={AUDIO_CATEGORIES[audio.category]?.label}
                  deletable
                  editable
                  onDelete={() => removeAudio(audio.id)}
                  onEdit={() => handleEdit(audio)}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>

      <AudioUploadModal
        isOpen={uploadModalOpen}
        onClose={handleCloseModal}
        onUpload={handleUpload}
        onUpdate={handleUpdate}
        defaultCategory={selectedCategory}
        initialFile={droppedFile}
        editingAudio={editingAudio}
      />
    </div>
  );
}
