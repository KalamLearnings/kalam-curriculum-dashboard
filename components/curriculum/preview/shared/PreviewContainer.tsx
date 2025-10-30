/**
 * PreviewContainer Component
 *
 * Reusable container for preview layouts with common patterns
 */

'use client';

interface PreviewContainerProps {
  children: React.ReactNode;
  variant?: 'centered' | 'full';
  background?: string;
}

export function PreviewContainer({
  children,
  variant = 'full',
  background = '',
}: PreviewContainerProps) {
  const baseClasses = 'flex flex-col h-full p-6';
  const variantClasses = variant === 'centered' ? 'items-center justify-center' : '';
  const backgroundClasses = background || '';

  return (
    <div className={`${baseClasses} ${variantClasses} ${backgroundClasses}`.trim()}>
      {children}
    </div>
  );
}
