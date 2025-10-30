'use client';

/**
 * Pop Balloons with Letter Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { InstructionDisplay } from '../shared/InstructionDisplay';
import { LetterBalloon } from '../shared/LetterComponents';
import { getConfigValue, ARABIC_DEFAULTS } from '../shared/previewUtils';

const BALLOON_COLORS = ['#FF6B9D', '#FEC84B', '#60D394', '#5F9FFF'];

export function PopBalloonsPreview({ instruction, config }: PreviewProps) {
  const balloonCount = getConfigValue(config, 'balloonCount', 3);
  const targetLetter = getConfigValue(config, 'targetLetter', ARABIC_DEFAULTS.targetLetter);

  return (
    <PreviewContainer>
      <InstructionDisplay instruction={instruction} className="mb-6" />

      <div className="flex-1 relative flex items-center justify-around">
        {Array.from({ length: balloonCount }).map((_, i) => (
          <LetterBalloon
            key={i}
            letter={i === 0 ? targetLetter : 'ا'}
            color={BALLOON_COLORS[i % BALLOON_COLORS.length]}
            animationDelay={i}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </PreviewContainer>
  );
}
