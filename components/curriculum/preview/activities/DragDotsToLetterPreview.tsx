'use client';

/**
 * Drag Dots to Letter Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { useLetterResolver } from '@/lib/hooks/useLetterResolver';

export function DragDotsToLetterPreview({ instruction, config }: PreviewProps) {
  const { resolveToChar } = useLetterResolver();

  // Resolve targetLetter to a character string (handles both LetterReference and string)
  const targetLetter = resolveToChar(config.targetLetter);
  const position = config.position || 'isolated';
  const distractorDotsCount = config.distractorDotsCount ?? 0;

  // Map of letters to their base forms and dot counts
  const letterInfo: Record<string, { base: string; dotCount: number }> = {
    'ب': { base: 'ٮ', dotCount: 1 },
    'ت': { base: 'ٮ', dotCount: 2 },
    'ث': { base: 'ٮ', dotCount: 3 },
    'ج': { base: 'ح', dotCount: 1 },
    'خ': { base: 'ح', dotCount: 1 },
    'ذ': { base: 'د', dotCount: 1 },
    'ز': { base: 'ر', dotCount: 1 },
    'ش': { base: 'س', dotCount: 3 },
    'ض': { base: 'ص', dotCount: 1 },
    'ظ': { base: 'ط', dotCount: 1 },
    'غ': { base: 'ع', dotCount: 1 },
    'ف': { base: 'ڡ', dotCount: 1 },
    'ق': { base: 'ڡ', dotCount: 2 },
    'ن': { base: 'ں', dotCount: 1 },
    'ي': { base: 'ى', dotCount: 2 },
  };

  const info = targetLetter ? letterInfo[targetLetter] : null;
  const baseLetter = info?.base || '—';
  const correctDotsCount = info?.dotCount || 0;
  const totalDots = correctDotsCount + distractorDotsCount;

  return (
    <PreviewContainer variant="centered">
      <div className="flex flex-col items-center gap-8">
        {/* Dots pool at top */}
        <div className="flex gap-3 items-center">
          {Array.from({ length: totalDots }).map((_, index) => {
            const isDistractor = index >= correctDotsCount;
            return (
              <div
                key={index}
                className={`w-10 h-10 rounded-full shadow-md ${
                  isDistractor
                    ? 'bg-gray-400 opacity-70'
                    : 'bg-red-500 opacity-80 animate-pulse'
                }`}
              />
            );
          })}
        </div>

        {/* Show base letter without dots */}
        <div className="text-9xl font-arabic text-gray-300" dir="rtl">
          {baseLetter}
        </div>
      </div>
    </PreviewContainer>
  );
}
