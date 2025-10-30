/**
 * Activity schemas - centralized exports
 *
 * This file exports all activity schemas and creates a discriminated union
 * for type-safe activity handling.
 */

import { z } from 'zod';

// Export all individual activity schemas and types
export * from './show_letter_or_word';
export * from './tap_letter_in_word';
export * from './trace_letter';
export * from './pop_balloons_with_letter';
export * from './break_time_minigame';
export * from './build_word_from_letters';
export * from './multiple_choice_question';
export * from './drag_items_to_target';
export * from './catch_fish_with_letter';
export * from './add_pizza_toppings_with_letter';

// Import schemas for discriminated union
import { ShowLetterOrWordActivitySchema } from './show_letter_or_word';
import { TapLetterInWordActivitySchema } from './tap_letter_in_word';
import { TraceLetterActivitySchema } from './trace_letter';
import { PopBalloonsWithLetterActivitySchema } from './pop_balloons_with_letter';
import { BreakTimeMiniGameActivitySchema } from './break_time_minigame';
import { BuildWordFromLettersActivitySchema } from './build_word_from_letters';
import { MultipleChoiceQuestionActivitySchema } from './multiple_choice_question';
import { DragItemsToTargetActivitySchema } from './drag_items_to_target';
import { CatchFishWithLetterActivitySchema } from './catch_fish_with_letter';
import { AddPizzaToppingsWithLetterActivitySchema } from './add_pizza_toppings_with_letter';

// Import config schemas for helper function
import { ShowLetterOrWordConfigSchema } from './show_letter_or_word';
import { TapLetterInWordConfigSchema } from './tap_letter_in_word';
import { TraceLetterConfigSchema } from './trace_letter';
import { PopBalloonsWithLetterConfigSchema } from './pop_balloons_with_letter';
import { BreakTimeMiniGameConfigSchema } from './break_time_minigame';
import { BuildWordFromLettersConfigSchema } from './build_word_from_letters';
import { MultipleChoiceQuestionConfigSchema } from './multiple_choice_question';
import { DragItemsToTargetConfigSchema } from './drag_items_to_target';
import { CatchFishWithLetterConfigSchema } from './catch_fish_with_letter';
import { AddPizzaToppingsWithLetterConfigSchema } from './add_pizza_toppings_with_letter';

import type { ActivityType } from '../base';

/**
 * Discriminated union of all activity schemas
 *
 * This allows TypeScript to narrow types based on the 'type' field.
 *
 * @example
 * ```typescript
 * const activity: Activity = {...};
 * if (activity.type === 'tap_letter_in_word') {
 *   // TypeScript knows activity is TapLetterInWordActivity
 *   console.log(activity.config.targetWord);
 * }
 * ```
 */
export const ActivitySchema = z.discriminatedUnion('type', [
  ShowLetterOrWordActivitySchema,
  TapLetterInWordActivitySchema,
  TraceLetterActivitySchema,
  PopBalloonsWithLetterActivitySchema,
  BreakTimeMiniGameActivitySchema,
  BuildWordFromLettersActivitySchema,
  MultipleChoiceQuestionActivitySchema,
  DragItemsToTargetActivitySchema,
  CatchFishWithLetterActivitySchema,
  AddPizzaToppingsWithLetterActivitySchema,
]);

export type Activity = z.infer<typeof ActivitySchema>;

/**
 * Map of activity types to their config schemas
 */
const ACTIVITY_CONFIG_SCHEMAS = {
  show_letter_or_word: ShowLetterOrWordConfigSchema,
  tap_letter_in_word: TapLetterInWordConfigSchema,
  trace_letter: TraceLetterConfigSchema,
  pop_balloons_with_letter: PopBalloonsWithLetterConfigSchema,
  break_time_minigame: BreakTimeMiniGameConfigSchema,
  build_word_from_letters: BuildWordFromLettersConfigSchema,
  multiple_choice_question: MultipleChoiceQuestionConfigSchema,
  drag_items_to_target: DragItemsToTargetConfigSchema,
  catch_fish_with_letter: CatchFishWithLetterConfigSchema,
  add_pizza_toppings_with_letter: AddPizzaToppingsWithLetterConfigSchema,
} as const;

/**
 * Get the config schema for a specific activity type
 *
 * Useful for validating just the config portion of an activity
 *
 * @example
 * ```typescript
 * const configSchema = getActivityConfigSchema('tap_letter_in_word');
 * const result = configSchema.safeParse(configData);
 * ```
 */
export function getActivityConfigSchema(type: ActivityType) {
  return ACTIVITY_CONFIG_SCHEMAS[type];
}

/**
 * Get all activity config schemas as an object
 */
export function getAllActivityConfigSchemas() {
  return ACTIVITY_CONFIG_SCHEMAS;
}
