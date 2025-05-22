
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface StatusIndicatorProps {
  processingCount: number;
  completedCount: number;
  className?: string;
  onClickProcessing?: () => void;
  onClickCompleted?: () => void;
}

const StatusIndicator = React.memo<StatusIndicatorProps>(({
  processingCount,
  completedCount,
  className,
  onClickProcessing,
  onClickCompleted
}) => {
  // If no videos are processing or completed, don't render anything
  if (processingCount === 0 && completedCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn("flex gap-2", className)}>
        {processingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1" 
                interactive={!!onClickProcessing}
                onClick={onClickProcessing}
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{processingCount} generating</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Videos currently being generated</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {completedCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="default" 
                className="flex items-center gap-1" 
                interactive={!!onClickCompleted}
                onClick={onClickCompleted}
              >
                <CheckCircle className="h-3 w-3" />
                <span>{completedCount} ready</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Videos ready to view</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

export { StatusIndicator };
