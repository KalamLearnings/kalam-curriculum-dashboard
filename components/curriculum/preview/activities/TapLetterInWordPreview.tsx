'use client';

/**
 * Tap Letter in Word Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { ArabicWordDisplay } from '../shared/ArabicWordDisplay';
import { getConfigValue, ARABIC_DEFAULTS } from '../shared/previewUtils';
import { useLetterResolver } from '@/lib/hooks/useLetterResolver';

export function TapLetterInWordPreview({ instruction, config }: PreviewProps) {
  const { resolveToChar } = useLetterResolver();
  const targetWord = getConfigValue(config, 'targetWord', ARABIC_DEFAULTS.targetWord);
  const rawTargetLetter = getConfigValue(config, 'targetLetter', null);
  const targetLetter = resolveToChar(rawTargetLetter, ARABIC_DEFAULTS.targetLetter) || ARABIC_DEFAULTS.targetLetter;

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
