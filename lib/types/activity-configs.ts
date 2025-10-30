/**
 * TypeScript types for activity configurations
 *
 * These types provide type safety for activity configs throughout the dashboard.
 * Based on the Zod schemas defined in the backend.
 */

import type { ArticleType } from '@/lib/schemas/curriculum';

// Base types
export type ContentType = 'letter' | 'word';
export type LetterPosition = 'isolated' | 'initial' | 'medial' | 'final';
export type BreakVariant = 'tracing_lines' | 'dot_tapping' | 'coloring' | 'memory_game';
export type WritingMode = 'guided' | 'freehand';

/**
 * Show Letter or Word Activity Config
 */
export interface ShowLetterOrWordConfig {
  contentType: ContentType;
  letter?: string;
  word?: string;
  position?: LetterPosition;
  autoAdvance?: boolean;
  displayDuration?: number;
}

/**
 * Tap Letter in Word Activity Config
 */
export interface TapLetterInWordConfig {
  targetWord: string;
  targetLetter: string;
  targetCount: number;
  showHighlight?: boolean;
  highlightColor?: string;
  provideFeedback?: boolean;
  wordMeaning?: string;
}

/**
 * Trace Letter Activity Config
 */
export interface TraceLetterConfig {
  letterForm: string;
  mode?: WritingMode;
  traceCount?: number;
  maxAttempts?: number;
  recognitionTolerance?: number;
}

/**
 * Pop Balloons with Letter Activity Config
 */
export interface PopBalloonsWithLetterConfig {
  correctLetter: string;
  correctLetterForms?: string[];
  distractorLetters: string[];
  duration?: number;
  targetCount?: number;
  balloonSpeed?: number;
  spawnRate?: number;
  correctRatio?: number;
}

/**
 * Break Time Mini-Game Activity Config
 */
export interface BreakTimeMiniGameConfig {
  variant: BreakVariant;
  duration?: number;
  linePattern?: string;
  dotCount?: number;
  dotPattern?: string;
  coloringImage?: string;
  availableColors?: string[];
  pairCount?: number;
}

/**
 * Build Word from Letters Activity Config
 */
export interface BuildWordFromLettersConfig {
  targetWord: string;
  showConnectedForm?: boolean;
  highlightCorrectPositions?: boolean;
  scrambleLetters?: boolean;
  showWordMeaning?: boolean;
  wordMeaning?: {
    en: string;
    ar: string;
  };
}

/**
 * Multiple Choice Question Activity Config
 */
export interface MultipleChoiceOption {
  id: string;
  text: { en: string; ar: string };
  image?: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestionConfig {
  question: { en: string; ar: string };
  questionImage?: string;
  mode?: 'text' | 'image'; // Display mode for options
  options: MultipleChoiceOption[];
  correctOptionId?: string;
  targetLetter?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  randomizeOptions?: boolean;
}

/**
 * Drag Items to Target Activity Config
 */
export interface DragItemsToTargetConfig {
  items: Array<{ id: string; content: string; correctTarget: string }>;
  targets: Array<{ id: string; label: string }>;
  showFeedback?: boolean;
}

/**
 * Catch Fish with Letter Activity Config
 */
export interface CatchFishWithLetterConfig {
  correctLetter: string;
  distractorLetters: string[];
  duration: number;
  targetCount: number;
}

/**
 * Add Pizza Toppings with Letter Activity Config
 */
export interface AddPizzaToppingsWithLetterConfig {
  correctLetter: string;
  distractorLetters: string[];
  targetCount: number;
}

/**
 * Union type for all activity configs
 */
export type ActivityConfig =
  | ShowLetterOrWordConfig
  | TapLetterInWordConfig
  | TraceLetterConfig
  | PopBalloonsWithLetterConfig
  | BreakTimeMiniGameConfig
  | BuildWordFromLettersConfig
  | MultipleChoiceQuestionConfig
  | DragItemsToTargetConfig
  | CatchFishWithLetterConfig
  | AddPizzaToppingsWithLetterConfig;

/**
 * Mapped type for activity configs by type
 */
export type ActivityConfigMap = {
  show_letter_or_word: ShowLetterOrWordConfig;
  tap_letter_in_word: TapLetterInWordConfig;
  trace_letter: TraceLetterConfig;
  pop_balloons_with_letter: PopBalloonsWithLetterConfig;
  break_time_minigame: BreakTimeMiniGameConfig;
  build_word_from_letters: BuildWordFromLettersConfig;
  multiple_choice_question: MultipleChoiceQuestionConfig;
  drag_items_to_target: DragItemsToTargetConfig;
  catch_fish_with_letter: CatchFishWithLetterConfig;
  add_pizza_toppings_with_letter: AddPizzaToppingsWithLetterConfig;
};

/**
 * Get typed config for a specific activity type
 */
export type GetActivityConfig<T extends ArticleType> = T extends keyof ActivityConfigMap
  ? ActivityConfigMap[T]
  : never;
