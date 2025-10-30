/**
 * Activity Preview Router
 *
 * Routes to the appropriate preview component based on activity type
 */

'use client';

import type { ArticleType } from '@/lib/schemas/curriculum';
import type { PreviewProps } from './PreviewProps';
import { ShowLetterOrWordPreview } from './activities/ShowLetterOrWordPreview';
import { TapLetterInWordPreview } from './activities/TapLetterInWordPreview';
import { TraceLetterPreview } from './activities/TraceLetterPreview';
import { PopBalloonsPreview } from './activities/PopBalloonsPreview';
import { BreakTimePreview } from './activities/BreakTimePreview';
import { BuildWordFromLettersPreview } from './activities/BuildWordFromLettersPreview';
import { MultipleChoicePreview } from './activities/MultipleChoicePreview';
import { CatchFishPreview } from './activities/CatchFishPreview';
import { PlaceholderPreview } from './activities/PlaceholderPreview';

interface ActivityPreviewProps {
  type: ArticleType;
  instruction: { en: string; ar: string };
  config: Record<string, any>;
}

export function ActivityPreview({ type, instruction, config }: ActivityPreviewProps) {
  const previewProps: PreviewProps = { instruction, config };

  // Route to appropriate preview based on activity type
  switch (type) {
    case 'show_letter_or_word':
      return <ShowLetterOrWordPreview {...previewProps} />;
    case 'tap_letter_in_word':
      return <TapLetterInWordPreview {...previewProps} />;
    case 'trace_letter':
      return <TraceLetterPreview {...previewProps} />;
    case 'pop_balloons_with_letter':
      return <PopBalloonsPreview {...previewProps} />;
    case 'break_time_minigame':
      return <BreakTimePreview {...previewProps} />;
    case 'build_word_from_letters':
      return <BuildWordFromLettersPreview {...previewProps} />;
    case 'multiple_choice_question':
      return <MultipleChoicePreview {...previewProps} />;
    case 'catch_fish_with_letter':
      return <CatchFishPreview {...previewProps} />;
    default:
      return <PlaceholderPreview type={type} />;
  }
}
