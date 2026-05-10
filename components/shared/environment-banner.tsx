'use client';

import { AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Environment } from '@/lib/stores/environmentStore';

interface EnvironmentBannerProps {
  environment: Environment;
  onSwitchRequest: () => void;
  className?: string;
}

export function EnvironmentBanner({
  environment,
  onSwitchRequest,
  className,
}: EnvironmentBannerProps) {
  if (environment === 'dev') {
    return (
      <div
        className={cn('h-1 bg-env-dev', className)}
        title="Development Environment"
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 bg-env-prod text-env-prod-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Production Mode - Changes affect live users
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onSwitchRequest}
        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
      >
        <ArrowRightLeft className="h-3 w-3 mr-1" />
        Switch to DEV
      </Button>
    </div>
  );
}
