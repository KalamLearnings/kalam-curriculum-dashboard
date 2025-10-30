/**
 * AssetUploadForm Component
 *
 * Form for uploading new assets with category and tags.
 * Handles drag & drop, file validation, and preview.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { AssetCategory, AssetUploadData } from '@/lib/types/assets';
import { ASSET_CATEGORIES } from '@/lib/types/assets';

interface AssetUploadFormProps {
  onUpload: (data: AssetUploadData) => Promise<void>;
  defaultCategory?: AssetCategory;
  initialFile?: File | null;
}

export function AssetUploadForm({ onUpload, defaultCategory = 'misc', initialFile = null }: AssetUploadFormProps) {
  const [file, setFile] = useState<File | null>(initialFile);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<AssetCategory>(defaultCategory);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial file if provided
  useEffect(() => {
    if (initialFile) {
      handleFileChange(initialFile);
    }
  }, [initialFile]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      setDisplayName('');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Auto-populate display name from filename (remove extension)
    const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
    setDisplayName(nameWithoutExtension);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter a name for this asset');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadData: AssetUploadData = {
        displayName: displayName.trim(),
        file,
        category,
        tags,
      };

      await onUpload(uploadData);

      // Reset form
      setFile(null);
      setPreview(null);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${file ? 'bg-gray-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-2">
            <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
            <p className="text-sm text-gray-600">{file?.name}</p>
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
            <div className="text-4xl mb-2">📤</div>
            <p className="text-sm text-gray-600 mb-1">
              Drag & drop an image here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG, or WebP (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Asset Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter a name for this asset"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          This name will be used to identify the asset in your library
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(ASSET_CATEGORIES).map(([key, { label, icon }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key as AssetCategory)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-all
                ${category === key
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }
              `}
            >
              {icon} {label}
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Add
          </button>
        </div>

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
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
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {uploading ? 'Uploading...' : 'Upload Asset'}
      </button>
    </form>
  );
}
