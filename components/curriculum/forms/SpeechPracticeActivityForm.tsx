import React, { useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { LetterSelector, WordLetterPicker, extractLettersFromWord } from './shared';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { cn } from '@/lib/utils';
import type { LetterReference } from './ArabicLetterGrid';

export function SpeechPracticeActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const typedConfig = config as any;
  // contentType: 'letter' | 'word' | 'letter_in_word'
  // The form lets the author pick between Letter and Word as the top-level
  // mode. "letter_in_word" is derived: it's just "word" + a focus letter
  // selected from that word.
  const rawContentType = typedConfig?.contentType || 'letter';
  const contentType: 'letter' | 'word' = rawContentType === 'letter' ? 'letter' : 'word';

  // targetLetter is a LetterReference object (used for the standalone "Letter" mode)
  const targetLetter: LetterReference | null = typedConfig?.targetLetter || null;
  const word = typedConfig?.word || '';
  // Focus letter is a plain character string sourced from the word.
  // Stored under `letter` so the mobile app can consume it directly when
  // contentType === 'letter_in_word'.
  const focusLetter: string = typedConfig?.letter || '';
  const passingScore = typedConfig?.passingScore || 60;

  const updateConfig = (updates: Record<string, any>) => {
    onChange({ ...config, ...updates } as any);
  };

  // Switch top-level mode (Letter vs Word). Resets fields that don't apply
  // to the new mode so we never persist stale data into the saved config.
  const handleContentTypeChange = (next: 'letter' | 'word') => {
    if (next === 'letter') {
      updateConfig({
        contentType: 'letter',
        word: undefined,
        letter: undefined,
      });
    } else {
      updateConfig({
        contentType: 'word',
        targetLetter: undefined,
      });
    }
  };

  // Pick a focus letter from inside the word — promotes contentType to
  // 'letter_in_word' so mobile assesses the whole word with focus on this
  // specific letter.
  const handleFocusLetterChange = (letter: string) => {
    updateConfig({
      contentType: 'letter_in_word',
      letter,
    });
  };

  const handleClearFocusLetter = () => {
    updateConfig({
      contentType: 'word',
      letter: undefined,
    });
  };

  // If the word changes and the previously selected focus letter is no
  // longer present in the new word, drop it so the saved config stays
  // consistent with what the picker can actually display.
  useEffect(() => {
    if (!focusLetter) return;
    const lettersInWord = extractLettersFromWord(word);
    if (!lettersInWord.includes(focusLetter)) {
      updateConfig({
        contentType: 'word',
        letter: undefined,
      });
    }
    // We intentionally only run this when the word changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  return (
    <div className="space-y-4">
      {/* Content Type Selection */}
      <FormField label="Content Type" hint="What should the child pronounce?" required>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleContentTypeChange('letter')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'letter'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">أ</div>
            <div className="text-xs font-medium text-gray-600">Letter</div>
          </button>

          <button
            type="button"
            onClick={() => handleContentTypeChange('word')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'word'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">كلمة</div>
            <div className="text-xs font-medium text-gray-600">Word</div>
          </button>
        </div>
      </FormField>

      {/* Letter Selection */}
      {contentType === 'letter' && (
        <FormField label="Letter" hint="Select letter and form to pronounce" required>
          <LetterSelector
            value={targetLetter}
            onChange={(value) => updateConfig({ targetLetter: value })}
            topic={topic}
            showFormSelector={true}
          />
        </FormField>
      )}

      {/* Word Selection */}
      {contentType === 'word' && (
        <>
          <WordSelector
            value={word}
            onChange={(wordValue) => updateConfig({ word: wordValue })}
            label="Word"
            required
          />
          {word && (
            <ActivityWordStatus
              words={[{ arabic: word }]}
            />
          )}

          {/* Optional: focus on a specific letter from the chosen word.
              Buttons are sourced directly from the word so authors can only
              pick a letter that's actually present. */}
          <FormField
            label="Focus Letter (Optional)"
            hint="If set, the child should focus on pronouncing this specific letter within the word"
          >
            <WordLetterPicker
              word={word}
              value={focusLetter}
              onChange={handleFocusLetterChange}
              onClear={handleClearFocusLetter}
              emptyMessage="Enter a word first to see available letters"
            />
          </FormField>
        </>
      )}

      {/* Assessment Settings */}
      <FormField label="Passing Score" hint="Minimum score to pass (0-100)">
        <TextInput
          value={passingScore?.toString() || '60'}
          onChange={(value) => updateConfig({ passingScore: parseInt(value) || 60 })}
          placeholder="60"
          type="number"
        />
      </FormField>
    </div>
  );
}
