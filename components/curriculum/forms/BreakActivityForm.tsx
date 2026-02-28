import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { FormField, NumberInput } from './FormField';
import { OptionSelector } from './OptionSelector';
import { cn } from '@/lib/utils';
import type { BreakTimeMiniGameConfig, ShapeType } from '@/lib/types/activity-configs';

const SHAPE_OPTIONS: { value: ShapeType; label: string; icon: string }[] = [
  { value: 'circle', label: 'Circle', icon: '⭕' },
  { value: 'square', label: 'Square', icon: '⬜' },
  { value: 'triangle', label: 'Triangle', icon: '🔺' },
  { value: 'star', label: 'Star', icon: '⭐' },
  { value: 'rectangle', label: 'Rectangle', icon: '▬' },
  { value: 'diamond', label: 'Diamond', icon: '🔷' },
  { value: 'oval', label: 'Oval', icon: '⬭' },
  { value: 'heart', label: 'Heart', icon: '❤️' },
];

export function BreakActivityForm({ config, onChange }: BaseActivityFormProps<BreakTimeMiniGameConfig>) {
  const variant = config?.variant || 'tracing_lines';
  const duration = config?.duration || 30;
  const color = config?.color;
  const cardCount = config?.cardCount || 6;
  const targetShape = config?.targetShape;
  const targetCount = config?.targetCount || 5;
  const totalShapes = config?.totalShapes || 10;

  const updateConfig = (updates: Partial<BreakTimeMiniGameConfig>) => {
    onChange({ ...config, ...updates });
  };

  const breakTypeOptions = [
    { value: 'tracing_lines', label: 'Tracing Lines', icon: '✏️' },
    { value: 'dot_tapping', label: 'Dot Tapping', icon: '👆' },
    { value: 'coloring', label: 'Coloring', icon: '🎨' },
    { value: 'memory_game', label: 'Memory Game', icon: '🧠' },
    { value: 'tap_shapes', label: 'Tap Shapes', icon: '🔷' },
  ];

  // Color options for dot_tapping (matches COLOR_NAME_MAP in mobile app)
  const colorOptions = [
    { value: 'red', label: 'Red', icon: '🔴' },
    { value: 'orange', label: 'Orange', icon: '🟠' },
    { value: 'yellow', label: 'Yellow', icon: '🟡' },
    { value: 'green', label: 'Green', icon: '🟢' },
    { value: 'blue', label: 'Blue', icon: '🔵' },
    { value: 'purple', label: 'Purple', icon: '🟣' },
    { value: 'pink', label: 'Pink', icon: '🩷' },
  ];

  // Only coloring needs duration
  const needsDuration = variant === 'coloring';

  // Card count options (multiples of 2, min 6, max 12)
  const cardCountOptions = [6, 8, 10, 12];

  return (
    <div className="space-y-4">

      <FormField label="Break Type" required hint="Type of break activity">
        <OptionSelector
          value={variant}
          onChange={(value) => updateConfig({ variant: value as BreakTimeMiniGameConfig['variant'] })}
          options={breakTypeOptions}
        />
      </FormField>

      {variant === 'dot_tapping' && (
        <FormField label="Target Color" required hint="Color of dots the child should tap">
          <OptionSelector
            value={color || ''}
            onChange={(value) => updateConfig({ color: value })}
            options={colorOptions}
          />
        </FormField>
      )}

      {variant === 'memory_game' && (
        <FormField label="Card Count" required hint="Total number of cards (must be multiple of 2, 6-12)">
          <div className="grid grid-cols-5 gap-2">
            {cardCountOptions.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => updateConfig({ cardCount: count })}
                className={cn(
                  'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  cardCount === count
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                )}
              >
                {count}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {cardCount} cards = {cardCount / 2} pairs to match
          </p>
        </FormField>
      )}

      {variant === 'tap_shapes' && (
        <>
          <FormField label="Target Shape" required hint="The shape children should tap">
            <div className="grid grid-cols-4 gap-2">
              {SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape.value}
                  type="button"
                  onClick={() => updateConfig({ targetShape: shape.value })}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                    targetShape === shape.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  )}
                >
                  <span className="text-2xl mb-1">{shape.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{shape.label}</span>
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Target Count" hint="How many target shapes to find">
            <NumberInput
              value={targetCount}
              onChange={(value) => updateConfig({ targetCount: value })}
              min={3}
              max={10}
            />
          </FormField>

          <FormField label="Total Shapes on Screen" hint="Total shapes displayed (including distractors)">
            <NumberInput
              value={totalShapes}
              onChange={(value) => updateConfig({ totalShapes: value })}
              min={targetCount + 2}
              max={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              {totalShapes - targetCount} distractor shapes will be shown
            </p>
          </FormField>
        </>
      )}

      {needsDuration && (
        <FormField label="Duration (seconds)" hint="How long the break activity should last">
          <NumberInput
            value={duration}
            onChange={(value) => updateConfig({ duration: value })}
            min={10}
          />
        </FormField>
      )}

      {variant === 'tap_shapes' && targetShape && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> Children will tap all{' '}
            <span className="text-lg">{SHAPE_OPTIONS.find(s => s.value === targetShape)?.icon}</span>{' '}
            <strong>{SHAPE_OPTIONS.find(s => s.value === targetShape)?.label}s</strong>{' '}
            ({targetCount} targets among {totalShapes} total shapes)
          </p>
        </div>
      )}
    </div>
  );
}
