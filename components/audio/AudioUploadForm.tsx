/**
 * AudioUploadForm Component
 *
 * Form for creating new audio assets via file upload or TTS generation.
 * Handles drag & drop, file validation, TTS, and audio preview.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { AudioCategory, AudioUploadData } from '@/lib/types/audio';
import { AUDIO_CATEGORIES, SUPPORTED_AUDIO_TYPES, MAX_AUDIO_FILE_SIZE } from '@/lib/types/audio';
import { cn } from '@/lib/utils';

type InputMode = 'upload' | 'tts';

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
  const [mode, setMode] = useState<InputMode>(initialFile ? 'upload' : 'upload');
  const [file, setFile] = useState<File | null>(initialFile);
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<AudioCategory>(defaultCategory);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // TTS state
  const [ttsText, setTtsText] = useState('');
  const [ttsLanguage, setTtsLanguage] = useState<'en' | 'ar'>('ar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<{ blob: Blob; blobUrl: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (initialFile) {
      handleFileChange(initialFile);
    }
  }, [initialFile]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (generatedBlob?.blobUrl) {
        URL.revokeObjectURL(generatedBlob.blobUrl);
      }
    };
  }, [generatedBlob]);

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
      setMode('upload');
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
    if (!audioRef.current) return;

    const audioUrl = mode === 'upload' && file
      ? URL.createObjectURL(file)
      : generatedBlob?.blobUrl;

    if (!audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const handleGenerateTTS = async () => {
    if (!ttsText.trim()) {
      setError('Please enter text to generate audio');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { createClient, getEnvironmentBaseUrl, getEdgeFunctionAuthHeaders } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in.');
      }

      const response = await fetch(`${getEnvironmentBaseUrl()}/functions/v1/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getEdgeFunctionAuthHeaders(session.access_token),
        },
        body: JSON.stringify({
          text: ttsText,
          language: ttsLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData;

      // Convert base64 to blob
      const binaryString = atob(data.audio_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.content_type });
      const blobUrl = URL.createObjectURL(blob);

      // Cleanup old blob
      if (generatedBlob?.blobUrl) {
        URL.revokeObjectURL(generatedBlob.blobUrl);
      }

      setGeneratedBlob({ blob, blobUrl });

      // Auto-set display name from text if not set
      if (!displayName.trim()) {
        const truncatedText = ttsText.slice(0, 30) + (ttsText.length > 30 ? '...' : '');
        setDisplayName(truncatedText);
      }

      toast.success('Audio generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate audio';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadFile: File;

    if (mode === 'upload') {
      if (!file) {
        setError('Please select a file');
        return;
      }
      uploadFile = file;
    } else {
      if (!generatedBlob) {
        setError('Please generate audio first');
        return;
      }
      // Convert blob to file
      uploadFile = new File([generatedBlob.blob], `${displayName || 'tts-audio'}.mp3`, {
        type: 'audio/mpeg',
      });
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
        file: uploadFile,
        category,
        tags,
      };

      await onUpload(uploadData);

      // Reset form
      setFile(null);
      setDisplayName('');
      setTags([]);
      setTagInput('');
      setTtsText('');
      setGeneratedBlob(null);
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

  const hasAudio = mode === 'upload' ? !!file : !!generatedBlob;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Mode Selector */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all',
            mode === 'upload'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('tts')}
          className={cn(
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all',
            mode === 'tts'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Generate from Text
        </button>
      </div>

      {mode === 'upload' ? (
        /* File Upload Mode */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400',
            file ? 'bg-gray-50' : ''
          )}
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
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    isPlaying
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  )}
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
      ) : (
        /* TTS Generation Mode */
        <div className="space-y-3">
          {/* Language Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTtsLanguage('ar')}
              className={cn(
                'flex-1 py-2 px-3 text-sm font-medium rounded-md border-2 transition-all',
                ttsLanguage === 'ar'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              Arabic
            </button>
            <button
              type="button"
              onClick={() => setTtsLanguage('en')}
              className={cn(
                'flex-1 py-2 px-3 text-sm font-medium rounded-md border-2 transition-all',
                ttsLanguage === 'en'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              English
            </button>
          </div>

          {/* Text Input */}
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder={ttsLanguage === 'ar' ? 'اكتب النص هنا...' : 'Enter text to convert to speech...'}
            dir={ttsLanguage === 'ar' ? 'rtl' : 'ltr'}
            rows={4}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              ttsLanguage === 'ar' && 'font-arabic'
            )}
          />

          {/* Generate Button + Preview */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateTTS}
              disabled={!ttsText.trim() || isGenerating}
              className={cn(
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2',
                ttsText.trim() && !isGenerating
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  {generatedBlob ? 'Regenerate' : 'Generate Audio'}
                </>
              )}
            </button>

            {generatedBlob && (
              <button
                type="button"
                onClick={handlePlayPause}
                className={cn(
                  'p-2 rounded-md transition-all',
                  isPlaying
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                )}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {generatedBlob && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-700">Audio generated and ready to save</span>
            </div>
          )}
        </div>
      )}

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
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-all text-left',
                category === key
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              )}
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
        disabled={!hasAudio || uploading}
        className={cn(
          'w-full py-2 px-4 rounded-md font-medium transition-colors',
          hasAudio && !uploading
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        )}
      >
        {uploading ? 'Saving...' : 'Save Audio'}
      </button>
    </form>
  );
}
