/**
 * BearHoneyActivityForm - Configuration form for Bear Honey activity
 *
 * Students drag honey jars (عَسَل) with the target letter to a hungry bear (دُبّ).
 * Teaches Arabic words for honey and bear.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function BearHoneyActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="targetLetter"
      labels={{
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The letter on honey jars to drag",
        countBasedDescription: "Game ends after feeding X honey jars"
      }}
    />
  );
}
