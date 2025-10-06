import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const LocalizedTextSchema = z.object({
  en: z.string().min(1, 'English text required'),
  ar: z.string().min(1, 'Arabic text required'),
});

export const LetterSchema = z.object({
  letter: z.string().length(1, 'Must be a single Arabic letter'),
  name_english: z.string().min(1, 'Letter name (English) required'),
  name_arabic: z.string().optional(),
});

// ============================================================================
// CURRICULUM
// ============================================================================

export const CurriculumSchema = z.object({
  id: z.string().uuid(),
  title: LocalizedTextSchema,
  is_published: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateCurriculumSchema = z.object({
  title: LocalizedTextSchema,
});

export const UpdateCurriculumSchema = CreateCurriculumSchema.partial();

// ============================================================================
// TOPIC
// ============================================================================

export const TopicSchema = z.object({
  id: z.string().uuid(),
  curriculum_id: z.string().uuid(),
  letter_id: z.string(),
  letter: LetterSchema.optional(),
  sequence_number: z.number().int().positive(),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateTopicSchema = z.object({
  letter: LetterSchema,
  sequence_number: z.number().int().positive().default(1),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
});

export const UpdateTopicSchema = CreateTopicSchema.partial();

// ============================================================================
// NODE (formerly "Node" - keeping backend naming)
// ============================================================================

export const NodeSchema = z.object({
  id: z.string().uuid(),
  topic_id: z.string().uuid(),
  sequence_number: z.number().int().positive(),
  type: z.enum(['lesson', 'assessment', 'intro']).default('lesson'),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  position: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateNodeSchema = z.object({
  sequence_number: z.number().int().positive().default(1),
  type: z.enum(['lesson', 'assessment', 'intro']).default('lesson'),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  position: z.object({
    x: z.number().min(0).max(1).default(0.5),
    y: z.number().min(0).max(1).default(0.5),
  }).optional(),
});

export const UpdateNodeSchema = CreateNodeSchema.partial();

// ============================================================================
// ARTICLE (formerly "Activity")
// ============================================================================

export const ArticleTypeSchema = z.enum([
  'intro',
  'presentation',
  'tap',
  'write',
  'word_builder',
  'name_builder',
  'balloon',
  'multiple_choice',
  'drag_drop',
  'fishing',
  'pizza',
  'break',
]);

// Config schemas per type
const TapConfigSchema = z.object({
  targetWord: z.string().min(1),
  targetLetter: z.string().length(1),
  targetCount: z.number().int().positive(),
});

const MultipleChoiceConfigSchema = z.object({
  question: LocalizedTextSchema,
  options: z.array(z.object({
    id: z.string(),
    text: LocalizedTextSchema,
    isCorrect: z.boolean(),
  })).min(2).max(6),
});

const WordBuilderConfigSchema = z.object({
  targetWord: z.string().min(1),
  scrambledLetters: z.array(z.string().length(1)),
});

export const ArticleConfigSchema = z.union([
  TapConfigSchema,
  MultipleChoiceConfigSchema,
  WordBuilderConfigSchema,
  z.object({}), // Empty config for intro/break
]);

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  node_id: z.string().uuid(),
  sequence_number: z.number().int().positive(),
  type: ArticleTypeSchema,
  instruction: LocalizedTextSchema,
  config: ArticleConfigSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateArticleSchema = z.object({
  type: ArticleTypeSchema,
  instruction: LocalizedTextSchema,
  config: ArticleConfigSchema,
});

export const UpdateArticleSchema = CreateArticleSchema.partial();

// ============================================================================
// REORDER SCHEMAS
// ============================================================================

export const ReorderItemSchema = z.object({
  id: z.string().uuid(),
  sequence_number: z.number().int().positive(),
});

export const BatchReorderSchema = z.object({
  items: z.array(ReorderItemSchema).min(1),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Curriculum = z.infer<typeof CurriculumSchema>;
export type CreateCurriculum = z.infer<typeof CreateCurriculumSchema>;
export type UpdateCurriculum = z.infer<typeof UpdateCurriculumSchema>;

export type Topic = z.infer<typeof TopicSchema>;
export type CreateTopic = z.infer<typeof CreateTopicSchema>;
export type UpdateTopic = z.infer<typeof UpdateTopicSchema>;

export type Node = z.infer<typeof NodeSchema>;
export type CreateNode = z.infer<typeof CreateNodeSchema>;
export type UpdateNode = z.infer<typeof UpdateNodeSchema>;

export type Article = z.infer<typeof ArticleSchema>;
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
export type ArticleType = z.infer<typeof ArticleTypeSchema>;

export type ReorderItem = z.infer<typeof ReorderItemSchema>;
export type BatchReorder = z.infer<typeof BatchReorderSchema>;
