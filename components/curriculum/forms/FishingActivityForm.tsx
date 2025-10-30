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
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The target letter to catch",
        countBasedDescription: "Game ends after catching X fish"
      }}
    />
  );
}
