/**
 * FeedBabyActivityForm - Configuration form for Feed Baby activity
 *
 * Students drag baby bottles (رَضَّاعَة) with the target letter to feed a baby.
 * Teaches the Arabic word for baby bottle.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function FeedBabyActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="targetLetter"
      labels={{
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The letter on bottles to drag",
        countBasedDescription: "Game ends after feeding X bottles"
      }}
    />
  );
}
