'use client';

/**
 * Follow-Up Actions Panel Component
 *
 * Configures what happens after an audio response plays.
 * Supports multiselect - can combine highlight with continue/retry.
 * If no options selected, there's no followUp.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AudioFollowUp } from '@kalam/curriculum-schemas';

interface FollowUpActionsPanelProps {
  /** Current follow-up configuration */
  value?: AudioFollowUp;
  /** Callback when configuration changes */
  onChange: (value: AudioFollowUp | undefined) => void;
  /** Activity type for context-aware UI */
  activityType?: string;
  /** Activity config (for context like targetWord) */
  activityConfig?: Record<string, any>;
}

type ActionType = 'highlight' | 'continue';

const FOLLOW_UP_ACTIONS: { value: ActionType; label: string; description: string; icon: string }[] = [
  {
    value: 'highlight',
    label: 'Highlight',
    description: 'Highlight specific elements',
    icon: '✨',
  },
  {
    value: 'continue',
    label: 'Continue',
    description: 'Enable continue button',
    icon: '➡️',
  },
];

export function FollowUpActionsPanel({
  value,
  onChange,
  activityType,
  activityConfig,
}: FollowUpActionsPanelProps) {
  // Determine which actions are currently selected
  // Highlight is selected if there are highlights OR if highlight array exists (even if empty, meaning user clicked it)
  const hasHighlight = value?.highlight !== undefined;
  const hasHighlightTargets = value?.highlight && value.highlight.length > 0;
  const currentAction = value?.action;

  // For display: show selected actions
  const selectedActions: ActionType[] = [];
  if (hasHighlightTargets) selectedActions.push('highlight');
  if (currentAction === 'continue') selectedActions.push('continue');

  const [isExpanded, setIsExpanded] = useState(selectedActions.length > 0 || hasHighlight);

  // Check if an action is selected (for button styling)
  const isActionSelected = (action: ActionType): boolean => {
    if (action === 'highlight') {
      return hasHighlight; // Show as selected even with empty array
    }
    return currentAction === action;
  };

  // Toggle an action on/off
  const toggleAction = (action: ActionType) => {
    const isCurrentlySelected = isActionSelected(action);

    if (action === 'highlight') {
      if (isCurrentlySelected) {
        // Deselect highlight - clear highlights
        if (!currentAction && !value?.delay) {
          onChange(undefined);
        } else {
          onChange({ ...value, highlight: undefined });
        }
      } else {
        // Select highlight - initialize with empty array, user will pick letters
        onChange({
          ...value,
          highlight: value?.highlight || [], // Keep existing or start empty
        });
      }
    } else {
      // Continue or Retry
      if (isCurrentlySelected) {
        // Deselect - remove action
        if (hasHighlightTargets) {
          onChange({ ...value, action: undefined });
        } else if (value?.delay) {
          onChange({ ...value, action: undefined });
        } else {
          onChange(undefined);
        }
      } else {
        // Select - set this action
        onChange({
          ...value,
          action,
        });
      }
    }
  };

  const handleHighlightTargetsChange = (targets: string) => {
    const targetArray = targets
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (targetArray.length === 0) {
      // No highlights - if no action either, clear everything
      if (!currentAction) {
        onChange(undefined);
      } else {
        onChange({ ...value, highlight: undefined });
      }
    } else {
      onChange({
        ...value,
        highlight: targetArray,
      });
    }
  };

  const handleDelayChange = (delayStr: string) => {
    const delay = parseInt(delayStr, 10);
    if (!value && (isNaN(delay) || delay <= 0)) {
      return; // Don't create value just for empty delay
    }
    onChange({
      ...value,
      delay: isNaN(delay) || delay <= 0 ? undefined : delay,
    });
  };

  // Toggle a letter in highlight targets (for visual picker)
  const toggleHighlightTarget = (elementId: string) => {
    const currentTargets = value?.highlight || [];
    const isSelected = currentTargets.includes(elementId);

    const newTargets = isSelected
      ? currentTargets.filter((t) => t !== elementId)
      : [...currentTargets, elementId];

    if (newTargets.length === 0) {
      // No highlights left
      if (!currentAction) {
        onChange(undefined);
      } else {
        onChange({ ...value, highlight: undefined });
      }
    } else {
      onChange({
        ...value,
        highlight: newTargets,
      });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🎬</span>
          <span className="text-xs font-medium text-gray-700">Follow-up Actions</span>
          {selectedActions.length > 0 && (
            <div className="flex gap-1">
              {selectedActions.map((action) => (
                <span key={action} className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded">
                  {FOLLOW_UP_ACTIONS.find((a) => a.value === action)?.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <svg
          className={cn(
            'h-3.5 w-3.5 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-2 pb-2 pt-1 space-y-2 border-t border-gray-100">
          {/* Action Selection - Multiselect */}
          <div>
            <div className="text-[10px] text-gray-500 mb-1">Select actions (can combine):</div>
            <div className="grid grid-cols-2 gap-1">
              {FOLLOW_UP_ACTIONS.map((action) => {
                const isSelected = action.value === 'highlight'
                  ? hasHighlight
                  : currentAction === action.value;
                return (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => toggleAction(action.value)}
                    className={cn(
                      'flex flex-col items-center p-1.5 rounded border transition-all',
                      isSelected
                        ? 'border-purple-400 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    <span className="text-sm">{action.icon}</span>
                    <span className="text-[10px] font-medium mt-0.5">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Highlight Targets - shown when any action is selected or expanded */}
          <div className="space-y-2">
            {/* Visual Letter Picker for tap_letter_in_word activity */}
            {activityType === 'tap_letter_in_word' && activityConfig?.targetWord && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-[10px] font-medium text-yellow-700 mb-1">
                  Click letters to highlight (optional):
                </div>
                <div className="flex flex-row-reverse justify-center gap-1 font-arabic text-lg">
                  {[...activityConfig.targetWord].map((char: string, index: number) => {
                    const elementId = `letter_${index}`;
                    const isSelected = value?.highlight?.includes(elementId);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleHighlightTarget(elementId)}
                        className={cn(
                          'flex flex-col items-center px-2 py-1 rounded border transition-colors',
                          isSelected
                            ? 'bg-yellow-500 text-white border-yellow-600'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                        )}
                      >
                        <span className="text-base">{char}</span>
                        <span className="text-[9px] opacity-70">{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
                {value?.highlight && value.highlight.length > 0 && (
                  <div className="text-[9px] text-yellow-600 mt-1 text-center">
                    Will highlight: {value.highlight.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Text input fallback for other activity types or manual entry */}
            {activityType !== 'tap_letter_in_word' && (
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                  Highlight Targets (comma-separated IDs)
                </label>
                <input
                  type="text"
                  value={value?.highlight?.join(', ') || ''}
                  onChange={(e) => handleHighlightTargetsChange(e.target.value)}
                  placeholder="e.g., letter_0, letter_1"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Element IDs to highlight after audio plays
                </p>
              </div>
            )}
          </div>

          {/* Delay */}
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
              Delay (ms)
            </label>
            <input
              type="number"
              value={value?.delay || ''}
              onChange={(e) => handleDelayChange(e.target.value)}
              placeholder="1500"
              min="0"
              max="5000"
              step="100"
              className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-[10px] text-gray-500 mt-0.5">
              Wait before showing highlight (default: 1500ms)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
