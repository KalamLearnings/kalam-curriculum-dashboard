/**
 * WordAssetModal Component
 *
 * Modal for managing word assets (image and audio)
 * Supports selecting from asset library or uploading new assets
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { Word } from '@/lib/hooks/useWords';
import type { Asset, AssetUploadData } from '@/lib/types/assets';
import { createClient } from '@/lib/supabase/client';
import { AssetPicker } from '@/components/assets/AssetPicker';
import { AssetUploadForm } from '@/components/assets/AssetUploadForm';
import { uploadAsset } from '@/lib/services/assetService';

interface WordAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word;
  onUploadAssets: (assets: { image_path?: string; audio_path?: string }) => Promise<void>;
}

type TabMode = 'select' | 'upload';

export function WordAssetModal({
  isOpen,
  onClose,
  word,
  onUploadAssets,
}: WordAssetModalProps) {
  const [tabMode, setTabMode] = useState<TabMode>('select');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTabMode('select');
      setSelectedAsset(null);
      setAudioFile(null);
      setError(null);
    }
  }, [isOpen]);

  // If word already has an image, try to create an Asset object for preview
  const existingImageAsset: Asset | null = word.image_path
    ? {
        id: word.image_path,
        name: word.image_path.split('/').pop() || '',
        displayName: word.arabic,
        url: supabase.storage.from('curriculum-images').getPublicUrl(word.image_path).data.publicUrl,
        category: 'words',
        tags: [],
        createdAt: '',
        updatedAt: '',
      }
    : null;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid audio file (MP3, WAV, or OGG)');
      return;
    }

    setAudioFile(file);
    setError(null);
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setError(null);
  };

  const handleUploadNewAsset = async (data: AssetUploadData) => {
    setError(null);
    try {
      // Upload asset to library
      const newAsset = await uploadAsset(data);
      // Auto-select the newly uploaded asset
      setSelectedAsset(newAsset);
      // Switch to select tab to show confirmation
      setTabMode('select');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload asset';
      setError(message);
      throw err;
    }
  };

  const handleSave = async () => {
    setUploading(true);
    setError(null);

    try {
      const assets: { image_path?: string; audio_path?: string } = {};

      // Use selected asset's path (either newly selected or uploaded)
      if (selectedAsset) {
        // Extract the storage path from the asset ID (which is the full path)
        assets.image_path = selectedAsset.id;
      }

      // Upload audio if selected
      if (audioFile) {
        const fileName = `${word.id}_${Date.now()}.${audioFile.name.split('.').pop()}`;
        const filePath = `assets/words/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('curriculum-images')
          .upload(filePath, audioFile, {
            upsert: false,
            contentType: audioFile.type,
          });

        if (uploadError) {
          throw new Error(`Failed to upload audio: ${uploadError.message}`);
        }

        assets.audio_path = filePath;
      }

      // Only save if there's something to update
      if (Object.keys(assets).length === 0) {
        setError('Please select an image or audio file');
        return;
      }

      // Update word assets
      await onUploadAssets(assets);

      // Reset form
      setSelectedAsset(null);
      setAudioFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save assets';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Word Assets</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload image and audio for: <span className="font-arabic text-lg">{word.arabic}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Word Image {!word.has_image && <span className="text-orange-600">(Missing)</span>}
            </label>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setTabMode('select')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  tabMode === 'select'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📚 Select from Library
              </button>
              <button
                type="button"
                onClick={() => setTabMode('upload')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  tabMode === 'upload'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📤 Upload New
              </button>
            </div>

            {/* Tab Content */}
            {tabMode === 'select' ? (
              <div>
                {/* Current/Selected Image Preview */}
                {(selectedAsset || existingImageAsset) && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <img
                        src={(selectedAsset || existingImageAsset)!.url}
                        alt={(selectedAsset || existingImageAsset)!.displayName}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-900">
                            {selectedAsset ? '✓ Selected Image' : 'Current Image'}
                          </h4>
                          {selectedAsset && (
                            <button
                              type="button"
                              onClick={() => setSelectedAsset(null)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Clear Selection
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-blue-800">
                          {(selectedAsset || existingImageAsset)!.displayName}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Category: {(selectedAsset || existingImageAsset)!.category}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Asset Picker */}
                <AssetPicker
                  onSelect={handleSelectAsset}
                  selectedAssetId={selectedAsset?.id || existingImageAsset?.id}
                  emptyMessage="No assets in library. Switch to 'Upload New' to add your first asset!"
                />
              </div>
            ) : (
              <AssetUploadForm
                onUpload={handleUploadNewAsset}
                defaultCategory="words"
              />
            )}
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pronunciation Audio {!word.has_audio && <span className="text-orange-600">(Missing)</span>}
            </label>

            {word.audio_path && !audioFile ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 000 12.728M12 18v.01" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Audio file uploaded</p>
                  <p className="text-xs text-gray-500">{word.audio_path.split('/').pop()}</p>
                </div>
              </div>
            ) : audioFile ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-300">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{audioFile.name}</p>
                  <p className="text-xs text-gray-500">{(audioFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioFile(null)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">MP3, WAV, or OGG</p>
              </label>
            )}
          </div>

          {/* Word Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Word Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Transliteration:</span>{' '}
                <span className="font-medium">{word.transliteration || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">English:</span>{' '}
                <span className="font-medium">{word.english || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Letters:</span>{' '}
                <span className="font-medium">{word.letter_composition.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Used in:</span>{' '}
                <span className="font-medium">{word.usage_count} activities</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading || (!selectedAsset && !audioFile)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Saving...' : 'Save Assets'}
          </button>
        </div>
      </div>
    </div>
  );
}
