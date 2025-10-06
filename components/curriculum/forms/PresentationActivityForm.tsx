import { BaseActivityFormProps } from './ActivityFormProps';

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function FormField({ label, required, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

function TextInput({ value, onChange, required, placeholder, dir = 'ltr' }: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      dir={dir}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

export function PresentationActivityForm({ config, onChange }: BaseActivityFormProps) {
  const letter = config?.letter || '';

  const updateConfig = (updates: Partial<typeof config>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <FormField label="Letter" required hint="The Arabic letter to present">
        <TextInput
          value={letter}
          onChange={(value) => updateConfig({ letter: value })}
          required
          dir="rtl"
          placeholder="أ"
        />
      </FormField>
    </div>
  );
}
