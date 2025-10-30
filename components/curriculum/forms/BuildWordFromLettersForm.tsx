/**
 * Build Word from Letters Activity Form
 *
 * Form for configuring the word building activity where students
 * drag scattered letters to build a target Arabic word.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { WordSelector } from '../WordSelector';
import type { BuildWordFromLettersConfig } from '@/lib/types/activity-configs';

export function BuildWordFromLettersForm({
  config,
  onChange,
  instruction,
  onInstructionChange
}: BaseActivityFormProps<BuildWordFromLettersConfig>) {
  const targetWord = config?.targetWord || '';
  const wordMeaningEn = config?.wordMeaning?.en || '';
  const wordMeaningAr = config?.wordMeaning?.ar || '';

  const updateConfig = (updates: Partial<BuildWordFromLettersConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateWordMeaning = (lang: 'en' | 'ar', value: string) => {
    updateConfig({
      wordMeaning: {
        en: lang === 'en' ? value : wordMeaningEn,
        ar: lang === 'ar' ? value : wordMeaningAr,
      },
    });
  };

  return (
    <div className="space-y-4">

      {/* Target Word */}
      <WordSelector
        value={targetWord}
        onChange={(word) => updateConfig({ targetWord: word })}
        label="Target Word"
        required
        showTranslation
        translationValue={wordMeaningEn}
        onTranslationChange={(translation) => updateWordMeaning('en', translation)}
      />

      {/* Word Meaning (Arabic) */}
      <FormField
        label="Word Meaning (Arabic)"
        hint="Arabic translation or meaning (optional)"
      >
        <TextInput
          value={wordMeaningAr}
          onChange={(value) => updateWordMeaning('ar', value)}
          placeholder="باب"
          dir="rtl"
        />
      </FormField>

      {/* Word Asset Status */}
      {targetWord && (
        <ActivityWordStatus
          words={[{
            arabic: targetWord,
            transliteration: wordMeaningEn || undefined,
            english: wordMeaningEn || undefined,
          }]}
        />
      )}
    </div>
  );
}
