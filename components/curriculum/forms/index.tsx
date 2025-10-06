import { BaseActivityFormProps } from './ActivityFormProps';
import { IntroActivityForm } from './IntroActivityForm';
import { TapActivityForm } from './TapActivityForm';
import { WriteActivityForm } from './WriteActivityForm';
import { NameBuilderActivityForm } from './NameBuilderActivityForm';
import { BalloonActivityForm } from './BalloonActivityForm';
import { MultipleChoiceActivityForm } from './MultipleChoiceActivityForm';
import { DragDropActivityForm } from './DragDropActivityForm';
import { FishingActivityForm } from './FishingActivityForm';
import { PizzaActivityForm } from './PizzaActivityForm';
import { BreakActivityForm } from './BreakActivityForm';
import type { ArticleType } from '@/lib/schemas/curriculum';

// Map of activity types to their form components
export const activityFormComponents: Record<ArticleType, React.ComponentType<BaseActivityFormProps>> = {
  intro: IntroActivityForm,
  tap: TapActivityForm,
  write: WriteActivityForm,
  word_builder: NameBuilderActivityForm,
  name_builder: NameBuilderActivityForm,
  balloon: BalloonActivityForm,
  multiple_choice: MultipleChoiceActivityForm,
  drag_drop: DragDropActivityForm,
  fishing: FishingActivityForm,
  pizza: PizzaActivityForm,
  break: BreakActivityForm,
};

// Generic fallback form for activity types without custom forms yet
function GenericActivityForm({ config, onChange }: BaseActivityFormProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Configuration (JSON)
      </label>
      <textarea
        value={JSON.stringify(config || {}, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch {
            // Invalid JSON, don't update
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        rows={8}
      />
      <p className="text-xs text-gray-500 mt-1">
        Activity-specific configuration as JSON (custom form coming soon)
      </p>
    </div>
  );
}

export function getActivityFormComponent(type: ArticleType) {
  return activityFormComponents[type] || GenericActivityForm;
}
