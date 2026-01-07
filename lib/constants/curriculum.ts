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
  { value: 'letter_rain', label: 'Letter Rain (Physics)' },
  { value: 'audio_letter_match', label: 'Audio Letter Match' },
  { value: 'memory_card_match', label: 'Memory Card Match' },
  { value: 'color_letter', label: 'Letter Coloring' },
  { value: 'letter_discrimination', label: 'Similar Letter Discrimination' },
  { value: 'speech_practice', label: 'Speech Pronunciation Practice' },
  { value: 'activity_request', label: 'Activity Request (Not Implemented)' },
  // New themed activities
  { value: 'grid_tap', label: 'Grid Tap (Select Letters)' },
  { value: 'pick_from_tree', label: 'Pick Fruit from Tree' },
  { value: 'pick_flowers', label: 'Pick Flowers in Field' },
  { value: 'tap_crescent_moons', label: 'Tap Crescent Moons' },
  { value: 'drag_to_animal_mouth', label: 'Drag to Animal Mouth' },
  { value: 'feed_rabbit', label: 'Feed the Rabbit' },
  { value: 'feed_baby', label: 'Feed the Baby' },
  { value: 'piggy_bank', label: 'Piggy Bank Coins' },
  { value: 'snowflakes', label: 'Catch Snowflakes' },
  { value: 'bear_honey', label: 'Bear Honey Collection' },
  { value: 'fly_on_flowers', label: 'Fly on Flowers' },
  { value: 'deliver_envelope', label: 'Deliver Envelope' },
  { value: 'plant_seeds', label: 'Plant Seeds' },
  { value: 'balance_scale', label: 'Balance Scale' },
  { value: 'ice_cream_stacking', label: 'Ice Cream Stacking' },
  { value: 'content_with_cards', label: 'Content with Cards' },
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
  letter_rain: '🌧️',
  audio_letter_match: '🔊',
  memory_card_match: '🃏',
  color_letter: '🎨',
  letter_discrimination: '👀',
  speech_practice: '🎙️',
  activity_request: '💡',
  // New themed activities
  grid_tap: '🔲',
  pick_from_tree: '🍎',
  pick_flowers: '🌸',
  tap_crescent_moons: '🌙',
  drag_to_animal_mouth: '🐕',
  feed_rabbit: '🐰',
  feed_baby: '👶',
  piggy_bank: '🐷',
  snowflakes: '❄️',
  bear_honey: '🐻',
  fly_on_flowers: '🪰',
  deliver_envelope: '✉️',
  plant_seeds: '🌱',
  balance_scale: '⚖️',
  ice_cream_stacking: '🍦',
  content_with_cards: '🃏',
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
