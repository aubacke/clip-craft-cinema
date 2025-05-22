
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  processingCount: number;
  completedCount: number;
  className?: string;
}

export const StatusIndicator = React.memo<StatusIndicatorProps>(({
  processingCount,
  completedCount,
  className
}) => {
  // If no videos are processing or completed, don't render anything
  if (processingCount === 0 && completedCount === 0) {
    return null;
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {processingCount > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader className="h-3 w-3 animate-spin" />
          <span>{processingCount} generating</span>
        </Badge>
      )}
      
      {completedCount > 0 && (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>{completedCount} ready</span>
        </Badge>
      )}
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';
