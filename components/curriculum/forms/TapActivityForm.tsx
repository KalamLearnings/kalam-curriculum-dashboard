import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, NumberInput } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';

export function TapActivityForm({ config, onChange }: BaseActivityFormProps) {
  const targetWord = config?.targetWord || '';
  const targetLetter = config?.targetLetter || '';
  const targetCount = config?.targetCount || 1;
  const wordMeaning = config?.wordMeaning || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

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

      <FormField label="Target Letter" hint="The letter to find in the word" required>
        <TextInput
          value={targetLetter}
          onChange={(value) => updateConfig({ targetLetter: value })}
          placeholder="ك"
          dir="rtl"
        />
      </FormField>

      <FormField label="Target Count" hint="How many instances to find" required>
        <NumberInput
          value={targetCount}
          onChange={(value) => updateConfig({ targetCount: value })}
          min={1}
        />
      </FormField>
    </div>
  );
}
