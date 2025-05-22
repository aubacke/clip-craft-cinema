
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, AlertCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'processing' | 'completed' | 'failed' | string;
  error?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, error }) => {
  switch(status) {
    case 'processing':
      return (
        <Badge variant="secondary" className="flex items-center gap-1 absolute top-2 left-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Generating</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="success" className="flex items-center gap-1 absolute top-2 left-2">
          <Play className="h-3 w-3" />
          <span>Ready</span>
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="flex items-center gap-1 absolute top-2 left-2">
          <AlertCircle className="h-3 w-3" />
          <span>Failed</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1 absolute top-2 left-2">
          <Clock className="h-3 w-3" />
          <span>Unknown</span>
        </Badge>
      );
  }
});

StatusBadge.displayName = 'StatusBadge';
