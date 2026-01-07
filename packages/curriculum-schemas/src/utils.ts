/**
 * Utility functions for working with curriculum schemas
 */

import { z } from 'zod';
import type { ActivityType } from './base';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validation result with detailed error information
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Individual validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Safely validate data against a Zod schema
 *
 * Returns a user-friendly result object instead of throwing
 *
 * @example
 * const result = safeValidate(TapLetterInWordConfigSchema, data);
 * if (result.success) {
 *   console.log('Valid:', result.data);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
}

/**
 * Validate and throw on error
 *
 * Useful when you want to fail fast in server-side code
 *
 * @throws {Error} If validation fails
 */
export function validateOrThrow<T extends z.ZodType>(
  schema: T,
  data: unknown,
  errorPrefix = 'Validation failed'
): z.infer<T> {
  const result = safeValidate(schema, data);

  if (!result.success) {
    const errorMessages = result.errors!
      .map((err) => `${err.field}: ${err.message}`)
      .join(', ');

    throw new Error(`${errorPrefix}: ${errorMessages}`);
  }

  return result.data!;
}

// ============================================================================
// ACTIVITY TYPE HELPERS
// ============================================================================

/**
 * Check if a string is a valid activity type
 */
export function isValidActivityType(type: string): type is ActivityType {
  const validTypes: ActivityType[] = [
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
    'drag_dots_to_letter',
    'tap_dot_position',
    'activity_request',
    'content_with_cards',
  ];

  return validTypes.includes(type as ActivityType);
}

/**
 * Get activity category based on type
 *
 * Useful for UI grouping and filtering
 */
export function getActivityCategory(type: ActivityType): string {
  const categories: Record<ActivityType, string> = {
    show_letter_or_word: 'Introduction',
    tap_letter_in_word: 'Recognition',
    trace_letter: 'Writing',
    pop_balloons_with_letter: 'Game',
    break_time_minigame: 'Break',
    multiple_choice_question: 'Assessment',
    drag_items_to_target: 'Interactive',
    catch_fish_with_letter: 'Game',
    add_pizza_toppings_with_letter: 'Game',
    build_word_from_letters: 'Interactive',
    drag_dots_to_letter: 'Interactive',
    tap_dot_position: 'Assessment',
    letter_rain: 'Game',
    memory_card_match: 'Game',
    audio_letter_match: 'Recognition',
    color_letter: 'Writing',
    letter_discrimination: 'Recognition',
    activity_request: 'Other',
    content_with_cards: 'Interactive',
  };

  return categories[type];
}

/**
 * Get estimated duration for activity type (in seconds)
 *
 * These are defaults - actual activities may override
 */
export function getEstimatedDuration(type: ActivityType): number {
  const durations: Record<ActivityType, number> = {
    show_letter_or_word: 5,
    tap_letter_in_word: 30,
    trace_letter: 60,
    pop_balloons_with_letter: 60,
    break_time_minigame: 30,
    multiple_choice_question: 20,
    drag_items_to_target: 45,
    catch_fish_with_letter: 60,
    add_pizza_toppings_with_letter: 45,
    build_word_from_letters: 90,
    drag_dots_to_letter: 45,
    tap_dot_position: 20,
    letter_rain: 60,
    memory_card_match: 60,
    audio_letter_match: 45,
    color_letter: 60,
    letter_discrimination: 45,
    activity_request: 0,
    content_with_cards: 30,
  };

  return durations[type];
}

// ============================================================================
// DATA TRANSFORMATION HELPERS
// ============================================================================

/**
 * Strip undefined and null values from an object
 *
 * Useful before sending data to API or storing in database
 */
export function stripEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
  ) as Partial<T>;
}

/**
 * Deep merge two objects
 *
 * Useful for merging config overrides with defaults
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = output[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        output[key] = deepMerge(targetValue, sourceValue) as any;
      } else if (sourceValue !== undefined) {
        output[key] = sourceValue as any;
      }
    }
  }

  return output;
}

/**
 * Create a default config object for an activity type
 *
 * Returns minimal valid configuration that passes schema validation
 */
export function createDefaultConfig(type: ActivityType): Record<string, any> {
  const defaults: Record<ActivityType, Record<string, any>> = {
    show_letter_or_word: {
      contentType: 'letter',
      letter: 'ب',
      autoAdvance: false,
      displayDuration: 3000,
    },
    tap_letter_in_word: {
      targetWord: 'باب',
      targetLetter: 'ب',
      targetCount: 2,
      showHighlight: true,
      highlightColor: '#4CAF50',
      provideFeedback: true,
    },
    trace_letter: {
      letterForm: 'ب',
      position: 'isolated',
      traceCount: 1,
      maxAttempts: 5,
      recognitionTolerance: 0.7,
    },
    pop_balloons_with_letter: {
      correctLetter: 'ب',
      distractorLetters: ['ت', 'ث', 'ن'],
      duration: 60,
      targetCount: 10,
      balloonSpeed: 1.0,
      spawnRate: 1.5,
      correctRatio: 0.4,
    },
    break_time_minigame: {
      variant: 'tracing_lines',
      duration: 30,
    },
    multiple_choice_question: {
      question: { en: 'Select the correct letter', ar: 'اختر الحرف الصحيح' },
      options: [],
      correctOptionId: '',
      layout: 'vertical',
      showImages: false,
      randomizeOptions: false,
    },
    drag_items_to_target: {
      variant: 'letter_matching',
      draggableItems: [],
      correctCount: 1,
      snapToTarget: true,
    },
    catch_fish_with_letter: {
      targetLetter: 'ب',
      totalFish: 10,
      correctFishCount: 3,
      duration: 60,
      fishSpeed: 1.0,
    },
    add_pizza_toppings_with_letter: {
      targetLetter: 'ب',
      toppings: [],
      requiredToppingsCount: 3,
    },
    build_word_from_letters: {
      targetWord: 'باب',
      showConnectedForm: true,
      highlightCorrectPositions: true,
      scrambleLetters: true,
      showWordMeaning: false,
    },
    drag_dots_to_letter: {
      targetLetter: 'ب',
      position: 'isolated',
      distractorDotsCount: 0,
    },
    tap_dot_position: {
      targetLetter: 'ب',
      position: 'isolated',
      distractorPositions: [],
    },
    letter_rain: {
      targetLetter: 'ب',
      distractorLetters: ['ت', 'ث'],
      targetCount: 5,
      speed: 1.0,
      difficulty: 'medium',
    },
    memory_card_match: {
      pairs: [],
      gridSize: '4x4',
      theme: 'letters',
    },
    audio_letter_match: {
      targetLetter: 'ب',
      distractorLetters: ['ت', 'ث'],
      audioUrl: '',
    },
    color_letter: {
      letter: 'ب',
      palette: ['#FF0000', '#00FF00', '#0000FF'],
      brushSize: 10,
    },
    letter_discrimination: {
      targetLetter: 'ب',
      confusableLetters: ['ت', 'ث'],
      highlightDifference: false,
    },
    activity_request: {
      description: '',
      notes: '',
    },
    content_with_cards: {
      contentType: 'letter',
      content: { letter: 'ب' },
      cards: [
        { id: 'card_1', text: 'ب', isCorrect: true },
        { id: 'card_2', text: 'ت', isCorrect: false },
      ],
      cardMode: 'text',
      interactive: true,
    },
  };

  return defaults[type];
}
