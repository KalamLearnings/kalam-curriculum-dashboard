import React, { useMemo, useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { WordLetterPicker, extractLettersFromWord } from './shared';

export function TapActivityForm({ config, onChange }: BaseActivityFormProps) {
  const targetWord = config?.targetWord || '';
  const targetLetterIndex = config?.targetLetterIndex as number | undefined;
  const wordMeaning = config?.wordMeaning || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Letters available to pick from (sourced from the target word).
  const letters = useMemo(() => extractLettersFromWord(targetWord), [targetWord]);

  // Get the selected letter for display purposes
  const selectedLetter = targetLetterIndex !== undefined && targetLetterIndex >= 0
    ? letters[targetLetterIndex]
    : undefined;

  // Clear targetLetterIndex if word changes and index is out of bounds
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  useEffect(() => {
    if (!initialLoadComplete && targetWord) {
      setInitialLoadComplete(true);
      return;
    }

    if (initialLoadComplete && targetLetterIndex !== undefined && targetLetterIndex >= letters.length) {
      updateConfig({ targetLetterIndex: undefined });
    }
  }, [letters, targetLetterIndex, initialLoadComplete, targetWord]);

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
          selectedIndex={targetLetterIndex}
          onIndexChange={(index) => updateConfig({ targetLetterIndex: index })}
          emptyMessage="Enter a target word first to see available letters"
        />
        {selectedLetter && (
          <p className="text-xs text-blue-600 mt-1">
            Selected: "{selectedLetter}" at position {(targetLetterIndex ?? 0) + 1}
          </p>
        )}
      </FormField>
    </div>
  );
}
