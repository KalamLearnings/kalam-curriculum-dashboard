/**
 * Build Word from Letters Activity Form
 *
 * Form for configuring the word building activity where students
 * drag scattered letters to build a target Arabic word.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, Checkbox, Select } from './FormField';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { WordSelector } from '../WordSelector';
import type { BuildWordFromLettersConfig, LetterDisplayMode } from '@/lib/types/activity-configs';

const LETTER_DISPLAY_MODE_OPTIONS: { value: LetterDisplayMode; label: string }[] = [
  { value: 'contextual', label: 'Contextual (letters show in word form)' },
  { value: 'isolated', label: 'Isolated (letters show in isolated form)' },
];

export function BuildWordFromLettersForm({
  config,
  onChange,
  instruction,
  onInstructionChange
}: BaseActivityFormProps<BuildWordFromLettersConfig>) {
  const useChildName = config?.useChildName || false;
  const targetWord = config?.targetWord || '';
  const letterDisplayMode = config?.letterDisplayMode || 'contextual';
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

  const handleUseChildNameChange = (checked: boolean) => {
    if (checked) {
      // Clear targetWord when using child's name
      updateConfig({ useChildName: true, targetWord: undefined });
    } else {
      updateConfig({ useChildName: false });
    }
  };

  return (
    <div className="space-y-4">

      {/* Use Child's Name Checkbox */}
      <FormField
        label="Word Source"
        hint="Choose whether to use the child's name or a custom word"
      >
        <Checkbox
          checked={useChildName}
          onChange={handleUseChildNameChange}
          label="Use child's name"
        />
      </FormField>

      {/* Letter Display Mode */}
      <FormField
        label="Letter Display Mode"
        hint="How scattered letters appear: contextual shows letters in their word form (e.g., بـ for initial), isolated shows the base letter form (e.g., ب)"
      >
        <Select
          value={letterDisplayMode}
          onChange={(value) => updateConfig({ letterDisplayMode: value as LetterDisplayMode })}
          options={LETTER_DISPLAY_MODE_OPTIONS}
        />
      </FormField>

      {/* Target Word - only show if not using child's name */}
      {!useChildName && (
        <>
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
        </>
      )}
    </div>
  );
}
