/**
 * AudioUploadForm Component
 *
 * Form for uploading new audio assets with category and tags.
 * Handles drag & drop, file validation, and audio preview.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { AudioCategory, AudioUploadData } from '@/lib/types/audio';
import { AUDIO_CATEGORIES, SUPPORTED_AUDIO_TYPES, MAX_AUDIO_FILE_SIZE } from '@/lib/types/audio';

interface AudioUploadFormProps {
  onUpload: (data: AudioUploadData) => Promise<void>;
  defaultCategory?: AudioCategory;
  initialFile?: File | null;
}

export function AudioUploadForm({
  onUpload,
  defaultCategory = 'effects',
  initialFile = null,
}: AudioUploadFormProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<AudioCategory>(defaultCategory);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (initialFile) {
      handleFileChange(initialFile);
    }
  }, [initialFile]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setDisplayName('');
      return;
    }

    if (!SUPPORTED_AUDIO_TYPES.includes(selectedFile.type)) {
      setError('Please select a valid audio file (MP3, WAV, OGG, or M4A)');
      return;
    }

    if (selectedFile.size > MAX_AUDIO_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setFile(selectedFile);

    const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
    setDisplayName(nameWithoutExtension);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !file) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter a name for this audio');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadData: AudioUploadData = {
        displayName: displayName.trim(),
        file,
        category,
        tags,
      };

      await onUpload(uploadData);

      setFile(null);
      setDisplayName('');
      setTags([]);
      setTagInput('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* File Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${file ? 'bg-gray-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/m4a"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {file ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isPlaying
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }
                `}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileChange(null);
              }}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">&#127925;</div>
            <p className="text-sm text-gray-600 mb-1">
              Drag & drop an audio file here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              MP3, WAV, OGG, or M4A (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Audio Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter a name for this audio"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(AUDIO_CATEGORIES).map(([key, { label, description }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as AudioCategory)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-all text-left
                ${category === key
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }
              `}
              title={description}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Enter a tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Add
          </button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  &#10005;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!file || uploading}
        className={`
          w-full py-2 px-4 rounded-md font-medium transition-colors
          ${file && !uploading
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {uploading ? 'Uploading...' : 'Upload Audio'}
      </button>
    </form>
  );
}
