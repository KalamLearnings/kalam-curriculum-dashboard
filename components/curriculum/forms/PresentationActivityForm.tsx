import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { LetterSelector } from './shared/LetterSelector';
import { cn } from '@/lib/utils';

export function PresentationActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const contentType = config?.contentType || 'letter'; // 'letter' or 'word'
  const letter = config?.letter || '';
  const word = config?.word || '';
  const autoAdvance = config?.autoAdvance ?? false;

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">

      <FormField label="Content Type" hint="Show a letter or word" required>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateConfig({ contentType: 'letter', word: '' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'letter'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">أ</div>
            <div className="text-xs font-medium text-gray-600">Single Letter</div>
          </button>

          <button
            type="button"
            onClick={() => updateConfig({ contentType: 'word', letter: '' })}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              contentType === 'word'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            <div className="text-3xl font-arabic">كلمة</div>
            <div className="text-xs font-medium text-gray-600">Single Word</div>
          </button>
        </div>
      </FormField>

      {contentType === 'letter' ? (
        <FormField label="Letter" hint="Letter from current topic" required>
          <LetterSelector
            value={letter}
            onChange={(value) => updateConfig({ letter: value })}
            topic={topic}
            label="Letter"
            hint="Letter from current topic"
          />
        </FormField>
      ) : (
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

      <FormField label="Auto Advance" hint="Automatically move to next activity">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => updateConfig({ autoAdvance: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">
            Auto-advance after showing content
          </label>
        </div>
      </FormField>
    </div>
  );
}
