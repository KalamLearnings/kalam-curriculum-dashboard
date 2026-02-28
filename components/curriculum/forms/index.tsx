import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { IntroActivityForm } from './IntroActivityForm';
import { TapActivityForm } from './TapActivityForm';
import { WriteActivityForm } from './WriteActivityForm';
import { BuildWordFromLettersForm } from './BuildWordFromLettersForm';
import { MultipleChoiceActivityForm } from './MultipleChoiceActivityForm';
import { DragDropActivityForm } from './DragDropActivityForm';
import { FishingActivityForm } from './FishingActivityForm';
import { PizzaActivityForm } from './PizzaActivityForm';
import { BreakActivityForm } from './BreakActivityForm';
import { DragDotsToLetterForm } from './DragDotsToLetterForm';
import { TapDotPositionForm } from './TapDotPositionForm';
import { MemoryCardMatchActivityForm } from './MemoryCardMatchActivityForm';
import { ColorLetterActivityForm } from './ColorLetterActivityForm';
import { ActivityRequestForm } from './ActivityRequestForm';
import { SpeechPracticeActivityForm } from './SpeechPracticeActivityForm';
import { ContentWithCardsActivityForm } from './ContentWithCardsActivityForm';
import { DragHamzaToLetterForm } from './DragHamzaToLetterForm';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';
import type { ArticleType } from '@/lib/schemas/curriculum';

// Config for activities that use TargetLetterWithDistractorsForm
interface TargetLetterActivityConfig {
  targetLetterHint: string;
  targetCountLabel?: string;
  targetCountHint?: string;
}

const targetLetterActivityConfigs: Partial<Record<ArticleType, TargetLetterActivityConfig>> = {
  pop_balloons_with_letter: {
    targetLetterHint: "The target letter to find on balloons",
    targetCountHint: "Number of balloons to pop",
  },
  letter_rain: {
    targetLetterHint: "The letter to catch",
    targetCountHint: "Number of letters to catch",
  },
  audio_letter_match: {
    targetLetterHint: "The letter matching the audio",
    targetCountHint: "Number of correct matches",
  },
  letter_discrimination: {
    targetLetterHint: "The correct letter to identify",
    targetCountHint: "Number of correct identifications",
  },
  grid_tap: {
    targetLetterHint: "The letter on cells to tap",
    targetCountHint: "Number of cells to tap",
  },
  pick_from_tree: {
    targetLetterHint: "The letter on fruits to pick",
    targetCountHint: "Number of fruits to pick",
  },
  pick_flowers: {
    targetLetterHint: "The letter on flowers to pick",
    targetCountHint: "Number of flowers to pick",
  },
  tap_crescent_moons: {
    targetLetterHint: "The letter on moons to tap",
    targetCountHint: "Number of moons to tap",
  },
  drag_to_animal_mouth: {
    targetLetterHint: "The letter on food items to drag",
    targetCountHint: "Number of items to feed",
  },
  feed_rabbit: {
    targetLetterHint: "The letter on carrots to drag",
    targetCountHint: "Number of carrots to feed",
  },
  feed_baby: {
    targetLetterHint: "The letter on bottles to drag",
    targetCountHint: "Number of bottles to feed",
  },
  piggy_bank: {
    targetLetterHint: "The letter on coins to collect",
    targetCountHint: "Number of coins to collect",
  },
  snowflakes: {
    targetLetterHint: "The letter on snowflakes to catch",
    targetCountHint: "Number of snowflakes to catch",
  },
  bear_honey: {
    targetLetterHint: "The letter on honey jars to drag",
    targetCountHint: "Number of honey jars to feed",
  },
  fly_on_flowers: {
    targetLetterHint: "The letter on flowers to land on",
    targetCountHint: "Number of flowers to land on",
  },
  deliver_envelope: {
    targetLetterHint: "The letter on houses to deliver to",
    targetCountHint: "Number of envelopes to deliver",
  },
  plant_seeds: {
    targetLetterHint: "The letter on seeds to plant",
    targetCountHint: "Number of seeds to plant",
  },
  balance_scale: {
    targetLetterHint: "The letter on items to balance",
    targetCountHint: "Number of items to balance",
  },
  ice_cream_stacking: {
    targetLetterHint: "The letter on scoops to stack",
    targetCountHint: "Number of scoops to stack",
  },
  slingshot: {
    targetLetterHint: "The letter on targets to hit",
    targetCountHint: "Number of targets to hit",
  },
};

// Factory function to create TargetLetterWithDistractorsForm with specific config
function createTargetLetterForm(activityType: ArticleType): React.ComponentType<BaseActivityFormProps> {
  const config = targetLetterActivityConfigs[activityType];
  if (!config) return GenericActivityForm;

  return function TargetLetterForm(props: BaseActivityFormProps) {
    return (
      <TargetLetterWithDistractorsForm
        {...props}
        targetLetterField="targetLetter"
        labels={{
          targetLetterLabel: "Target Letter",
          targetLetterHint: config.targetLetterHint,
          targetCountLabel: config.targetCountLabel,
          targetCountHint: config.targetCountHint,
        }}
      />
    );
  };
}

// Map of activity types to their form components
export const activityFormComponents: Record<ArticleType, React.ComponentType<any>> = {
  // Custom forms (unique UI)
  show_letter_or_word: IntroActivityForm,
  tap_letter_in_word: TapActivityForm,
  trace_letter: WriteActivityForm,
  break_time_minigame: BreakActivityForm,
  build_word_from_letters: BuildWordFromLettersForm,
  multiple_choice_question: MultipleChoiceActivityForm,
  drag_items_to_target: DragDropActivityForm,
  catch_fish_with_letter: FishingActivityForm,
  add_pizza_toppings_with_letter: PizzaActivityForm,
  drag_dots_to_letter: DragDotsToLetterForm,
  tap_dot_position: TapDotPositionForm,
  memory_card_match: MemoryCardMatchActivityForm,
  color_letter: ColorLetterActivityForm,
  activity_request: ActivityRequestForm,
  speech_practice: SpeechPracticeActivityForm,
  content_with_cards: ContentWithCardsActivityForm,
  drag_hamza_to_letter: DragHamzaToLetterForm,

  // Target letter + distractor activities (using shared form)
  pop_balloons_with_letter: createTargetLetterForm('pop_balloons_with_letter'),
  letter_rain: createTargetLetterForm('letter_rain'),
  audio_letter_match: createTargetLetterForm('audio_letter_match'),
  letter_discrimination: createTargetLetterForm('letter_discrimination'),
  grid_tap: createTargetLetterForm('grid_tap'),
  pick_from_tree: createTargetLetterForm('pick_from_tree'),
  pick_flowers: createTargetLetterForm('pick_flowers'),
  tap_crescent_moons: createTargetLetterForm('tap_crescent_moons'),
  drag_to_animal_mouth: createTargetLetterForm('drag_to_animal_mouth'),
  feed_rabbit: createTargetLetterForm('feed_rabbit'),
  feed_baby: createTargetLetterForm('feed_baby'),
  piggy_bank: createTargetLetterForm('piggy_bank'),
  snowflakes: createTargetLetterForm('snowflakes'),
  bear_honey: createTargetLetterForm('bear_honey'),
  fly_on_flowers: createTargetLetterForm('fly_on_flowers'),
  deliver_envelope: createTargetLetterForm('deliver_envelope'),
  plant_seeds: createTargetLetterForm('plant_seeds'),
  balance_scale: createTargetLetterForm('balance_scale'),
  ice_cream_stacking: createTargetLetterForm('ice_cream_stacking'),
  slingshot: createTargetLetterForm('slingshot'),
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
