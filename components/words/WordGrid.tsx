/**
 * WordGrid Component
 *
 * Displays a grid of words with their metadata and asset status
 */

'use client';

import React from 'react';
import { WordCard } from './WordCard';
import type { Word } from '@/lib/hooks/useWords';

interface WordGridProps {
  words: Word[];
  loading: boolean;
  error: string | null;
  onManageAssets: (word: Word) => void;
  emptyMessage?: string;
}

export function WordGrid({
  words,
  loading,
  error,
  onManageAssets,
  emptyMessage = 'No words found',
}: WordGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading words...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {words.map((word) => (
        <WordCard
          key={word.id}
          word={word}
          onManageAssets={() => onManageAssets(word)}
        />
      ))}
    </div>
  );
}
