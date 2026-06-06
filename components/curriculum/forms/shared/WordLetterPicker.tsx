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
  /**
   * Currently selected index (single-select mode).
   * Ignored when `selectedIndices` is provided.
   */
  selectedIndex?: number;
  /**
   * Called when a letter button is clicked, with its index (single-select mode).
   * Optional when using multi-select via `onToggleIndex`.
   */
  onIndexChange?: (index: number) => void;
  /**
   * Currently selected indices (multi-select mode). When provided, every index in
   * this set is highlighted and clicking a button toggles it via `onToggleIndex`.
   */
  selectedIndices?: number[];
  /** Called to toggle an index when in multi-select mode. */
  onToggleIndex?: (index: number) => void;
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
  selectedIndex,
  onIndexChange,
  selectedIndices,
  onToggleIndex,
  onClear,
  columns = 6,
  emptyMessage = 'Enter a word first to see available letters',
  reverseOrder = true,
}: WordLetterPickerProps) {
  const letters = useMemo(() => extractLettersFromWord(word), [word]);

  // Multi-select mode is active when a selectedIndices array is supplied.
  const multiSelect = selectedIndices !== undefined;
  const selectedSet = useMemo(
    () => new Set(selectedIndices ?? []),
    [selectedIndices]
  );

  const isSelected = (index: number) =>
    multiSelect ? selectedSet.has(index) : selectedIndex === index;

  const handleClick = (index: number) => {
    if (multiSelect) {
      onToggleIndex?.(index);
    } else {
      onIndexChange?.(index);
    }
  };

  const hasSelection = multiSelect
    ? selectedSet.size > 0
    : selectedIndex !== undefined && selectedIndex >= 0;

  if (letters.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  // Create array with original indices before reversing for display
  const lettersWithIndices = letters.map((letter, idx) => ({ letter, originalIndex: idx }));
  const orderedLetters = reverseOrder ? [...lettersWithIndices].reverse() : lettersWithIndices;

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
        {orderedLetters.map(({ letter, originalIndex }) => (
          <button
            key={`${letter}-${originalIndex}`}
            type="button"
            onClick={() => handleClick(originalIndex)}
            className={cn(
              'aspect-square flex items-center justify-center text-4xl font-arabic rounded-lg border-2 transition-all hover:scale-105',
              isSelected(originalIndex)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            {letter}
          </button>
        ))}
      </div>

      {onClear && hasSelection && (
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
