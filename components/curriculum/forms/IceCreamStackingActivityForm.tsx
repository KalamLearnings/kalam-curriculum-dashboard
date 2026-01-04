/**
 * IceCreamStackingActivityForm - Configuration form for Ice Cream Stacking activity
 *
 * Students drag ice cream scoops with the target letter onto a cone
 * to build an ice cream tower.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function IceCreamStackingActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="targetLetter"
      labels={{
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The letter on scoops to stack",
        countBasedDescription: "Game ends after stacking X scoops"
      }}
    />
  );
}
