/**
 * Build Word from Letters Activity Form
 *
 * Form for configuring the word building activity where students
 * drag scattered letters to build a target Arabic word.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput, Checkbox } from './FormField';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { WordSelector } from '../WordSelector';
import { cn } from '@/lib/utils';
import type { BuildWordFromLettersConfig, LetterDisplayMode } from '@/lib/types/activity-configs';

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
        hint="How the scattered letters appear for the child to drag"
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ letterDisplayMode: 'contextual' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              letterDisplayMode === 'contextual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-2xl font-arabic flex gap-1">
              <span>بـ</span>
              <span>ـا</span>
              <span>ـب</span>
            </div>
            <div className="text-xs font-medium text-gray-600">Contextual</div>
            <div className="text-xs text-gray-400 text-center">Letters in word form</div>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ letterDisplayMode: 'isolated' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              letterDisplayMode === 'isolated'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-2xl font-arabic flex gap-1">
              <span>ب</span>
              <span>ا</span>
              <span>ب</span>
            </div>
            <div className="text-xs font-medium text-gray-600">Isolated</div>
            <div className="text-xs text-gray-400 text-center">Letters in base form</div>
          </button>
        </div>
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
