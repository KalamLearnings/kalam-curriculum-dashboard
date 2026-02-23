import React from 'react';
import { cn } from '@/lib/utils';
import { useLetters } from '@/lib/hooks/useLetters';

export type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';

interface LetterFormSelectorProps {
  value: LetterForm;
  onChange: (value: LetterForm) => void;
  targetLetter?: string;
}

const formLabels: Record<LetterForm, string> = {
  isolated: 'Isolated',
  initial: 'Initial',
  medial: 'Medial',
  final: 'Final',
};

export function LetterFormSelector({ value, onChange, targetLetter }: LetterFormSelectorProps) {
  const { letters } = useLetters();
  const forms: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];

  // Find the letter object to get all its forms
  const letterData = letters.find(l => l.letter === targetLetter);

  return (
    <div className="grid grid-cols-4 gap-2">
      {forms.map((form) => {
        const isSelected = value === form;
        // Get the actual form character if we have letter data, otherwise show placeholder
        const formCharacter = letterData?.forms?.[form] || targetLetter || '—';

        return (
          <button
            key={form}
            type="button"
            onClick={() => onChange(form)}
            className={cn(
              'px-4 py-3 rounded-lg border-2 transition-all',
              'flex flex-col items-center justify-center',
              'hover:border-blue-400 hover:bg-blue-50',
              isSelected
                ? 'border-blue-600 bg-blue-100 ring-2 ring-blue-600 ring-offset-2'
                : 'border-gray-300 bg-white'
            )}
          >
            <div className="text-2xl font-arabic mb-1">{formCharacter}</div>
            <div className="text-xs text-gray-600">{formLabels[form]}</div>
          </button>
        );
      })}
    </div>
  );
}
