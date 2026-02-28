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
  const shapeSequence = config?.shapeSequence || [];
  const totalShapes = config?.totalShapes || 6;

  const updateConfig = (updates: Partial<BreakTimeMiniGameConfig>) => {
    onChange({ ...config, ...updates });
  };

  const breakTypeOptions = [
    { value: 'tracing_lines', label: 'Tracing Lines', icon: '✏️' },
    { value: 'dot_tapping', label: 'Dot Tapping', icon: '👆' },
    { value: 'coloring', label: 'Coloring', icon: '🎨' },
    { value: 'memory_game', label: 'Memory Game', icon: '🧠' },
    { value: 'shape_sequence', label: 'Shape Sequence', icon: '🔷' },
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

  // Card count options (multiples of 2, min 6)
  const cardCountOptions = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  // Toggle shape in sequence
  const toggleShapeInSequence = (shape: ShapeType) => {
    const newSequence = shapeSequence.includes(shape)
      ? shapeSequence.filter(s => s !== shape)
      : [...shapeSequence, shape];
    updateConfig({ shapeSequence: newSequence });
  };

  // Move shape up in sequence
  const moveShapeUp = (index: number) => {
    if (index === 0) return;
    const newSequence = [...shapeSequence];
    [newSequence[index - 1], newSequence[index]] = [newSequence[index], newSequence[index - 1]];
    updateConfig({ shapeSequence: newSequence });
  };

  // Move shape down in sequence
  const moveShapeDown = (index: number) => {
    if (index === shapeSequence.length - 1) return;
    const newSequence = [...shapeSequence];
    [newSequence[index], newSequence[index + 1]] = [newSequence[index + 1], newSequence[index]];
    updateConfig({ shapeSequence: newSequence });
  };

  // Remove shape from sequence
  const removeFromSequence = (index: number) => {
    const newSequence = shapeSequence.filter((_, i) => i !== index);
    updateConfig({ shapeSequence: newSequence });
  };

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
        <FormField label="Card Count" required hint="Total number of cards (must be multiple of 2, minimum 6)">
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

      {variant === 'shape_sequence' && (
        <>
          <FormField label="Shape Sequence" required hint="Select shapes in the order they should be tapped (minimum 2)">
            <div className="grid grid-cols-4 gap-2 mb-4">
              {SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape.value}
                  type="button"
                  onClick={() => toggleShapeInSequence(shape.value)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                    shapeSequence.includes(shape.value)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  )}
                >
                  <span className="text-2xl mb-1">{shape.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{shape.label}</span>
                </button>
              ))}
            </div>

            {shapeSequence.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Tap order (drag to reorder):</p>
                <div className="flex flex-wrap gap-2">
                  {shapeSequence.map((shape, index) => {
                    const shapeInfo = SHAPE_OPTIONS.find(s => s.value === shape);
                    return (
                      <div
                        key={`${shape}-${index}`}
                        className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1"
                      >
                        <span className="text-sm font-bold text-gray-500">{index + 1}.</span>
                        <span className="text-lg">{shapeInfo?.icon}</span>
                        <div className="flex flex-col ml-1">
                          <button
                            type="button"
                            onClick={() => moveShapeUp(index)}
                            disabled={index === 0}
                            className="text-xs text-gray-400 hover:text-blue-500 disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveShapeDown(index)}
                            disabled={index === shapeSequence.length - 1}
                            className="text-xs text-gray-400 hover:text-blue-500 disabled:opacity-30"
                          >
                            ▼
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromSequence(index)}
                          className="text-xs text-red-400 hover:text-red-600 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {shapeSequence.length < 2 && (
              <p className="text-sm text-amber-600 mt-2">
                Please select at least 2 shapes for the sequence.
              </p>
            )}
          </FormField>

          <FormField label="Total Shapes on Screen" hint="Number of shapes displayed (including distractors)">
            <NumberInput
              value={totalShapes}
              onChange={(value) => updateConfig({ totalShapes: value })}
              min={Math.max(4, shapeSequence.length)}
              max={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              {totalShapes - shapeSequence.length} distractor shapes will be shown
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

      {variant === 'shape_sequence' && shapeSequence.length >= 2 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Preview:</strong> Children will tap shapes in this order:{' '}
            {shapeSequence.map((shape, i) => {
              const info = SHAPE_OPTIONS.find(s => s.value === shape);
              return (
                <span key={i}>
                  {info?.icon} {info?.label}
                  {i < shapeSequence.length - 1 ? ' → ' : ''}
                </span>
              );
            })}
          </p>
        </div>
      )}
    </div>
  );
}
