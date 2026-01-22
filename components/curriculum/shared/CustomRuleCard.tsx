'use client';

/**
 * Custom Rule Card Component
 *
 * Configures a custom audio rule with condition matching and response.
 * Used for activity-specific scenarios beyond the predefined slots.
 */

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { hasTemplates, resolveTemplateText } from '@/lib/utils/templateResolver';
import { FollowUpActionsPanel } from './FollowUpActionsPanel';
import { AudioControls } from './AudioControls';
import { useAudioGeneration } from '@/lib/hooks/useAudioGeneration';
import type {
  AudioRule,
  AudioTriggerEvent,
  AudioFollowUp,
  ActivityType,
} from '@kalam/curriculum-schemas';

interface Letter {
  id?: string;
  letter: string;
  name_english: string;
  name_arabic?: string;
  letter_sound?: string;
}

interface CustomRuleCardProps {
  /** The rule configuration */
  rule: AudioRule;
  /** Callback when rule changes */
  onChange: (rule: AudioRule) => void;
  /** Callback to delete this rule */
  onDelete: () => void;
  /** Activity type for context-aware conditions */
  activityType: ActivityType;
  /** Activity config (for context like targetWord) */
  activityConfig?: Record<string, any>;
  /** Letter data for template resolution */
  letter?: Letter | null;
  /** Voice ID for TTS generation */
  voiceId?: string;
}

const TRIGGER_EVENTS: { value: AudioTriggerEvent; label: string; description: string }[] = [
  { value: 'tap', label: 'Tap', description: 'User taps on an element' },
  { value: 'drag', label: 'Drag', description: 'User drags an element' },
  { value: 'drop', label: 'Drop', description: 'User drops an element' },
  { value: 'swipe', label: 'Swipe', description: 'User swipes on screen' },
  { value: 'trace_complete', label: 'Trace Complete', description: 'User finishes tracing' },
  { value: 'speech_result', label: 'Speech Result', description: 'Speech recognition result' },
  { value: 'timer', label: 'Timer', description: 'Time-based trigger' },
  { value: 'custom', label: 'Custom', description: 'Custom event name' },
];

export function CustomRuleCard({
  rule,
  onChange,
  onDelete,
  activityType,
  activityConfig,
  letter,
  voiceId,
}: CustomRuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use the shared audio generation hook
  const {
    isGenerating,
    isPlaying,
    hasAudio,
    generateAudio,
    playAudio,
  } = useAudioGeneration({
    language: 'en',
    text: rule.response.text || '',
    existingAudioUrl: rule.response.audio_url,
    letter,
    voiceId,
  });

  // Update rule field
  const updateRule = (updates: Partial<AudioRule>) => {
    onChange({ ...rule, ...updates });
  };

  // Update condition
  const updateCondition = (updates: Partial<AudioRule['condition']>) => {
    onChange({
      ...rule,
      condition: { ...rule.condition, ...updates },
    });
  };

  // Update response
  const updateResponse = (updates: Partial<AudioRule['response']>) => {
    onChange({
      ...rule,
      response: { ...rule.response, ...updates },
    });
  };

  // Insert voice tag at cursor
  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const text = rule.response.text || '';
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + (before && !before.endsWith(' ') ? ' ' : '') + tag + ' ' + after;

    updateResponse({ text: newText });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tag.length + (before && !before.endsWith(' ') ? 2 : 1);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle follow-up change
  const handleFollowUpChange = (followUp: AudioFollowUp | undefined) => {
    updateResponse({ followUp });
  };

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        rule.enabled ? 'border-purple-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-50 to-white">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <svg
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform',
              isExpanded && 'rotate-90'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <input
            type="text"
            value={rule.name}
            onChange={(e) => updateRule({ name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm font-medium bg-transparent border-none focus:ring-0 p-0"
            placeholder="Rule name..."
          />
        </button>

        <div className="flex items-center gap-2">
          {/* Enable/Disable Toggle */}
          <button
            type="button"
            onClick={() => updateRule({ enabled: !rule.enabled })}
            className={cn(
              'w-8 h-4 rounded-full transition-colors relative',
              rule.enabled ? 'bg-purple-500' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow',
                rule.enabled ? 'left-4' : 'left-0.5'
              )}
            />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
          {/* Condition Section */}
          <div className="pt-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              When...
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {/* Event Type */}
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                  Event
                </label>
                <select
                  value={rule.condition.event}
                  onChange={(e) =>
                    updateCondition({ event: e.target.value as AudioTriggerEvent })
                  }
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                >
                  {TRIGGER_EVENTS.map((event) => (
                    <option key={event.value} value={event.value}>
                      {event.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attempt Number */}
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                  Attempt #
                </label>
                <input
                  type="number"
                  value={rule.condition.attemptNumber || ''}
                  onChange={(e) =>
                    updateCondition({
                      attemptNumber: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="Any"
                  min="1"
                  max="10"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Target Configuration */}
            <div className="mt-2 space-y-2">
              <label className="block text-[10px] font-medium text-gray-600">
                Target Element (optional)
              </label>

              {/* Word Letter Index Helper - shows for tap activities with a target word */}
              {activityType === 'tap_letter_in_word' && activityConfig?.targetWord && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-[10px] font-medium text-blue-700 mb-1">
                    Word Letter Indices (click to use):
                  </div>
                  <div className="flex flex-row-reverse justify-center gap-1 font-arabic text-lg">
                    {[...activityConfig.targetWord].map((char: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          updateCondition({
                            target: {
                              ...rule.condition.target,
                              elementId: `letter_${index}`,
                            },
                          });
                        }}
                        className={cn(
                          'flex flex-col items-center px-2 py-1 rounded border transition-colors',
                          rule.condition.target?.elementId === `letter_${index}`
                            ? 'bg-blue-500 text-white border-blue-600'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        )}
                      >
                        <span className="text-base">{char}</span>
                        <span className="text-[9px] opacity-70">{index + 1}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-[9px] text-blue-600 mt-1 text-center">
                    Selected: {rule.condition.target?.elementId || 'none'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={rule.condition.target?.elementId || ''}
                    onChange={(e) =>
                      updateCondition({
                        target: {
                          ...rule.condition.target,
                          elementId: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="Element ID"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={rule.condition.target?.elementType || ''}
                    onChange={(e) =>
                      updateCondition({
                        target: {
                          ...rule.condition.target,
                          elementType: e.target.value || undefined,
                        },
                      })
                    }
                    placeholder="Element Type"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Properties */}
              <div>
                <input
                  type="text"
                  value={
                    rule.condition.target?.properties
                      ? Object.entries(rule.condition.target.properties)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(', ')
                      : ''
                  }
                  onChange={(e) => {
                    const props: Record<string, string> = {};
                    e.target.value.split(',').forEach((pair) => {
                      const [key, val] = pair.split('=').map((s) => s.trim());
                      if (key && val) props[key] = val;
                    });
                    updateCondition({
                      target: {
                        ...rule.condition.target,
                        properties: Object.keys(props).length > 0 ? props : undefined,
                      },
                    });
                  }}
                  placeholder="Properties: form=isolated, position=initial"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Response Section */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Then play...
            </h4>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={rule.response.text || ''}
              onChange={(e) => updateResponse({ text: e.target.value })}
              placeholder="Enter the audio text..."
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />

            {/* Template Preview */}
            {hasTemplates(rule.response.text || '') && letter && (
              <div className="mt-2 px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="flex items-start gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="text-blue-700 font-medium">Preview:</div>
                    <div className="text-blue-900">
                      "{resolveTemplateText(rule.response.text || '', letter)}"
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Controls (reusable component) */}
            <div className="mt-2">
              <AudioControls
                text={rule.response.text || ''}
                language="en"
                isGenerating={isGenerating}
                hasAudio={hasAudio}
                onGenerate={generateAudio}
                onPlay={playAudio}
                onInsertTag={insertTag}
              />
            </div>
          </div>

          {/* Follow-up Actions */}
          <FollowUpActionsPanel
            value={rule.response.followUp}
            onChange={handleFollowUpChange}
            activityType={activityType}
            activityConfig={activityConfig}
          />
        </div>
      )}
    </div>
  );
}
