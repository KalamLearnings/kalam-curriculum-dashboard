/**
 * AudioGrid Component
 *
 * Grid layout for displaying multiple audio assets.
 * Handles loading states, empty states, and error states.
 */

'use client';

import React from 'react';
import type { AudioAsset } from '@/lib/types/audio';
import { AudioCard } from './AudioCard';

interface AudioGridProps {
  audioAssets: AudioAsset[];
  loading?: boolean;
  error?: string | null;
  selectedAudioId?: string;
  onSelectAudio?: (audio: AudioAsset) => void;
  onDeleteAudio?: (audioId: string) => void;
  selectable?: boolean;
  deletable?: boolean;
  emptyMessage?: string;
}

export function AudioGrid({
  audioAssets,
  loading = false,
  error = null,
  selectedAudioId,
  onSelectAudio,
  onDeleteAudio,
  selectable = false,
  deletable = false,
  emptyMessage = 'No audio found',
}: AudioGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading audio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="text-4xl mb-3">&#9888;&#65039;</div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (audioAssets.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-4xl mb-3">&#127925;</div>
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {audioAssets.map(audio => (
        <AudioCard
          key={audio.id}
          audio={audio}
          isSelected={selectedAudioId === audio.id}
          onSelect={onSelectAudio}
          onDelete={onDeleteAudio}
          selectable={selectable}
          deletable={deletable}
        />
      ))}
    </div>
  );
}
