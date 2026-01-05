import React, { useState, useEffect } from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, TextInput } from './FormField';
import { WordSelector } from '../WordSelector';
import { ActivityWordStatus } from '@/components/words/ActivityWordStatus';
import { LetterSelectorModal } from '../LetterSelectorModal';
import type { Letter } from '@/lib/hooks/useLetters';
import { cn } from '@/lib/utils';

export function SpeechPracticeActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  const contentType = config?.contentType || 'letter';
  const letter = config?.letter || '';
  const word = config?.word || '';
  const maxAttempts = config?.maxAttempts || 3;
  const passingScore = config?.passingScore || 60;

  const [showLetterSelector, setShowLetterSelector] = useState(false);

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  // Auto-populate letter from topic when component mounts or topic changes
  useEffect(() => {
    if (topic?.letter && contentType === 'letter') {
      const topicLetter = topic.letter.letter;
      if (topicLetter && !letter) {
        updateConfig({ letter: topicLetter });
      }
    }
  }, [topic, contentType, letter]);

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
        <FormField label="Letter" hint="Letter from current topic" required>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg flex-1">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg shadow-sm border border-blue-100">
                <span className="text-4xl font-arabic text-blue-900">
                  {letter || '—'}
                </span>
              </div>
              <div className="flex-1">
                {topic?.letter ? (
                  <>
                    <div className="text-sm font-medium text-gray-900">
                      {topic.letter.name_english}
                    </div>
                    <div className="text-xs text-gray-600">
                      Topic Letter
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    {letter ? 'Custom Letter' : 'No letter selected'}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLetterSelector(true)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 bg-white border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Change
            </button>
          </div>
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

      {/* Letter Selector Modal */}
      <LetterSelectorModal
        isOpen={showLetterSelector}
        onClose={() => setShowLetterSelector(false)}
        onSelect={(selectedLetter: Letter) => {
          updateConfig({ letter: selectedLetter.letter });
        }}
        selectedLetter={letter}
      />
    </div>
  );
}
