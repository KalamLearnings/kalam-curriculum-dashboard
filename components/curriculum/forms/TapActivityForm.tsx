import React, { useMemo, useCallback } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import type { TapLetterInWordConfig } from '@/lib/types/activity-configs';
import { FormField } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { WordLetterPicker, extractLettersFromWord } from './shared';
import { useLetters } from '@/lib/hooks/useLetters';
import {
  LetterReference,
  HarakaType,
  HARAKA_CHARS,
  isLetterReference,
  createLetterReference,
  stripTatweel,
  LetterForm,
} from '@/lib/utils/letterReference';

// Extract haraka from a character with diacritic
function extractHaraka(char: string): HarakaType | undefined {
  for (const [harakaType, harakaChar] of Object.entries(HARAKA_CHARS)) {
    if (harakaType !== 'none' && harakaChar && char.includes(harakaChar)) {
      return harakaType as HarakaType;
    }
  }
  return undefined;
}

// Strip diacritics to get base letter
function stripDiacritics(char: string): string {
  return char.replace(/[ً-ٰٟ]/g, '');
}

// For tap_letter_in_word, always use 'isolated' form since we're matching
// against the base letter character as it appears in the word string
function determineLetterForm(): LetterForm {
  return 'isolated';
}

export function TapActivityForm({
  config,
  onChange,
}: BaseActivityFormProps<TapLetterInWordConfig>) {
  const { letters: allLetters } = useLetters();

  const targetWord = config?.targetWord || '';
  const wordMeaning = config?.wordMeaning || '';

  const updateConfig = (updates: Partial<TapLetterInWordConfig>) => {
    onChange({ ...config, ...updates });
  };

  // Letters available to pick from (sourced from the target word), as logical
  // letters (base letter + trailing diacritics = one entry).
  const wordLetters = useMemo(() => extractLettersFromWord(targetWord), [targetWord]);

  // Resolve a stored `targetLetter` (object LetterReference OR raw character string)
  // to its base character, so we can locate it among the word's logical letters.
  const resolveTargetBaseChar = useCallback(
    (targetLetter: unknown): string | undefined => {
      if (isLetterReference(targetLetter)) {
        const letterData = allLetters.find((l) => l.id === targetLetter.letterId);
        return letterData?.letter;
      }
      if (typeof targetLetter === 'string' && targetLetter.trim() !== '') {
        // Could be a letter ID or an actual character.
        const byId = allLetters.find((l) => l.id === targetLetter);
        if (byId) return byId.letter;
        return stripDiacritics(stripTatweel(targetLetter));
      }
      return undefined;
    },
    [allLetters]
  );

  // Derive the selected logical indices from config, supporting every stored shape:
  //   1. New format: config.targetIndices (authoritative).
  //   2. Legacy single-index hint: config.targetLetterIndex.
  //   3. Legacy targetLetter (object or string) with no index — locate it in the word.
  const selectedIndices = useMemo<number[]>(() => {
    // 1. New format.
    if (Array.isArray(config?.targetIndices) && config.targetIndices.length > 0) {
      return (config.targetIndices as number[]).filter(
        (i) => i >= 0 && i < wordLetters.length
      );
    }

    // 2. Legacy single-index hint.
    if (
      typeof config?.targetLetterIndex === 'number' &&
      config.targetLetterIndex >= 0 &&
      config.targetLetterIndex < wordLetters.length
    ) {
      return [config.targetLetterIndex];
    }

    // 3. Derive from targetLetter by matching base characters in the word.
    const baseChar = resolveTargetBaseChar(config?.targetLetter);
    if (!baseChar) return [];

    const matches: number[] = [];
    wordLetters.forEach((letter, idx) => {
      if (stripDiacritics(letter) === baseChar) matches.push(idx);
    });

    if (matches.length === 0) return [];
    if (matches.length === 1) return matches;

    // Multiple occurrences: only auto-select all when the stored targetCount says so.
    // Otherwise it's ambiguous which occurrence was intended — leave unselected so the
    // author re-picks explicitly.
    const targetCount = config?.targetCount;
    if (typeof targetCount === 'number' && targetCount === matches.length) {
      return matches;
    }
    return [];
  }, [config, wordLetters, resolveTargetBaseChar]);

  // Build a LetterReference for the letter at a given logical index.
  const buildLetterRef = useCallback(
    (index: number): LetterReference | undefined => {
      const letterWithHaraka = wordLetters[index];
      if (!letterWithHaraka) return undefined;

      const baseChar = stripDiacritics(letterWithHaraka);
      const haraka = extractHaraka(letterWithHaraka);
      const form = determineLetterForm();

      const letterData = allLetters.find((l) => l.letter === baseChar);
      if (!letterData) {
        console.warn(`Could not find letter ID for character: ${baseChar}`);
        return undefined;
      }

      return createLetterReference(letterData.id, form, haraka);
    },
    [wordLetters, allLetters]
  );

  // Persist a new set of selected indices: update targetIndices + targetCount, and
  // keep targetLetter (a LetterReference for the first selection) for display/audio.
  const commitIndices = useCallback(
    (indices: number[]) => {
      const sorted = [...indices].sort((a, b) => a - b);

      // Drop the legacy single-index hint; targetIndices is now authoritative.
      const { targetLetterIndex: _removed, ...rest } = config ?? ({} as TapLetterInWordConfig);

      if (sorted.length === 0) {
        const { targetLetter: _t, ...withoutLetter } = rest;
        onChange({ ...withoutLetter, targetIndices: [], targetCount: 1 });
        return;
      }

      const firstRef = buildLetterRef(sorted[0]);
      onChange({
        ...rest,
        targetIndices: sorted,
        targetCount: sorted.length,
        ...(firstRef ? { targetLetter: firstRef } : {}),
      });
    },
    [config, onChange, buildLetterRef]
  );

  const handleToggleIndex = useCallback(
    (index: number) => {
      const set = new Set(selectedIndices);
      if (set.has(index)) {
        set.delete(index);
      } else {
        set.add(index);
      }
      commitIndices(Array.from(set));
    },
    [selectedIndices, commitIndices]
  );

  const handleClear = useCallback(() => commitIndices([]), [commitIndices]);

  // Human-readable summary of the current selection.
  const selectedLettersDisplay = selectedIndices
    .slice()
    .sort((a, b) => a - b)
    .map((i) => wordLetters[i])
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <WordSelector
        value={targetWord}
        onChange={(word) => updateConfig({ targetWord: word })}
        label="Target Word"
        required
        showTranslation
        translationValue={wordMeaning}
        onTranslationChange={(translation) => updateConfig({ wordMeaning: translation })}
      />

      {targetWord && (
        <ActivityWordStatus
          words={[{ arabic: targetWord, transliteration: wordMeaning, english: wordMeaning }]}
        />
      )}

      <FormField
        label="Target Letters"
        hint="Tap each letter the child must find. Selecting a position pins that exact letter (form + haraka + occurrence)."
        required
      >
        <WordLetterPicker
          word={targetWord}
          selectedIndices={selectedIndices}
          onToggleIndex={handleToggleIndex}
          onClear={handleClear}
          emptyMessage="Enter a target word first to see available letters"
        />
        {selectedLettersDisplay.length > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            Selected {selectedLettersDisplay.length}:{' '}
            {selectedLettersDisplay.map((l) => `"${l}"`).join(', ')}
          </p>
        )}
      </FormField>
    </div>
  );
}
