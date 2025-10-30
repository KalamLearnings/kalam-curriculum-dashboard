/**
 * WordCard Component
 *
 * Displays a single word with its metadata and asset status
 */

'use client';

import React from 'react';
import type { Word } from '@/lib/hooks/useWords';
import { createClient } from '@/lib/supabase/client';

interface WordCardProps {
  word: Word;
  onManageAssets: () => void;
}

export function WordCard({ word, onManageAssets }: WordCardProps) {
  const supabase = createClient();

  // Generate image URL if path exists
  const imageUrl = word.image_path
    ? supabase.storage.from('curriculum-images').getPublicUrl(word.image_path).data.publicUrl
    : null;

  // Format letter forms for display
  const letterForms = word.letter_composition
    .map((comp) => `${comp.character} (${comp.form})`)
    .join(', ');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Preview or Placeholder */}
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={word.arabic}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-6xl text-gray-300">🖼️</div>
        )}

        {/* Asset Status Badges */}
        <div className="absolute top-2 right-2 flex gap-2">
          {!word.has_image && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
              No Image
            </span>
          )}
          {!word.has_audio && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded">
              No Audio
            </span>
          )}
        </div>

        {/* Usage Count Badge */}
        {word.usage_count > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
              {word.usage_count} {word.usage_count === 1 ? 'activity' : 'activities'}
            </span>
          </div>
        )}
      </div>

      {/* Word Info */}
      <div className="p-4">
        {/* Arabic Text */}
        <div className="text-3xl font-arabic text-center mb-2 text-gray-900">
          {word.arabic}
        </div>

        {/* Transliteration and English */}
        <div className="text-center text-sm text-gray-600 mb-3">
          {word.transliteration && (
            <div className="font-medium">{word.transliteration}</div>
          )}
          {word.english && <div className="italic">{word.english}</div>}
        </div>

        {/* Letter Composition Preview */}
        <div className="text-xs text-gray-500 mb-3 truncate" title={letterForms}>
          {word.letter_composition.length} letters: {letterForms}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {word.category && (
            <span className="px-2 py-1 bg-gray-100 rounded">{word.category}</span>
          )}
          {word.difficulty && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
              Level {word.difficulty}
            </span>
          )}
        </div>

        {/* Manage Assets Button */}
        <button
          onClick={onManageAssets}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            !word.has_image || !word.has_audio
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {!word.has_image || !word.has_audio ? 'Upload Assets' : 'Manage Assets'}
        </button>
      </div>
    </div>
  );
}
