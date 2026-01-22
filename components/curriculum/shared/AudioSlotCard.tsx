'use client';

/**
 * Audio Slot Card Component
 *
 * Expandable card for configuring a predefined audio response slot.
 * Includes text input, TTS generation, preview, and follow-up actions.
 */

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { resolveTemplateText, hasTemplates } from '@/lib/utils/templateResolver';
import { FollowUpActionsPanel } from './FollowUpActionsPanel';
import type { AudioResponse, AudioFollowUp } from '@kalam/curriculum-schemas';

interface Letter {
  id?: string;
  letter: string;
  name_english: string;
  name_arabic?: string;
  letter_sound?: string;
}

interface AudioSlotCardProps {
  /** Slot key identifier */
  slotKey: string;
  /** Display label */
  label: string;
  /** Description of when this audio plays */
  description: string;
  /** Emoji icon */
  icon: string;
  /** Current audio response value */
  value?: AudioResponse;
  /** Callback when value changes */
  onChange: (value: AudioResponse | undefined) => void;
  /** Letter data for template resolution */
  letter?: Letter | null;
  /** Voice ID for TTS generation */
  voiceId?: string;
}

const VOICE_TAGS = [
  '[excited]',
  '[happy]',
  '[encouraging]',
  '[calm]',
  '[gentle]',
  '[whispers]',
  '[pause]',
] as const;

export function AudioSlotCard({
  slotKey,
  label,
  description,
  icon,
  value,
  onChange,
  letter,
  voiceId,
}: AudioSlotCardProps) {
  const [isExpanded, setIsExpanded] = useState(!!value?.text);
  const [text, setText] = useState(value?.text || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<{
    blob: Blob;
    blobUrl: string;
    filePath: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasAudio = !!(generatedBlob || value?.audio_url);

  // Upload audio blob to Supabase Storage
  const uploadAudioToStorage = async (blob: Blob, filePath: string): Promise<string> => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from('curriculum-audio')
      .upload(filePath, blob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload audio: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('curriculum-audio')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Generate audio via TTS
  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      // Resolve templates before sending to TTS
      const resolvedText = letter ? resolveTemplateText(text, letter) : text;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: resolvedText,
          language: 'en',
          voice_id: voiceId,
          activity_id: slotKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate audio');
      }

      const data = await response.json();

      // Convert base64 to blob
      const binaryString = atob(data.audio_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.content_type });

      // Upload to storage immediately and get the public URL
      const audioUrl = await uploadAudioToStorage(blob, data.suggested_file_path);

      // Create local blob URL for preview
      const blobUrl = URL.createObjectURL(blob);

      // Clean up old blob URL
      if (generatedBlob?.blobUrl) {
        URL.revokeObjectURL(generatedBlob.blobUrl);
      }

      setGeneratedBlob({ blob, blobUrl, filePath: data.suggested_file_path });

      // Update parent with new text AND the uploaded audio_url
      onChange({
        ...value,
        text,
        audio_url: audioUrl,
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play audio preview
  const handlePlay = () => {
    const audioUrl = generatedBlob?.blobUrl || value?.audio_url;
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
  };

  // Stop audio
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // Insert voice tag at cursor
  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + (before && !before.endsWith(' ') ? ' ' : '') + tag + ' ' + after;

    setText(newText);

    // Restore focus
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tag.length + (before && !before.endsWith(' ') ? 2 : 1);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle text change
  const handleTextChange = (newText: string) => {
    setText(newText);
    if (value || newText) {
      onChange({
        ...value,
        text: newText,
      });
    }
  };

  // Handle follow-up change
  const handleFollowUpChange = (followUp: AudioFollowUp | undefined) => {
    onChange({
      ...value,
      text,
      followUp,
    });
  };

  // Clear this slot
  const handleClear = () => {
    setText('');
    setGeneratedBlob(null);
    onChange(undefined);
    setIsExpanded(false);
  };

  // Get generated blob for form submission
  const getGeneratedBlob = () => generatedBlob;

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden transition-all',
        isExpanded ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200',
        hasAudio && 'border-green-200'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              {hasAudio && (
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <svg
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
          {/* Text Input */}
          <div className="pt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Audio Text
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`e.g., "Great job! You found it!"`}
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Voice Tags */}
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] text-gray-500 self-center mr-1">Tags:</span>
            {VOICE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => insertTag(tag)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-white text-gray-600 border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Template Preview */}
          {hasTemplates(text) && letter && (
            <div className="px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="flex items-start gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <div className="flex-1">
                  <div className="text-blue-700 font-medium">Preview:</div>
                  <div className="text-blue-900">"{resolveTemplateText(text, letter)}"</div>
                </div>
              </div>
            </div>
          )}

          {/* Generate / Play Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!text.trim() || isGenerating}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center gap-1',
                text.trim() && !isGenerating
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                  <span>{hasAudio ? 'Regenerate' : 'Generate'}</span>
                </>
              )}
            </button>

            {hasAudio && (
              <button
                type="button"
                onClick={isPlaying ? handleStop : handlePlay}
                className={cn(
                  'p-1 rounded transition-all',
                  isPlaying
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                )}
              >
                {isPlaying ? (
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Follow-up Actions */}
          <FollowUpActionsPanel
            value={value?.followUp}
            onChange={handleFollowUpChange}
          />

          {/* Clear Button */}
          {(text || value) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
