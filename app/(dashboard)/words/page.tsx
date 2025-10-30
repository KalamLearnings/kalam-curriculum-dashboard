/**
 * Words Library Page
 *
 * Centralized word management with letter composition analysis.
 * Shows all words used across activities with asset status.
 */

'use client';

import React, { useState } from 'react';
import { useWords } from '@/lib/hooks/useWords';
import { WordGrid } from '@/components/words/WordGrid';
import { WordAssetModal } from '@/components/words/WordAssetModal';
import type { Word } from '@/lib/hooks/useWords';

export default function WordsPage() {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

  const {
    words,
    loading,
    error,
    searchQuery,
    missingAssetsOnly,
    updateWordAssets,
    setSearchQuery,
    setMissingAssetsOnly,
    refetch,
  } = useWords();

  const handleOpenAssetModal = (word: Word) => {
    setSelectedWord(word);
    setAssetModalOpen(true);
  };

  const handleCloseAssetModal = () => {
    setAssetModalOpen(false);
    setSelectedWord(null);
  };

  const handleUploadAssets = async (assets: { image_path?: string; audio_path?: string }) => {
    if (!selectedWord) return;

    try {
      await updateWordAssets(selectedWord.id, assets);
      await refetch();
      handleCloseAssetModal();
    } catch (err) {
      console.error('Failed to upload assets:', err);
      alert('Failed to upload assets. Please try again.');
    }
  };

  // Calculate stats
  const wordsWithImages = words.filter(w => w.has_image).length;
  const wordsWithAudio = words.filter(w => w.has_audio).length;
  const wordsMissingAssets = words.filter(w => !w.has_image || !w.has_audio).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Word Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage words and their assets across your curriculum
              </p>
            </div>
            <button
              onClick={() => setMissingAssetsOnly(!missingAssetsOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                missingAssetsOnly
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {missingAssetsOnly ? 'Show All' : 'Show Missing Assets'}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
            <div>
              <span className="font-semibold text-gray-900">{words.length}</span> words
            </div>
            <div>
              <span className="font-semibold text-green-600">{wordsWithImages}</span> with images
            </div>
            <div>
              <span className="font-semibold text-blue-600">{wordsWithAudio}</span> with audio
            </div>
            {wordsMissingAssets > 0 && (
              <div>
                <span className="font-semibold text-orange-600">{wordsMissingAssets}</span> missing assets
              </div>
            )}
            {searchQuery && (
              <div className="text-blue-600">
                Search results for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <input
            type="text"
            placeholder="Search words (Arabic, transliteration, or English)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Word Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <WordGrid
            words={words}
            loading={loading}
            error={error}
            onManageAssets={handleOpenAssetModal}
            emptyMessage={
              searchQuery
                ? `No words found matching "${searchQuery}"`
                : missingAssetsOnly
                ? 'All words have complete assets! 🎉'
                : 'No words in the library yet. Create activities to start building your word library!'
            }
          />
        </div>
      </div>

      {/* Asset Upload Modal */}
      {selectedWord && (
        <WordAssetModal
          isOpen={assetModalOpen}
          onClose={handleCloseAssetModal}
          word={selectedWord}
          onUploadAssets={handleUploadAssets}
        />
      )}
    </div>
  );
}
