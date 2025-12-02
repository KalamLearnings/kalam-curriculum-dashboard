'use client';

/**
 * Tap Letter in Word Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { ArabicWordDisplay } from '../shared/ArabicWordDisplay';
import { getConfigValue, ARABIC_DEFAULTS } from '../shared/previewUtils';

export function TapLetterInWordPreview({ instruction, config }: PreviewProps) {
  const targetWord = getConfigValue(config, 'targetWord', ARABIC_DEFAULTS.targetWord);
  const targetLetter = getConfigValue(config, 'targetLetter', ARABIC_DEFAULTS.targetLetter);

  return (
    <PreviewContainer variant="centered">
      <ArabicWordDisplay
        word={targetWord}
        splitLetters={true}
        highlightLetter={targetLetter}
        size="xl"
        className="mb-8"
      />
    </PreviewContainer>
  );
}
