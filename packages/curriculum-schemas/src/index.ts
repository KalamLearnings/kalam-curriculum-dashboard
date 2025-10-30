/**
 * @kalam/curriculum-schemas
 *
 * Unified Zod schemas for Kalam Kids curriculum activities.
 * Single source of truth across dashboard, backend, and mobile app.
 *
 * @packageDocumentation
 */

// ============================================================================
// BASE SCHEMAS & TYPES
// ============================================================================

export {
  // Schemas
  LocalizedTextSchema,
  ActivityTypeSchema,
  BaseActivitySchema,
  ColorSchema,
  DurationMsSchema,
  DurationSecondsSchema,
  RatioSchema,
  MultiplierSchema,
  ArabicLetterSchema,
  ArabicTextSchema,
  LetterPositionSchema,
  DifficultySchema,

  // Types
  type LocalizedText,
  type ActivityType,
  type BaseActivity,
  type LetterPosition,
  type Difficulty,

  // Constants
  ACTIVITY_TYPE_LABELS,
} from './base';

// ============================================================================
// ACTIVITY SCHEMAS & TYPES
// ============================================================================

export {
  // Union schema
  ActivitySchema,
  type Activity,

  // Helper functions
  getActivityConfigSchema,
  getAllActivityConfigSchemas,

  // Show Letter or Word
  ShowLetterOrWordConfigSchema,
  ShowLetterOrWordActivitySchema,
  type ShowLetterOrWordConfig,
  type ShowLetterOrWordActivity,

  // Tap Letter in Word
  TapLetterInWordConfigSchema,
  TapLetterInWordActivitySchema,
  type TapLetterInWordConfig,
  type TapLetterInWordActivity,

  // Trace Letter
  TraceLetterConfigSchema,
  TraceLetterActivitySchema,
  type TraceLetterConfig,
  type TraceLetterActivity,

  // Pop Balloons with Letter
  PopBalloonsWithLetterConfigSchema,
  PopBalloonsWithLetterActivitySchema,
  type PopBalloonsWithLetterConfig,
  type PopBalloonsWithLetterActivity,

  // Break Time Mini-Game
  BreakTimeMiniGameConfigSchema,
  BreakTimeMiniGameActivitySchema,
  type BreakTimeMiniGameConfig,
  type BreakTimeMiniGameActivity,

  // Build Word from Letters
  BuildWordFromLettersConfigSchema,
  BuildWordFromLettersActivitySchema,
  type BuildWordFromLettersConfig,
  type BuildWordFromLettersActivity,

  // Multiple Choice Question
  MultipleChoiceOptionSchema,
  MultipleChoiceQuestionConfigSchema,
  MultipleChoiceQuestionActivitySchema,
  type MultipleChoiceOption,
  type MultipleChoiceQuestionConfig,
  type MultipleChoiceQuestionActivity,

  // Drag Items to Target
  DraggableItemSchema,
  DragItemsToTargetConfigSchema,
  DragItemsToTargetActivitySchema,
  type DraggableItem,
  type DragItemsToTargetConfig,
  type DragItemsToTargetActivity,

  // Catch Fish with Letter
  CatchFishWithLetterConfigSchema,
  CatchFishWithLetterActivitySchema,
  type CatchFishWithLetterConfig,
  type CatchFishWithLetterActivity,

  // Add Pizza Toppings with Letter
  PizzaToppingSchema,
  AddPizzaToppingsWithLetterConfigSchema,
  AddPizzaToppingsWithLetterActivitySchema,
  type PizzaTopping,
  type AddPizzaToppingsWithLetterConfig,
  type AddPizzaToppingsWithLetterActivity,
} from './activities/index';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export {
  // Validation helpers
  safeValidate,
  validateOrThrow,
  type ValidationResult,
  type ValidationError,

  // Activity helpers
  isValidActivityType,
  getActivityCategory,
  getEstimatedDuration,

  // Data transformation
  stripEmpty,
  deepMerge,
  createDefaultConfig,
} from './utils';
