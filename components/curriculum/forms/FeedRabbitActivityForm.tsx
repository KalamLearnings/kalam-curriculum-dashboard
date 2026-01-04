/**
 * FeedRabbitActivityForm - Configuration form for Feed Rabbit activity
 *
 * Students drag carrots (جَزَر) with the target letter to feed a rabbit.
 * Teaches the Arabic word for carrot.
 */

import React from 'react';
import { BaseActivityFormProps } from './ActivityFormProps';
import { TargetLetterWithDistractorsForm } from './shared/TargetLetterWithDistractorsForm';

export function FeedRabbitActivityForm({ config, onChange, topic }: BaseActivityFormProps) {
  return (
    <TargetLetterWithDistractorsForm
      config={config}
      onChange={onChange}
      topic={topic}
      targetLetterField="targetLetter"
      labels={{
        targetLetterLabel: "Target Letter",
        targetLetterHint: "The letter on carrots to drag",
        countBasedDescription: "Game ends after feeding X carrots"
      }}
    />
  );
}
