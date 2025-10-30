import React from 'react';
import { cn } from '@/lib/utils';

type LetterPosition = 'standalone' | 'beginning' | 'middle' | 'end';

interface PositionSelectorProps {
  value: LetterPosition;
  onChange: (value: LetterPosition) => void;
  targetLetter?: string;
}

const positionExamples: Record<LetterPosition, { label: string; example: string; highlightIndex: number }> = {
  standalone: {
    label: 'Standalone',
    example: 'أ',
    highlightIndex: 0,
  },
  beginning: {
    label: 'Beginning',
    example: 'أَسَد',
    highlightIndex: 0,
  },
  middle: {
    label: 'Middle',
    example: 'كَلَام',
    highlightIndex: 2,
  },
  end: {
    label: 'End',
    example: 'كِتَاب',
    highlightIndex: 5,
  },
};

export function PositionSelector({ value, onChange, targetLetter }: PositionSelectorProps) {
  const positions: LetterPosition[] = ['standalone', 'beginning', 'middle', 'end'];

  return (
    <div className="grid grid-cols-4 gap-3">
      {positions.map((position) => {
        const { label, example, highlightIndex } = positionExamples[position];
        const isSelected = value === position;
        const exampleChars = example.split('');

        return (
          <button
            key={position}
            type="button"
            onClick={() => onChange(position)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            )}
          >
            {/* Arabic Example */}
            <div className="text-2xl font-arabic" dir="rtl">
              {exampleChars.map((char, idx) => (
                <span
                  key={idx}
                  className={cn(
                    idx === highlightIndex ? 'text-blue-600 font-bold' : 'text-gray-700'
                  )}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* Label */}
            <div className="text-xs font-medium text-gray-600">
              {label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
