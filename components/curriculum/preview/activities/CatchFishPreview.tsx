'use client';

/**
 * Catch Fish with Letter Activity Preview
 */

import type { PreviewProps } from '../PreviewProps';
import { PreviewContainer } from '../shared/PreviewContainer';
import { InstructionDisplay } from '../shared/InstructionDisplay';
import { getConfigValue, ARABIC_DEFAULTS } from '../shared/previewUtils';
import { useLetterResolver } from '@/lib/hooks/useLetterResolver';

interface FishProps {
  letter: string;
  isTarget: boolean;
  animationDelay: number;
  yPosition: number;
}

function Fish({ letter, isTarget, animationDelay, yPosition }: FishProps) {
  return (
    <div
      className="absolute"
      style={{
        top: `${yPosition}%`,
        animation: `swim 4s ease-in-out infinite`,
        animationDelay: `${animationDelay}s`,
      }}
    >
      <div className="relative">
        {/* Fish body */}
        <div
          className={`
            w-20 h-12 rounded-full relative
            ${isTarget ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'}
          `}
        >
          {/* Tail */}
          <div
            className={`
              absolute -left-4 top-1/2 -translate-y-1/2
              w-0 h-0 border-t-8 border-b-8 border-transparent
              ${isTarget ? 'border-r-8 border-r-orange-500' : 'border-r-8 border-r-blue-600'}
            `}
          />

          {/* Eye */}
          <div className="absolute right-3 top-3 w-2 h-2 bg-white rounded-full">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-black rounded-full" />
          </div>

          {/* Letter on fish body */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-arabic font-bold text-white drop-shadow-md" dir="rtl">
              {letter}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CatchFishPreview({ instruction, config }: PreviewProps) {
  const { resolveToChar, resolveArrayToChars, loading } = useLetterResolver();

  // Resolve target letter - could be LetterReference or string
  const rawTargetLetter = getConfigValue(config, 'targetLetter', null);
  const targetLetter = resolveToChar(rawTargetLetter, ARABIC_DEFAULTS.targetLetter) || ARABIC_DEFAULTS.targetLetter;

  // Resolve distractor letters - could be LetterReference[] or string[]
  const rawDistractorLetters = getConfigValue(config, 'distractorLetters', []);
  const defaultDistractors = ['ا', 'م', 'ت', 'ن'];
  const distractorLetters = rawDistractorLetters.length > 0
    ? resolveArrayToChars(rawDistractorLetters)
    : defaultDistractors;

  // Use default distractors if resolution yielded empty array
  const effectiveDistractors = distractorLetters.length > 0 ? distractorLetters : defaultDistractors;

  // Generate fish data - show 6 fish in preview (2 correct, 4 distractors)
  const previewFishCount = 6;
  const previewCorrectCount = 2;

  const fishData = Array.from({ length: previewFishCount }).map((_, i) => ({
    letter: i < previewCorrectCount ? targetLetter : effectiveDistractors[i % effectiveDistractors.length],
    isTarget: i < previewCorrectCount,
    animationDelay: i * 0.5,
    yPosition: 20 + (i * 12) % 60,
  }));

  return (
    <PreviewContainer>
      <InstructionDisplay instruction={instruction} className="mb-4" />

      {/* Pond background */}
      <div className="flex-1 relative bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 rounded-lg overflow-hidden">
        {/* Water effect waves */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30" />
          <div
            className="absolute w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 50px,
                rgba(255, 255, 255, 0.1) 50px,
                rgba(255, 255, 255, 0.1) 100px
              )`,
              animation: 'wave 3s linear infinite',
            }}
          />
        </div>

        {/* Fish */}
        <div className="relative h-full">
          {fishData.map((fish, i) => (
            <Fish
              key={i}
              letter={fish.letter}
              isTarget={fish.isTarget}
              animationDelay={fish.animationDelay}
              yPosition={fish.yPosition}
            />
          ))}
        </div>

        {/* Bottom seaweed decoration */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-2 bg-green-600 rounded-t-full opacity-40"
              style={{
                height: `${30 + (i % 3) * 10}px`,
                animation: `sway 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes swim {
          0% {
            left: -100px;
          }
          100% {
            left: calc(100% + 100px);
          }
        }

        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100px);
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
      `}</style>
    </PreviewContainer>
  );
}
