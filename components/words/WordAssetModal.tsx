/**
 * WordAssetModal Component
 *
 * Modal for uploading/managing word assets (image and audio)
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { Word } from '@/lib/hooks/useWords';
import { uploadImage, compressImage } from '@/lib/utils/imageUpload';
import { createClient } from '@/lib/supabase/client';

interface WordAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: Word;
  onUploadAssets: (assets: { image_path?: string; audio_path?: string }) => Promise<void>;
}

export function WordAssetModal({
  isOpen,
  onClose,
  word,
  onUploadAssets,
}: WordAssetModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Load existing assets
  useEffect(() => {
    if (word.image_path) {
      const url = supabase.storage
        .from('curriculum-images')
        .getPublicUrl(word.image_path).data.publicUrl;
      setImagePreview(url);
    }
  }, [word, supabase]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Compress image
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressed);
      setError(null);
    } catch (err) {
      setError('Failed to process image');
    }
  };

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

  const handleUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const assets: { image_path?: string; audio_path?: string } = {};

      // Upload image if selected
      if (imageFile) {
        const { path } = await uploadImage(imageFile, 'assets/words');
        assets.image_path = path;
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

      // Update word assets
      await onUploadAssets(assets);

      // Reset form
      setImageFile(null);
      setAudioFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload assets';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(word.image_path ? supabase.storage.from('curriculum-images').getPublicUrl(word.image_path).data.publicUrl : null);
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Word Image {!word.has_image && <span className="text-orange-600">(Missing)</span>}
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt={word.arabic}
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                {imageFile && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP</p>
                </div>
              </label>
            )}

            {!imagePreview && (
              <label className="mt-3 block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </label>
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
                  onClick={handleRemoveAudio}
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
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || (!imageFile && !audioFile)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Assets'}
          </button>
        </div>
      </div>
    </div>
  );
}
