/**
 * BalanceScaleActivityForm - Configuration form for Balance Scale activity
 *
 * Students drag items with the target letter onto a scale (مِيزَان) to balance it.
 * Teaches the Arabic word for scale/balance.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function BalanceScaleActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="targetLetter"
      labels={{
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The letter on items to drag",
        countBasedDescription: "Game ends after balancing X items"
      }}
    />
  );
}
