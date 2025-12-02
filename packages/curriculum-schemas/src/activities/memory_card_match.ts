
import { z } from 'zod';
import { BaseActivityConfigSchema } from '../base';

export const MemoryCardMatchConfigSchema = BaseActivityConfigSchema.extend({
    letters: z.array(z.string()),
    cardCount: z.number().optional(),
    matchType: z.enum(['letter_to_letter', 'letter_to_sound', 'form_to_form']).optional(),
    timeLimit: z.number().optional(),
    showHints: z.boolean().optional(),
});

export type MemoryCardMatchConfig = z.infer<typeof MemoryCardMatchConfigSchema>;

export const MemoryCardMatchActivitySchema = z.object({
    type: z.literal('memory_card_match'),
    config: MemoryCardMatchConfigSchema,
});

export type MemoryCardMatchActivity = z.infer<typeof MemoryCardMatchActivitySchema>;
