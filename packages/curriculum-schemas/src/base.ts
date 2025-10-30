/**
 * Base schemas and types used across all curriculum activities
 *
 * These foundational schemas are used as building blocks for
 * activity-specific configurations.
 */

import { z } from 'zod';

// ============================================================================
// LOCALIZED TEXT
// ============================================================================

/**
 * Localized text for bilingual content (English & Arabic)
 *
 * English text is required, Arabic text is optional.
 * This allows for gradual content development and optional Arabic translations.
 * Audio URL is optional and can be generated via TTS.
 */
export const LocalizedTextSchema = z.object({
  en: z.string()
    .min(1, 'English text required')
    .describe('English text'),

  ar: z.string()
    .optional()
    .describe('Arabic text (RTL) - optional'),

  audio_url: z.string()
    .url()
    .optional()
    .describe('URL to audio file (TTS-generated or uploaded)'),
});

export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

// ============================================================================
// ACTIVITY TYPE ENUM
// ============================================================================

/**
 * Complete list of activity types in the curriculum system
 *
 * This is the single source of truth for valid activity types.
 * Each type has a corresponding schema in the activities/ directory.
 */
export const ActivityTypeSchema = z.enum([
  'show_letter_or_word',
  'tap_letter_in_word',
  'trace_letter',
  'pop_balloons_with_letter',
  'break_time_minigame',
  'multiple_choice_question',
  'drag_items_to_target',
  'catch_fish_with_letter',
  'add_pizza_toppings_with_letter',
  'build_word_from_letters',
]);

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

/**
 * Human-readable labels for activity types
 * Used in UI dropdowns and displays
 */
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  show_letter_or_word: 'Show Single Letter or Word',
  tap_letter_in_word: 'Tap Target Letters in Word',
  trace_letter: 'Guided Letter Tracing',
  pop_balloons_with_letter: 'Pop Balloons with Target Letter',
  break_time_minigame: 'Break Time Mini-Game',
  multiple_choice_question: 'Multiple Choice Question',
  drag_items_to_target: 'Drag Items to Correct Targets',
  catch_fish_with_letter: 'Catch Fish with Target Letter',
  add_pizza_toppings_with_letter: 'Add Pizza Toppings with Letter',
  build_word_from_letters: 'Build Word from Letters',
};

// ============================================================================
// BASE ACTIVITY SCHEMA
// ============================================================================

/**
 * Base activity schema - all activities extend this
 *
 * Contains common fields present in every activity regardless of type.
 * Activity-specific fields go in the 'config' object.
 */
export const BaseActivitySchema = z.object({
  id: z.string()
    .uuid()
    .describe('Unique identifier for this activity'),

  type: ActivityTypeSchema
    .describe('Activity type - determines which config schema to use'),

  node_id: z.string()
    .uuid()
    .describe('Parent node/lesson this activity belongs to'),

  sequence_number: z.number()
    .int()
    .positive()
    .describe('Order within the node (1, 2, 3...)'),

  instruction: LocalizedTextSchema
    .describe('Instructions shown to the student'),

  created_at: z.string()
    .datetime()
    .describe('When this activity was created'),

  updated_at: z.string()
    .datetime()
    .describe('Last update timestamp'),
});

export type BaseActivity = z.infer<typeof BaseActivitySchema>;

// ============================================================================
// COMMON HELPER SCHEMAS
// ============================================================================

/**
 * Color hex string validation
 */
export const ColorSchema = z.string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #FF5733)')
  .describe('Hex color code');

/**
 * Duration in milliseconds
 */
export const DurationMsSchema = z.number()
  .int()
  .positive()
  .describe('Duration in milliseconds');

/**
 * Duration in seconds
 */
export const DurationSecondsSchema = z.number()
  .int()
  .positive()
  .describe('Duration in seconds');

/**
 * Ratio/percentage as decimal (0-1)
 */
export const RatioSchema = z.number()
  .min(0)
  .max(1)
  .describe('Ratio as decimal (0.0 to 1.0)');

/**
 * Positive multiplier
 */
export const MultiplierSchema = z.number()
  .positive()
  .describe('Multiplier value (e.g., 1.0 = normal, 2.0 = double)');

/**
 * Single Arabic letter
 */
export const ArabicLetterSchema = z.string()
  .length(1)
  .regex(/[\u0600-\u06FF]/, 'Must be an Arabic letter')
  .describe('Single Arabic letter character');

/**
 * Arabic word or text
 */
export const ArabicTextSchema = z.string()
  .min(1)
  .regex(/[\u0600-\u06FF]/, 'Must contain Arabic characters')
  .describe('Arabic text (word, phrase, or sentence)');

/**
 * Letter position in word
 */
export const LetterPositionSchema = z.enum(['isolated', 'initial', 'medial', 'final'])
  .describe('Position of letter in word (affects letter form in Arabic)');

export type LetterPosition = z.infer<typeof LetterPositionSchema>;

/**
 * Difficulty level
 */
export const DifficultySchema = z.enum(['easy', 'medium', 'hard'])
  .describe('Difficulty level of the activity');

export type Difficulty = z.infer<typeof DifficultySchema>;
