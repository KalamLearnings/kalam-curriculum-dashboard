/**
 * AudioCard Component
 *
 * Displays a single audio asset with playback controls, name, and actions.
 * Reusable component for both library view and selection modals.
 */

'use client';

import React, { useState, useRef } from 'react';
import type { AudioAsset } from '@/lib/types/audio';
import { AUDIO_CATEGORIES } from '@/lib/types/audio';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface AudioCardProps {
  audio: AudioAsset;
  isSelected?: boolean;
  onSelect?: (audio: AudioAsset) => void;
  onDelete?: (audioId: string) => void;
  selectable?: boolean;
  deletable?: boolean;
}

export function AudioCard({
  audio,
  isSelected = false,
  onSelect,
  onDelete,
  selectable = false,
  deletable = false,
}: AudioCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(audio.id);
    } catch (error) {
      console.error('Error deleting audio:', error);
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(audio);
    }
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryInfo = AUDIO_CATEGORIES[audio.category];

  return (
    <div
      onClick={handleClick}
      className={`
        relative group rounded-lg overflow-hidden border-2 transition-all bg-white
        ${selectable ? 'cursor-pointer hover:scale-105' : ''}
        ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
        }
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <audio
        ref={audioRef}
        src={audio.url}
        onEnded={handleAudioEnded}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
      />

      {/* Audio Visual */}
      <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative">
        <button
          type="button"
          onClick={handlePlayPause}
          className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-all
            ${isPlaying
              ? 'bg-purple-600 text-white'
              : 'bg-white text-purple-600 shadow-md hover:shadow-lg'
            }
          `}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {formatDuration(audio.durationMs)}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
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
          title="Delete audio"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Audio Info */}
      <div className="p-3 border-t border-gray-200">
        <p className="text-sm text-gray-900 font-medium truncate" title={audio.displayName}>
          {audio.displayName}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {categoryInfo?.label || audio.category}
        </p>
        {audio.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {audio.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {audio.tags.length > 2 && (
              <span className="text-xs text-gray-400">
                +{audio.tags.length - 2}
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
        title="Delete Audio"
        message={`Are you sure you want to delete "${audio.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}
