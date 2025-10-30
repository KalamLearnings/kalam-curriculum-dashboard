/**
 * Reusable component for TTS audio generation controls
 * Integrated design with voice tags and audio controls
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AudioControlsProps {
  /** Current text value */
  text: string;
  /** Language of the text */
  language: 'en' | 'ar';
  /** Whether audio is currently being generated */
  isGenerating: boolean;
  /** Whether audio exists (generated or existing) */
  hasAudio: boolean;
  /** Callback to generate audio */
  onGenerate: () => void;
  /** Callback to play audio */
  onPlay: () => void;
  /** Callback when a tag is inserted */
  onInsertTag: (tag: string) => void;
}

const VOICE_TAGS = [
  { tag: '[excited]', label: 'Excited', emoji: '🎉' },
  { tag: '[happy]', label: 'Happy', emoji: '😊' },
  { tag: '[encouraging]', label: 'Encouraging', emoji: '💪' },
  { tag: '[calm]', label: 'Calm', emoji: '😌' },
  { tag: '[whispers]', label: 'Whispers', emoji: '🤫' },
  { tag: '[giggles]', label: 'Giggles', emoji: '🤭' },
  { tag: '[pause]', label: 'Pause', emoji: '⏸️' },
  { tag: '[long pause]', label: 'Long Pause', emoji: '⏸️⏸️' },
] as const;

/**
 * Audio generation controls with voice tags
 * Cohesive design with integrated toolbar
 */
export function AudioControls({
  text,
  language,
  isGenerating,
  hasAudio,
  onGenerate,
  onPlay,
  onInsertTag,
}: AudioControlsProps) {
  const [showTags, setShowTags] = useState(false);
  const languageLabel = language === 'en' ? 'English' : 'Arabic';

  return (
    <div className="space-y-2 -mt-4 mb-4">
      {/* Audio Control Bar */}
      <div className="flex items-center justify-between gap-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        {/* Left: Voice Tags Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTags(!showTags)}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded transition-all",
              "flex items-center gap-1.5",
              "hover:bg-white/60",
              showTags ? "bg-white text-purple-700" : "text-gray-600"
            )}
            title="Toggle voice tags"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Voice Tags
            <svg className={cn("h-3 w-3 transition-transform", showTags && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="text-xs text-gray-500">
            Add emotion to voice
          </span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!text.trim() || isGenerating}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
              "flex items-center gap-1.5",
              text.trim() && !isGenerating
                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
            title={`Generate audio for ${languageLabel} text`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                {hasAudio ? 'Regenerate' : 'Generate'}
              </>
            )}
          </button>

          {hasAudio && (
            <button
              type="button"
              onClick={onPlay}
              className="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-all shadow-sm"
              title="Play audio"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Voice Tags Panel */}
      {showTags && (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-2">
            {VOICE_TAGS.map(({ tag, label, emoji }) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onInsertTag(tag);
                  setShowTags(false); // Auto-close after selection
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  "bg-gray-50 text-gray-700 border border-gray-200",
                  "hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700",
                  "flex items-center gap-1.5"
                )}
                title={`Insert ${tag}`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
            💡 Click a tag to insert it into your text. Tags control how the AI voice sounds.
          </p>
        </div>
      )}
    </div>
  );
}
