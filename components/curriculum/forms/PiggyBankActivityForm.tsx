/**
 * PiggyBankActivityForm - Configuration form for Piggy Bank activity
 *
 * Students drag coins (عُمْلَة) with the target letter into a piggy bank (حَصَّالَة).
 * Teaches Arabic words for coin and piggy bank.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function PiggyBankActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="targetLetter"
      labels={{
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The letter on coins to drag",
        countBasedDescription: "Game ends after collecting X coins"
      }}
    />
  );
}
