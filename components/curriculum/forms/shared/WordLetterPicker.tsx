import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Extract letters from an Arabic word, keeping harakat attached to their letters.
 *
 * For example, "بَبِبُبْ" returns ["بَ", "بِ", "بُ", "بْ"] - each letter with its diacritic.
 *
 * Strips:
 * - Whitespace
 *
 * Preserves duplicates so the picker can surface every occurrence.
 * Exposed for callers that need to compute counts / occurrences alongside
 * the picker (e.g. "the letter X appears N times in the word").
 */
export function extractLettersFromWord(word: string): string[] {
  if (!word) return [];

  const result: string[] = [];
  const chars = word.split('');

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Skip whitespace
    if (char.trim() === '') continue;

    // Skip standalone diacritics (they should be attached to previous letter)
    if (/[ً-ٟ]/.test(char)) continue;

    // Start with the base letter
    let letterWithDiacritics = char;

    // Collect any following diacritics
    while (i + 1 < chars.length && /[ً-ٟ]/.test(chars[i + 1])) {
      i++;
      letterWithDiacritics += chars[i];
    }

    result.push(letterWithDiacritics);
  }

  return result;
}

export interface WordLetterPickerProps {
  /** The Arabic word to source letters from. */
  word: string;
  /** Currently selected letter character (or empty string for none). */
  value: string;
  /** Called when a letter button is clicked. */
  onChange: (letter: string) => void;
  /** Optional clear handler. When provided, a "Clear selection" link is shown. */
  onClear?: () => void;
  /** Number of grid columns. Defaults to 6. */
  columns?: 4 | 5 | 6 | 8;
  /**
   * Message shown when no word is entered yet.
   * Defaults to "Enter a word first to see available letters".
   */
  emptyMessage?: string;
  /**
   * If true, reverse the visual order of letter buttons so they read
   * right-to-left like the original Arabic word. Defaults to true.
   */
  reverseOrder?: boolean;
}

/**
 * WordLetterPicker
 *
 * Renders a grid of clickable buttons — one for each letter of the supplied
 * Arabic word — so an author can pick which letter from that specific word
 * the activity should target. Mirrors the UX used in the "Tap Letter in Word"
 * form so the same interaction shows up wherever a letter is selected from
 * a word context.
 *
 * Why reusable:
 * - Eliminates the "free-form letter picker" trap where authors could pick a
 *   letter that isn't even present in the word.
 * - Keeps the visual / interaction style consistent across activity forms.
 */
export function WordLetterPicker({
  word,
  value,
  onChange,
  onClear,
  columns = 6,
  emptyMessage = 'Enter a word first to see available letters',
  reverseOrder = true,
}: WordLetterPickerProps) {
  const letters = useMemo(() => extractLettersFromWord(word), [word]);

  if (letters.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const orderedLetters = reverseOrder ? [...letters].reverse() : letters;

  const gridColsClass =
    columns === 4
      ? 'grid-cols-4'
      : columns === 5
      ? 'grid-cols-5'
      : columns === 8
      ? 'grid-cols-8'
      : 'grid-cols-6';

  return (
    <div className="space-y-2">
      <div className={cn('grid gap-2', gridColsClass)}>
        {orderedLetters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            onClick={() => onChange(letter)}
            className={cn(
              'aspect-square flex items-center justify-center text-4xl font-arabic rounded-lg border-2 transition-all hover:scale-105',
              value === letter
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            {letter}
          </button>
        ))}
      </div>

      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}
