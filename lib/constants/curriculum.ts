/**
 * Curriculum constants - Single source of truth for activity types, labels, and icons
 */

import type { ArticleType } from '@/lib/schemas/curriculum';

/**
 * Activity type definitions with labels
 */
export const ACTIVITY_TYPES: { value: ArticleType; label: string }[] = [
  { value: 'show_letter_or_word', label: 'Show Letter/Word/Image' },
  { value: 'tap_letter_in_word', label: 'Tap Target Letters in Word' },
  { value: 'trace_letter', label: 'Letter Tracing' },
  { value: 'pop_balloons_with_letter', label: 'Pop Balloons with Target Letter' },
  { value: 'break_time_minigame', label: 'Break Time Mini-Game' },
  { value: 'build_word_from_letters', label: 'Build Words from Letters' },
  { value: 'multiple_choice_question', label: 'Multiple Choice Question' },
  { value: 'drag_items_to_target', label: 'Drag Items to Correct Targets' },
  { value: 'catch_fish_with_letter', label: 'Catch Fish with Target Letter' },
  { value: 'add_pizza_toppings_with_letter', label: 'Add Pizza Toppings with Letter' },
  { value: 'drag_dots_to_letter', label: 'Drag Dots to Letter' },
  { value: 'tap_dot_position', label: 'Tap Correct Dot Position' },
  { value: 'activity_request', label: 'Activity Request (Not Implemented)' },
];

/**
 * Activity type icons
 */
export const ACTIVITY_ICONS: Record<ArticleType, string> = {
  show_letter_or_word: '🔤',
  tap_letter_in_word: '👆',
  trace_letter: '✏️',
  pop_balloons_with_letter: '🎈',
  break_time_minigame: '☕',
  build_word_from_letters: '🔨',
  multiple_choice_question: '❓',
  drag_items_to_target: '🎯',
  catch_fish_with_letter: '🎣',
  add_pizza_toppings_with_letter: '🍕',
  drag_dots_to_letter: '⚫',
  tap_dot_position: '🎯',
  activity_request: '💡',
};

/**
 * Get activity label by type
 */
export function getActivityLabel(type: ArticleType): string {
  return ACTIVITY_TYPES.find(at => at.value === type)?.label || 'Activity';
}

/**
 * Get activity icon by type
 */
export function getActivityIcon(type: ArticleType): string {
  return ACTIVITY_ICONS[type] || '📝';
}
