import React, { useMemo, useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { useLetterResolver } from '@/lib/hooks/useLetterResolver';
import { cn } from '@/lib/utils';

export function TapActivityForm({ config, onChange }: BaseActivityFormProps) {
  const { resolveToChar } = useLetterResolver();

  // Debug: log what config is received
  console.log('TapActivityForm config:', JSON.stringify(config, null, 2));

  const targetWord = config?.targetWord || '';
  // Resolve targetLetter - could be LetterReference or string from saved config
  const targetLetter = resolveToChar(config?.targetLetter) || '';
  const targetCount = config?.targetCount || 1;
  const wordMeaning = config?.wordMeaning || '';

  // Debug: log extracted values
  console.log('TapActivityForm values:', { targetWord, targetLetter, targetCount, wordMeaning });

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Extract unique letters from the target word
  const uniqueLetters = useMemo(() => {
    if (!targetWord) return [];
    // Split word into characters and get unique ones, preserving order
    const chars = targetWord.split('');
    const seen = new Set<string>();
    return chars.filter(char => {
      // Skip non-letter characters (spaces, diacritics, etc.)
      if (char.trim() === '' || /[\u064B-\u065F]/.test(char)) return false;
      if (seen.has(char)) return false;
      seen.add(char);
      return true;
    });
  }, [targetWord]);

  // Count occurrences of the selected letter in the word
  const letterOccurrences = useMemo(() => {
    if (!targetWord || !targetLetter) return 0;
    return targetWord.split('').filter(char => char === targetLetter).length;
  }, [targetWord, targetLetter]);

  // Auto-update targetCount when letter changes to match occurrences
  // Only update if the user has selected a letter and the count doesn't match
  useEffect(() => {
    if (targetLetter && letterOccurrences > 0 && targetCount !== letterOccurrences) {
      updateConfig({ targetCount: letterOccurrences });
    }
  }, [targetLetter, letterOccurrences]);

  // Clear targetLetter only if user changes the word and the previously selected letter is no longer valid
  // Don't clear on initial mount - only when uniqueLetters actually changes after being set
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  useEffect(() => {
    if (!initialLoadComplete && targetWord) {
      // Mark initial load as complete once we have a word
      setInitialLoadComplete(true);
      return;
    }

    if (initialLoadComplete && targetLetter && uniqueLetters.length > 0 && !uniqueLetters.includes(targetLetter)) {
      updateConfig({ targetLetter: '' });
    }
  }, [uniqueLetters, targetLetter, initialLoadComplete, targetWord]);

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
        {uniqueLetters.length > 0 ? (
          <div className="grid grid-cols-6 gap-2">
            {[...uniqueLetters].reverse().map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => updateConfig({ targetLetter: letter })}
                className={cn(
                  'aspect-square flex items-center justify-center text-4xl font-arabic rounded-lg border-2 transition-all hover:scale-105',
                  targetLetter === letter
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                )}
              >
                {letter}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
            Enter a target word first to see available letters
          </div>
        )}
      </FormField>

      <FormField label="Target Count" hint="How many instances to find (auto-calculated from word)" required>
        <NumberInput
          value={targetCount}
          onChange={(value) => updateConfig({ targetCount: value })}
          min={1}
        />
        {targetLetter && letterOccurrences > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            The letter "{targetLetter}" appears {letterOccurrences} time{letterOccurrences > 1 ? 's' : ''} in the word
          </p>
        )}
      </FormField>
    </div>
  );
}
