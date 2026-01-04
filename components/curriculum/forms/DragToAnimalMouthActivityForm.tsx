/**
 * DragToAnimalMouthActivityForm - Configuration form for Drag To Animal Mouth activity
 *
 * Students drag food items with the target letter to feed an animal.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function DragToAnimalMouthActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="targetLetter"
      labels={{
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The letter on food items to drag",
        countBasedDescription: "Game ends after feeding X items"
      }}
    />
  );
}
