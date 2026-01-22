'use client';

/**
 * Follow-Up Actions Panel Component
 *
 * Configures what happens after an audio response plays.
 * Options include highlighting elements, continuing to next step, or retrying.
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

const FOLLOW_UP_ACTIONS = [
  {
    value: 'none' as const,
    label: 'None',
    description: 'No action after audio',
    icon: '⏸️',
  },
  {
    value: 'highlight' as const,
    label: 'Highlight',
    description: 'Highlight specific elements',
    icon: '✨',
  },
  {
    value: 'continue' as const,
    label: 'Continue',
    description: 'Proceed to next step',
    icon: '➡️',
  },
  {
    value: 'retry' as const,
    label: 'Retry',
    description: 'Let student try again',
    icon: '🔄',
  },
] as const;

export function FollowUpActionsPanel({
  value,
  onChange,
  activityType,
  activityConfig,
}: FollowUpActionsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!!value?.action && value.action !== 'none');

  const currentAction = value?.action || 'none';

  const handleActionChange = (action: typeof currentAction) => {
    if (action === 'none') {
      onChange(undefined);
    } else {
      onChange({
        action,
        highlight: action === 'highlight' ? value?.highlight : undefined,
        delay: value?.delay,
      });
    }
  };

  const handleHighlightTargetsChange = (targets: string) => {
    const targetArray = targets
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onChange({
      ...value,
      action: 'highlight',
      highlight: targetArray.length > 0 ? targetArray : undefined,
    });
  };

  const handleDelayChange = (delayStr: string) => {
    const delay = parseInt(delayStr, 10);
    onChange({
      ...value,
      action: currentAction === 'none' ? 'continue' : currentAction,
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

    onChange({
      ...value,
      action: 'highlight',
      highlight: newTargets.length > 0 ? newTargets : undefined,
    });
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
          <span className="text-xs font-medium text-gray-700">Follow-up Action</span>
          {value?.action && value.action !== 'none' && (
            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded">
              {FOLLOW_UP_ACTIONS.find((a) => a.value === value.action)?.label}
            </span>
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
          {/* Action Selection */}
          <div className="grid grid-cols-4 gap-1">
            {FOLLOW_UP_ACTIONS.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => handleActionChange(action.value)}
                className={cn(
                  'flex flex-col items-center p-1.5 rounded border transition-all',
                  currentAction === action.value
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                )}
              >
                <span className="text-sm">{action.icon}</span>
                <span className="text-[10px] font-medium mt-0.5">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Highlight Targets (only shown when highlight action is selected) */}
          {currentAction === 'highlight' && (
            <div className="space-y-2">
              {/* Visual Letter Picker for tap_letter_in_word activity */}
              {activityType === 'tap_letter_in_word' && activityConfig?.targetWord && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-[10px] font-medium text-yellow-700 mb-1">
                    Click letters to highlight (can select multiple):
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
            </div>
          )}

          {/* Delay (shown for all non-none actions) */}
          {currentAction !== 'none' && (
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                Delay (ms)
              </label>
              <input
                type="number"
                value={value?.delay || ''}
                onChange={(e) => handleDelayChange(e.target.value)}
                placeholder="0"
                min="0"
                max="5000"
                step="100"
                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">
                Wait before executing action (optional)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
