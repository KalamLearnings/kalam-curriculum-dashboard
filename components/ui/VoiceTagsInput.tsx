/**
 * VoiceTagsInput Component
 *
 * Reusable textarea with voice tag insertion buttons.
 * Used for TTS text input with emotion/tone/pause tags.
 */

'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

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

interface VoiceTagsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export function VoiceTagsInput({
  value,
  onChange,
  placeholder = 'Enter text...',
  dir = 'rtl',
  rows = 3,
  className,
  disabled = false,
}: VoiceTagsInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current || disabled) return;

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
        'border rounded-lg overflow-hidden transition-all',
        isFocused ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-300',
        'bg-white',
        className
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
        rows={rows}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-sm resize-none',
          'focus:outline-none',
          'placeholder:text-gray-400',
          dir === 'rtl' && 'font-arabic',
          disabled && 'bg-gray-50 cursor-not-allowed'
        )}
      />

      {/* Voice Tags (Bottom) */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50/50 to-blue-50/50 px-2 py-1.5">
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-gray-500 font-medium mr-0.5">Voice:</span>
          {VOICE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleInsertTag(tag)}
              disabled={disabled}
              className={cn(
                'px-1.5 py-0.5 text-[10px] font-mono rounded transition-all',
                'bg-white text-gray-600 border border-gray-200',
                'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700',
                'active:scale-95',
                disabled && 'opacity-50 cursor-not-allowed hover:bg-white hover:border-gray-200 hover:text-gray-600'
              )}
              title={`Insert ${tag} tag`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { VOICE_TAGS };
