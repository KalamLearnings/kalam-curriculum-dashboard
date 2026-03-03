import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function FishingActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      labels={{
        targetLetterLabel: "Target Letters",
        targetLetterHint: "The letters to catch on fish",
        targetCountHint: "Number of fish to catch",
      }}
      targetLetterMultiSelect={true}
      showLetterPositions={false}
    />
  );
}
