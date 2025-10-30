import type { ActivityConfig } from '@/lib/types/activity-configs';
import type { Topic } from '@/lib/schemas/curriculum';

// Generic base props for all activity form components
export interface BaseActivityFormProps<T extends ActivityConfig = ActivityConfig> {
  config: T;
  onChange: (config: T) => void;
  topic?: Topic | null; // Optional topic data for auto-populating fields
}
