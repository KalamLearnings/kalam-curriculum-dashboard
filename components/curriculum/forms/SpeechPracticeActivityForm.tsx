import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { LetterSelector } from './shared/LetterSelector';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { cn } from '@/lib/utils';
import type { LetterReference } from './ArabicLetterGrid';

export function SpeechPracticeActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  // Note: config type from @kalam/curriculum-schemas still expects old format
  // We're migrating to LetterReference format
  const typedConfig = config as any;
  const contentType = typedConfig?.contentType || 'letter';
  // letter is now a LetterReference object
  const letter: LetterReference | null = typedConfig?.letter || null;
  const word = typedConfig?.word || '';
  const maxAttempts = typedConfig?.maxAttempts || 3;
  const passingScore = typedConfig?.passingScore || 60;

  const updateConfig = (updates: Record<string, any>) => {
    onChange({ ...config, ...updates } as any);
  };

  return (
    <div className="space-y-4">
      {/* Content Type Selection */}
      <FormField label="Content Type" hint="What should the child pronounce?" required>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ contentType: 'letter' })}
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
            onClick={() => updateConfig({ contentType: 'word' })}
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
            value={letter}
            onChange={(value) => updateConfig({ letter: value })}
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
        </>
      )}

      {/* Assessment Settings */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Max Attempts" hint="How many tries allowed (1-10)">
          <TextInput
            value={maxAttempts?.toString() || '3'}
            onChange={(value) => updateConfig({ maxAttempts: parseInt(value) || 3 })}
            placeholder="3"
            type="number"
          />
        </FormField>

        <FormField label="Passing Score" hint="Minimum score to pass (0-100)">
          <TextInput
            value={passingScore?.toString() || '60'}
            onChange={(value) => updateConfig({ passingScore: parseInt(value) || 60 })}
            placeholder="60"
            type="number"
          />
        </FormField>
      </div>
    </div>
  );
}
