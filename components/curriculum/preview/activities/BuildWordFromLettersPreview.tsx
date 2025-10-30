'use client';

/**
 * Build Word from Letters Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { InstructionDisplay } from '../shared/InstructionDisplay';
import { ArabicWordDisplay } from '../shared/ArabicWordDisplay';
import { getConfigValue, ARABIC_DEFAULTS, reverseArray } from '../shared/previewUtils';

export function BuildWordFromLettersPreview({ instruction, config }: PreviewProps) {
  const targetWord = getConfigValue(config, 'targetWord', ARABIC_DEFAULTS.targetWord);
  const letters = targetWord.split('');
  const shuffledLetters = reverseArray(letters);

  return (
    <PreviewContainer variant="centered">
      <InstructionDisplay instruction={instruction} className="mb-8" />

      {/* Connected word form */}
      <ArabicWordDisplay word={targetWord} size="xl" className="mb-8" />

      {/* Separated letters for dragging */}
      <div className="flex gap-4 justify-center" dir="rtl">
        {shuffledLetters.map((letter, index) => (
          <span key={index} className="text-5xl text-gray-600">
            {letter}
          </span>
        ))}
      </div>
    </PreviewContainer>
  );
}
