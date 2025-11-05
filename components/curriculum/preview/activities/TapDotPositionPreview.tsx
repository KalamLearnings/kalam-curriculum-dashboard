'use client';

/**
 * Tap Dot Position Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';

export function TapDotPositionPreview({ instruction, config }: PreviewProps) {
  const targetLetter = config.targetLetter || 'ج';
  const position = config.position || 'isolated';
  const distractorPositions = (config.distractorPositions || []) as string[];

  // Map of letters to their base forms and dot counts/positions
  const letterInfo: Record<string, { base: string; dotCount: number; correctPositions: string[] }> = {
    'ب': { base: 'ٮ', dotCount: 1, correctPositions: ['bottom'] },
    'ت': { base: 'ٮ', dotCount: 2, correctPositions: ['top-left', 'top-right'] },
    'ث': { base: 'ٮ', dotCount: 3, correctPositions: ['top-left', 'top-center', 'top-right'] },
    'ج': { base: 'ح', dotCount: 1, correctPositions: ['middle'] },
    'خ': { base: 'ح', dotCount: 1, correctPositions: ['top'] },
    'ذ': { base: 'د', dotCount: 1, correctPositions: ['top'] },
    'ز': { base: 'ر', dotCount: 1, correctPositions: ['top'] },
    'ش': { base: 'س', dotCount: 3, correctPositions: ['top-left', 'top-center', 'top-right'] },
    'ض': { base: 'ص', dotCount: 1, correctPositions: ['top'] },
    'ظ': { base: 'ط', dotCount: 1, correctPositions: ['top'] },
    'غ': { base: 'ع', dotCount: 1, correctPositions: ['top'] },
    'ف': { base: 'ڡ', dotCount: 1, correctPositions: ['top'] },
    'ق': { base: 'ڡ', dotCount: 2, correctPositions: ['top-left', 'top-right'] },
    'ن': { base: 'ں', dotCount: 1, correctPositions: ['top'] },
    'ي': { base: 'ى', dotCount: 2, correctPositions: ['bottom-left', 'bottom-right'] },
  };

  const info = letterInfo[targetLetter] || { base: targetLetter, dotCount: 1, correctPositions: ['middle'] };
  const baseLetter = info.base;

  // Map position names to CSS positioning
  const positionStyles: Record<string, string> = {
    'top': 'top-1/4 left-1/2 -translate-x-1/2',
    'bottom': 'bottom-1/4 left-1/2 -translate-x-1/2',
    'middle': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'left': 'top-1/2 left-1/4 -translate-y-1/2',
    'right': 'top-1/2 right-1/4 -translate-y-1/2',
    'top-left': 'top-1/4 left-1/4',
    'top-right': 'top-1/4 right-1/4',
    'bottom-left': 'bottom-1/4 left-1/4',
    'bottom-right': 'bottom-1/4 right-1/4',
  };

  // Get all dot positions (correct + distractors)
  const allDotPositions = [...info.correctPositions, ...distractorPositions];

  return (
    <PreviewContainer variant="centered">
      <div className="flex flex-col items-center gap-8">
        {/* Letter with dots */}
        <div className="relative">
          <div className="text-9xl font-arabic text-gray-300" dir="rtl">
            {baseLetter}
          </div>

          {/* Visual representation of all dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {allDotPositions.map((position, index) => {
                const isCorrect = info.correctPositions.includes(position);
                return (
                  <div
                    key={`${position}-${index}`}
                    className={`absolute w-8 h-8 rounded-full shadow-md ${positionStyles[position]} ${
                      isCorrect ? 'bg-blue-500 opacity-80' : 'bg-gray-400 opacity-70'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PreviewContainer>
  );
}
