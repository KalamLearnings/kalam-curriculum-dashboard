'use client';

/**
 * Conditional Audio Section Component
 *
 * Allows curriculum creators to configure audio responses that play
 * based on user interactions (success, errors, custom rules).
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AudioSlotCard } from './AudioSlotCard';
import { CustomRuleCard } from './CustomRuleCard';
import type { ConditionalAudioConfig, AudioResponse, AudioRule, ActivityType } from '@kalam/curriculum-schemas';

interface Letter {
  id?: string;
  letter: string;
  name_english: string;
  name_arabic?: string;
  letter_sound?: string;
}

interface ConditionalAudioSectionProps {
  /** Current conditional audio configuration */
  value?: ConditionalAudioConfig;
  /** Callback when configuration changes */
  onChange: (value: ConditionalAudioConfig) => void;
  /** Activity type (affects available conditions) */
  activityType: ActivityType;
  /** Activity config (for context like targetWord) */
  activityConfig?: Record<string, any>;
  /** Letter data for template placeholders */
  letter?: Letter | null;
  /** Selected voice ID for TTS generation */
  voiceId?: string;
}

// Predefined slot configurations
const AUDIO_SLOTS = [
  {
    key: 'onSuccess' as const,
    label: 'On Success',
    description: 'Plays when activity completed successfully',
    icon: '🎉',
    color: 'green',
  },
  {
    key: 'onPartialSuccess' as const,
    label: 'On Partial Success',
    description: 'Plays when partially correct (e.g., found 1 of 2 targets)',
    icon: '👍',
    color: 'blue',
  },
  {
    key: 'onFirstWrongAttempt' as const,
    label: '1st Wrong Attempt',
    description: 'Encouragement after first mistake',
    icon: '💪',
    color: 'yellow',
  },
  {
    key: 'onSecondWrongAttempt' as const,
    label: '2nd Wrong Attempt',
    description: 'Hint after second mistake',
    icon: '💡',
    color: 'orange',
  },
  {
    key: 'onThirdWrongAttempt' as const,
    label: '3rd Wrong Attempt',
    description: 'More explicit guidance',
    icon: '🎯',
    color: 'red',
  },
  {
    key: 'onCompletion' as const,
    label: 'On Completion',
    description: 'Plays when activity ends (regardless of outcome)',
    icon: '✅',
    color: 'gray',
  },
] as const;

type SlotKey = typeof AUDIO_SLOTS[number]['key'];

/**
 * Count how many slots/rules are configured
 */
function countConfigured(config?: ConditionalAudioConfig): number {
  if (!config) return 0;

  let count = 0;

  // Count predefined slots
  AUDIO_SLOTS.forEach((slot) => {
    if (config[slot.key]?.audio_url) count++;
  });

  // Count enabled rules with audio
  if (config.rules) {
    count += config.rules.filter((r) => r.enabled && r.response.audio_url).length;
  }

  return count;
}

export function ConditionalAudioSection({
  value = {},
  onChange,
  activityType,
  activityConfig,
  letter,
  voiceId,
}: ConditionalAudioSectionProps) {
  const [activeTab, setActiveTab] = useState<'slots' | 'rules'>('slots');
  const [isExpanded, setIsExpanded] = useState(false);

  const configuredCount = countConfigured(value);
  const configuredSlots = AUDIO_SLOTS.filter((slot) => value[slot.key]?.audio_url).length;
  const configuredRules = value.rules?.filter((r) => r.enabled && r.response.audio_url).length || 0;

  // Update a slot
  const handleSlotChange = (slotKey: SlotKey, response: AudioResponse | undefined) => {
    const newValue = { ...value };
    if (response) {
      newValue[slotKey] = response;
    } else {
      delete newValue[slotKey];
    }
    onChange(newValue);
  };

  // Add a new rule
  const addRule = () => {
    const newRule: AudioRule = {
      id: crypto.randomUUID(),
      name: 'New Rule',
      condition: { event: 'tap' },
      response: { text: '' },
      priority: 50,
      enabled: true,
    };
    onChange({
      ...value,
      rules: [...(value.rules || []), newRule],
    });
  };

  // Update a rule
  const updateRule = (index: number, updated: AudioRule) => {
    const rules = [...(value.rules || [])];
    rules[index] = updated;
    onChange({ ...value, rules });
  };

  // Delete a rule
  const deleteRule = (index: number) => {
    const rules = (value.rules || []).filter((_, i) => i !== index);
    onChange({ ...value, rules });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">
              Conditional Audio Responses
            </div>
            <div className="text-xs text-gray-500">
              Configure audio that plays based on student interactions
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {configuredCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
              {configuredCount} configured
            </span>
          )}
          <svg
            className={cn(
              'h-5 w-5 text-gray-400 transition-transform',
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
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('slots')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'slots'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Response Slots
              {configuredSlots > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                  {configuredSlots}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'rules'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Custom Rules
              {configuredRules > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                  {configuredRules}
                </span>
              )}
            </button>
          </div>

          {/* Slots Tab */}
          {activeTab === 'slots' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                These slots cover common feedback patterns. Expand each to configure audio.
              </p>
              {AUDIO_SLOTS.map((slot) => (
                <AudioSlotCard
                  key={slot.key}
                  slotKey={slot.key}
                  label={slot.label}
                  description={slot.description}
                  icon={slot.icon}
                  value={value[slot.key]}
                  onChange={(response) => handleSlotChange(slot.key, response)}
                  letter={letter}
                  voiceId={voiceId}
                />
              ))}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Create custom rules for activity-specific scenarios (e.g., when a specific letter form is tapped).
              </p>

              {(value.rules || []).map((rule, index) => (
                <CustomRuleCard
                  key={rule.id}
                  rule={rule}
                  onChange={(updated) => updateRule(index, updated)}
                  onDelete={() => deleteRule(index)}
                  activityType={activityType}
                  activityConfig={activityConfig}
                  letter={letter}
                  voiceId={voiceId}
                />
              ))}

              <button
                type="button"
                onClick={addRule}
                disabled={(value.rules?.length || 0) >= 10}
                className={cn(
                  'w-full py-2 px-4 border-2 border-dashed rounded-lg text-sm font-medium transition-colors',
                  (value.rules?.length || 0) >= 10
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50'
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Custom Rule
                </span>
              </button>

              {(value.rules?.length || 0) >= 10 && (
                <p className="text-xs text-gray-500 text-center">
                  Maximum 10 custom rules allowed
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
