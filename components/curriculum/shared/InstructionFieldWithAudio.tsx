/**
 * Integrated instruction text field with audio generation controls
 * Combines text input and audio toolbar into a single cohesive component
 */

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface InstructionFieldWithAudioProps {
  /** Current text value */
  value: string;
  /** Callback when text changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder: string;
  /** Language of the text */
  language: 'en' | 'ar';
  /** Text direction */
  dir?: 'ltr' | 'rtl';
  /** Whether audio is currently being generated */
  isGenerating: boolean;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio exists (generated or existing) */
  hasAudio: boolean;
  /** Callback to generate audio */
  onGenerate: () => void;
  /** Callback to play audio */
  onPlay: () => void;
}

const VOICE_TAGS = [
  // Emotions & Tones (for kids)
  '[excited]',
  '[happy]',
  '[cheerful]',
  '[encouraging]',
  '[proud]',
  '[calm]',
  '[gentle]',
  '[friendly]',
  '[playful]',
  '[curious]',
  '[surprised]',
  // Delivery styles
  '[whispers]',
  '[giggles]',
  // Pauses
  '[pause]',
  '[short pause]',
  '[long pause]',
] as const;

/**
 * Instruction text field with integrated audio controls
 * Features text input + inline voice tags + audio toolbar
 */
export function InstructionFieldWithAudio({
  value,
  onChange,
  placeholder,
  language,
  dir = 'ltr',
  isGenerating,
  isPlaying,
  hasAudio,
  onGenerate,
  onPlay,
}: InstructionFieldWithAudioProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const languageLabel = language === 'en' ? 'English' : 'Arabic';

  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insert tag at cursor position
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = before + (before && !before.endsWith(' ') ? ' ' : '') + tag + ' ' + after;

    onChange(newValue);

    // Restore focus and move cursor after the inserted tag
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tag.length + (before && !before.endsWith(' ') ? 2 : 1);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        isFocused ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-300",
        "bg-white"
      )}
    >
      {/* Text Input Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        dir={dir}
        rows={3}
        className={cn(
          "w-full px-3 py-2 text-sm resize-none",
          "focus:outline-none",
          "placeholder:text-gray-400"
        )}
      />

      {/* Voice Tags + Audio Controls (Bottom) */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50/50 to-blue-50/50 px-2 py-1.5">
        {/* Voice Tags Row */}
        <div className="flex flex-wrap gap-1 items-center mb-1.5">
          <span className="text-[10px] text-gray-500 font-medium mr-0.5">Voice:</span>
          {VOICE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleInsertTag(tag)}
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-mono rounded transition-all",
                "bg-white text-gray-600 border border-gray-200",
                "hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700",
                "active:scale-95"
              )}
              title={`Insert ${tag} tag`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Audio Action Buttons Row */}
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!value.trim() || isGenerating}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded transition-all",
              "flex items-center gap-1",
              value.trim() && !isGenerating
                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            title={`Generate audio for ${languageLabel} text`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span className="hidden sm:inline">{hasAudio ? 'Regenerate' : 'Generate'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onPlay}
            disabled={!hasAudio || isPlaying}
            className={cn(
              "p-1 rounded transition-all shadow-sm",
              hasAudio && !isPlaying
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            title={!hasAudio ? "Generate audio first" : isPlaying ? "Playing..." : "Play audio"}
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
