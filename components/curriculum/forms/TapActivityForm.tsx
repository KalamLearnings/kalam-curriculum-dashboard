import React, { useMemo, useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { useLetterResolver } from '@/lib/hooks/useLetterResolver';
import { WordLetterPicker, extractLettersFromWord } from './shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type HarakaType = 'fatha' | 'damma' | 'kasra' | 'sukoon' | 'shadda';

const HARAKA_OPTIONS: { value: HarakaType; label: string; arabic: string }[] = [
  { value: 'fatha', label: 'Fatha', arabic: 'فَتْحَة' },
  { value: 'damma', label: 'Damma', arabic: 'ضَمَّة' },
  { value: 'kasra', label: 'Kasra', arabic: 'كَسْرَة' },
  { value: 'sukoon', label: 'Sukoon', arabic: 'سُكُون' },
  { value: 'shadda', label: 'Shadda', arabic: 'شَدَّة' },
];

export function TapActivityForm({ config, onChange }: BaseActivityFormProps) {
  const { resolveToChar } = useLetterResolver();

  const targetWord = config?.targetWord || '';
  // Resolve targetLetter - could be LetterReference or string from saved config
  const targetLetter = resolveToChar(config?.targetLetter) || '';
  const targetCount = config?.targetCount || 1;
  const wordMeaning = config?.wordMeaning || '';
  const targetHaraka = config?.targetHaraka as HarakaType | undefined;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Letters available to pick from (sourced from the target word).
  const letters = useMemo(() => extractLettersFromWord(targetWord), [targetWord]);

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

    if (initialLoadComplete && targetLetter && letters.length > 0 && !letters.includes(targetLetter)) {
      updateConfig({ targetLetter: '' });
    }
  }, [letters, targetLetter, initialLoadComplete, targetWord]);

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
          value={targetLetter}
          onChange={(letter) => updateConfig({ targetLetter: letter })}
          emptyMessage="Enter a target word first to see available letters"
        />
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

      <FormField
        label="Target Diacritic (Haraka)"
        hint="Optional: require a specific diacritic on the letter"
      >
        <Select
          value={targetHaraka || ''}
          onValueChange={(value) => updateConfig({ targetHaraka: value || undefined })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any diacritic (default)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any diacritic (default)</SelectItem>
            {HARAKA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <span className="font-arabic">{option.arabic}</span>
                  <span className="text-muted-foreground">({option.label})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {targetHaraka && (
          <p className="text-xs text-amber-600 mt-1">
            Only taps on "{targetLetter}" with {targetHaraka} will count as correct
          </p>
        )}
      </FormField>
    </div>
  );
}
