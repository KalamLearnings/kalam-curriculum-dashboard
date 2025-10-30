'use client';

/**
 * Placeholder Preview
 *
 * Generic preview for activities that don't have a custom preview yet
 */

import { PreviewContainer } from '../shared/PreviewContainer';

const ACTIVITY_ICONS: Record<string, string> = {
  build_word_from_letters: '🔨',
  multiple_choice_question: '❓',
  drag_items_to_target: '🎯',
  catch_fish_with_letter: '🎣',
  add_pizza_toppings_with_letter: '🍕',
};

export function PlaceholderPreview({ type }: { type: string }) {
  const icon = ACTIVITY_ICONS[type] || '🎨';

  return (
    <PreviewContainer variant="centered">
      <div className="text-center">
        <div className="text-6xl mb-6">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2 capitalize">
          {type.replace('_', ' ')}
        </h3>
        <p className="text-sm text-gray-500">Visual preview coming soon...</p>
        <p className="text-xs text-gray-400 mt-8">
          Activity will work correctly in the app
        </p>
      </div>
    </PreviewContainer>
  );
}
