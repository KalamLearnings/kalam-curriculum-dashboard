import React, { useMemo, useEffect, useCallback } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { WordLetterPicker, extractLettersFromWord } from './shared';
import { useLetters } from '@/lib/hooks/useLetters';
import {
  LetterReference,
  HarakaType,
  HARAKA_CHARS,
  isLetterReference,
  resolveLetterWithHaraka,
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

// Determine letter form based on position in word
function determineLetterForm(index: number, totalLetters: number): LetterForm {
  if (totalLetters === 1) return 'isolated';
  if (index === 0) return 'initial';
  if (index === totalLetters - 1) return 'final';
  return 'medial';
}

export function TapActivityForm({ config, onChange }: BaseActivityFormProps) {
  const { letters: allLetters } = useLetters();

  const targetWord = config?.targetWord || '';
  const targetLetter = config?.targetLetter;
  const wordMeaning = config?.wordMeaning || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates };
    console.log('updateConfig:', { updates, newConfig });
    onChange(newConfig);
  };

  // Letters available to pick from (sourced from the target word).
  const wordLetters = useMemo(() => extractLettersFromWord(targetWord), [targetWord]);

  // Find the currently selected index based on targetLetter reference
  const selectedIndex = useMemo(() => {
    if (!targetLetter || !isLetterReference(targetLetter)) return undefined;

    // Resolve the targetLetter to a character with haraka for comparison
    const targetChar = resolveLetterWithHaraka(targetLetter, allLetters);
    if (!targetChar) return undefined;

    // Find the index in wordLetters that matches
    return wordLetters.findIndex(letter => letter === targetChar);
  }, [targetLetter, allLetters, wordLetters]);

  // Build a LetterReference when user selects a letter by index
  const handleLetterSelect = useCallback((index: number) => {
    const letterWithHaraka = wordLetters[index];
    if (!letterWithHaraka) {
      console.warn('No letter at index', index);
      return;
    }

    const baseChar = stripDiacritics(letterWithHaraka);
    const haraka = extractHaraka(letterWithHaraka);
    const form = determineLetterForm(index, wordLetters.length);

    console.log('handleLetterSelect:', { index, letterWithHaraka, baseChar, haraka, form, allLettersCount: allLetters.length });

    // Look up the letter ID from the base character
    const letterData = allLetters.find(l => l.letter === baseChar);
    if (!letterData) {
      console.warn(`Could not find letter ID for character: ${baseChar}`, { allLetters: allLetters.map(l => ({ id: l.id, letter: l.letter })) });
      return;
    }

    const letterRef: LetterReference = {
      letterId: letterData.id,
      form,
      ...(haraka && { haraka }),
    };

    console.log('Created letterRef:', letterRef);
    updateConfig({ targetLetter: letterRef, targetCount: 1 });
  }, [wordLetters, allLetters, updateConfig]);

  // Get selected letter for display
  const selectedLetterDisplay = selectedIndex !== undefined && selectedIndex >= 0
    ? wordLetters[selectedIndex]
    : undefined;

  console.log('TapActivityForm render:', { targetLetter, selectedIndex, selectedLetterDisplay, wordLetters });

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

      <FormField label="Target Letter" hint="Select the letter to find in the word" required>
        <WordLetterPicker
          word={targetWord}
          selectedIndex={selectedIndex}
          onIndexChange={handleLetterSelect}
          emptyMessage="Enter a target word first to see available letters"
        />
        {selectedLetterDisplay && isLetterReference(targetLetter) && (
          <p className="text-xs text-blue-600 mt-1">
            Selected: "{selectedLetterDisplay}" (letterId: {targetLetter.letterId}, form: {targetLetter.form}
            {targetLetter.haraka && `, haraka: ${targetLetter.haraka}`})
          </p>
        )}
      </FormField>
    </div>
  );
}
