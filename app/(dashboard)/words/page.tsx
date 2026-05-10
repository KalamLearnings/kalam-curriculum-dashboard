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
import { PageHeader } from '@/components/shared/page-header';
import { SearchInput } from '@/components/shared/search-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const wordsWithImages = words.filter((w) => w.has_image).length;
  const wordsWithAudio = words.filter((w) => w.has_audio).length;
  const wordsMissingAssets = words.filter((w) => !w.has_image || !w.has_audio).length;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader title="Word Library" description="Manage words and their assets across your curriculum">
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">{words.length}</span> words
              </div>
              <div>
                <span className="font-semibold text-green-600">{wordsWithImages}</span> with images
              </div>
              <div>
                <span className="font-semibold text-blue-600">{wordsWithAudio}</span> with audio
              </div>
              {wordsMissingAssets > 0 && (
                <div>
                  <span className="font-semibold text-orange-600">{wordsMissingAssets}</span>{' '}
                  missing assets
                </div>
              )}
              {searchQuery && (
                <div className="text-primary">Search results for &quot;{searchQuery}&quot;</div>
              )}
            </div>
            <Button
              onClick={() => setMissingAssetsOnly(!missingAssetsOnly)}
              variant={missingAssetsOnly ? 'default' : 'outline'}
              className={missingAssetsOnly ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              {missingAssetsOnly ? 'Show All' : 'Show Missing Assets'}
            </Button>
          </div>
        </PageHeader>

        <Card className="mb-6">
          <CardContent className="p-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search words (Arabic, transliteration, or English)..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <WordGrid
              words={words}
              loading={loading}
              error={error}
              onManageAssets={handleOpenAssetModal}
              emptyMessage={
                searchQuery
                  ? `No words found matching "${searchQuery}"`
                  : missingAssetsOnly
                  ? 'All words have complete assets!'
                  : 'No words in the library yet. Create activities to start building your word library!'
              }
            />
          </CardContent>
        </Card>
      </div>

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
