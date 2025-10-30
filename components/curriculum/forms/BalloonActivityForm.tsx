import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function BalloonActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="correctLetter"
      labels={{
        targetLetterLabel: "Correct Letter",
        targetLetterHint: "The target letter to find",
        countBasedDescription: "Game ends after popping X balloons"
      }}
    />
  );
}
