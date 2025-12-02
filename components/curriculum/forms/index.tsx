import { BaseActivityFormProps } from './ActivityFormProps';
import { IntroActivityForm } from './IntroActivityForm';
import { TapActivityForm } from './TapActivityForm';
import { WriteActivityForm } from './WriteActivityForm';
import { BuildWordFromLettersForm } from './BuildWordFromLettersForm';
import { BalloonActivityForm } from './BalloonActivityForm';
import { MultipleChoiceActivityForm } from './MultipleChoiceActivityForm';
import { DragDropActivityForm } from './DragDropActivityForm';
import { FishingActivityForm } from './FishingActivityForm';
import { PizzaActivityForm } from './PizzaActivityForm';
import { BreakActivityForm } from './BreakActivityForm';
import { DragDotsToLetterForm } from './DragDotsToLetterForm';
import { TapDotPositionForm } from './TapDotPositionForm';
import { LetterRainActivityForm } from './LetterRainActivityForm';
import { AudioLetterMatchActivityForm } from './AudioLetterMatchActivityForm';
import { MemoryCardMatchActivityForm } from './MemoryCardMatchActivityForm';
import { ColorLetterActivityForm } from './ColorLetterActivityForm';
import { LetterDiscriminationActivityForm } from './LetterDiscriminationActivityForm';
import { ActivityRequestForm } from './ActivityRequestForm';
import type { ArticleType } from '@/lib/schemas/curriculum';

// Map of activity types to their form components
export const activityFormComponents: Record<ArticleType, React.ComponentType<any>> = {
  show_letter_or_word: IntroActivityForm,
  tap_letter_in_word: TapActivityForm,
  trace_letter: WriteActivityForm,
  pop_balloons_with_letter: BalloonActivityForm,
  break_time_minigame: BreakActivityForm,
  build_word_from_letters: BuildWordFromLettersForm,
  multiple_choice_question: MultipleChoiceActivityForm,
  drag_items_to_target: DragDropActivityForm,
  catch_fish_with_letter: FishingActivityForm,
  add_pizza_toppings_with_letter: PizzaActivityForm,
  drag_dots_to_letter: DragDotsToLetterForm,
  tap_dot_position: TapDotPositionForm,
  letter_rain: LetterRainActivityForm,
  audio_letter_match: AudioLetterMatchActivityForm,
  memory_card_match: MemoryCardMatchActivityForm,
  color_letter: ColorLetterActivityForm,
  letter_discrimination: LetterDiscriminationActivityForm,
  activity_request: ActivityRequestForm,
};

// Generic fallback form for activity types without custom forms yet
function GenericActivityForm({ config, onChange }: BaseActivityFormProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Configuration (JSON)
      </label>
      <textarea
        value={JSON.stringify(config || {}, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch {
            // Invalid JSON, don't update
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        rows={8}
      />
      <p className="text-xs text-gray-500 mt-1">
        Activity-specific configuration as JSON (custom form coming soon)
      </p>
    </div>
  );
}

export function getActivityFormComponent(type: ArticleType) {
  const component = activityFormComponents[type];
  console.log('Getting form component for type:', type, 'Found:', !!component);
  return component || GenericActivityForm;
}
