/**
 * AudioPicker Component
 *
 * A modal-based audio selector for use in forms.
 * Shows audio library with filtering and allows selection.
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AudioGrid } from './AudioGrid';
import { AudioCategoryFilter } from './AudioCategoryFilter';
import { AudioSearchBar } from './AudioSearchBar';
import { useAudio } from '@/lib/hooks/useAudio';
import type { AudioAsset } from '@/lib/types/audio';

interface AudioPickerProps {
  value?: string;
  onChange: (audioId: string | undefined, audio?: AudioAsset) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AudioPicker({
  value,
  onChange,
  placeholder = 'Select audio...',
  disabled = false,
}: AudioPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioAsset | null>(null);

  const {
    audioAssets,
    loading,
    error,
    selectedCategory,
    searchQuery,
    setCategory,
    setSearchQuery,
  } = useAudio({
    autoLoad: true,
  });

  const handleSelect = (audio: AudioAsset) => {
    setSelectedAudio(audio);
    onChange(audio.id, audio);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedAudio(null);
    onChange(undefined);
  };

  const currentAudio = selectedAudio || audioAssets.find(a => a.id === value);

  return (
    <div>
      {/* Trigger Button */}
      <div
        className={`
          flex items-center gap-3 p-3 border-2 rounded-lg transition-all
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-purple-300'}
          ${currentAudio ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}
        `}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {currentAudio ? (
          <>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentAudio.displayName}
              </p>
              <p className="text-xs text-gray-500">
                {currentAudio.category.replace('_', ' ')}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
              disabled={disabled}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">{placeholder}</span>
          </>
        )}
      </div>

      {/* Selection Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Audio"
        size="xl"
      >
        <div className="p-4 space-y-4">
          {/* Search */}
          <AudioSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {/* Category Filter */}
          <AudioCategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setCategory}
          />

          {/* Audio Grid */}
          <div className="max-h-96 overflow-y-auto">
            <AudioGrid
              audioAssets={audioAssets}
              loading={loading}
              error={error}
              selectedAudioId={value}
              onSelectAudio={handleSelect}
              selectable
              emptyMessage={
                searchQuery
                  ? `No audio found matching "${searchQuery}"`
                  : 'No audio in this category yet'
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
