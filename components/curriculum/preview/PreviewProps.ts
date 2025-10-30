/**
 * Shared preview component prop types
 */

export interface PreviewProps {
  instruction: {
    en: string;
    ar: string;
  };
  config: Record<string, any>;
}
