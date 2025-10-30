/**
 * Show Letter or Word Activity
 *
 * Displays a single Arabic letter or word to the student with fade-in animations.
 * Used for introducing new content before interactive activities.
 *
 * @example Letter Mode
 * ```
 * {
 *   type: 'show_letter_or_word',
 *   config: {
 *     contentType: 'letter',
 *     letter: 'ب',
 *     autoAdvance: false
 *   }
 * }
 * ```
 *
 * @example Word Mode
 * ```
 * {
 *   type: 'show_letter_or_word',
 *   config: {
 *     contentType: 'word',
 *     word: 'باب',
 *     autoAdvance: true,
 *     displayDuration: 5000
 *   }
 * }
 * ```
 */

import { z } from 'zod';
import { BaseActivitySchema, ArabicLetterSchema, ArabicTextSchema, DurationMsSchema } from '../base';

/**
 * Configuration for Show Letter or Word activity
 */
export const ShowLetterOrWordConfigSchema = z.object({
  contentType: z.enum(['letter', 'word'])
    .describe('Whether to show a single letter or a word'),

  letter: ArabicLetterSchema
    .optional()
    .describe('Single Arabic letter to display (required if contentType is "letter")'),

  word: ArabicTextSchema
    .optional()
    .describe('Single Arabic word to display (required if contentType is "word")'),

  autoAdvance: z.boolean()
    .default(false)
    .describe('Automatically advance to next activity after displaying'),

  displayDuration: DurationMsSchema
    .default(3000)
    .describe('How long to show content before auto-advancing (milliseconds)'),
}).refine(
  (data) => {
    if (data.contentType === 'letter') {
      return data.letter !== undefined && data.letter.length > 0;
    }
    if (data.contentType === 'word') {
      return data.word !== undefined && data.word.length > 0;
    }
    return false;
  },
  {
    message: 'Must provide letter when contentType is "letter", or word when contentType is "word"',
    path: ['contentType'],
  }
);

/**
 * Complete Show Letter or Word activity schema
 */
export const ShowLetterOrWordActivitySchema = BaseActivitySchema.extend({
  type: z.literal('show_letter_or_word'),
  config: ShowLetterOrWordConfigSchema,
});

// Type exports
export type ShowLetterOrWordConfig = z.infer<typeof ShowLetterOrWordConfigSchema>;
export type ShowLetterOrWordActivity = z.infer<typeof ShowLetterOrWordActivitySchema>;
