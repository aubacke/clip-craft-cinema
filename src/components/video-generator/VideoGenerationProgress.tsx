
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface VideoGenerationProgressProps {
  status: 'idle' | 'starting' | 'processing' | 'succeeded' | 'failed';
  progress?: number;
  estimatedTime?: number;
  isLoading?: boolean;
}

export const VideoGenerationProgress: React.FC<VideoGenerationProgressProps> = ({
  status,
  progress = 0,
  estimatedTime,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="p-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-1/4" />
      </Card>
    );
  }
  
  if (status === 'idle') {
    return null;
  }
  
  const getStatusBadge = () => {
    switch (status) {
      case 'starting':
        return <Badge variant="secondary">Starting</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'succeeded':
        return <Badge variant="success">Complete</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };
  
  const getProgressValue = () => {
    switch (status) {
      case 'starting':
        return 10;
      case 'processing':
        return progress || 50;
      case 'succeeded':
        return 100;
      case 'failed':
        return 100;
      default:
        return 0;
    }
  };
  
  return (
    <Card className="p-4 space-y-3 animate-fade-in">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Generation Status</h4>
        {getStatusBadge()}
      </div>
      
      <Progress value={getProgressValue()} className="h-2" />
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <div>
          {status === 'processing' && `${Math.round(progress)}% complete`}
          {status === 'starting' && 'Preparing your video...'}
          {status === 'succeeded' && 'Your video is ready!'}
          {status === 'failed' && 'Generation failed. Please try again.'}
        </div>
        
        {estimatedTime && status === 'processing' && (
          <div>Est. {estimatedTime > 60 
            ? `${Math.ceil(estimatedTime / 60)} min` 
            : `${Math.ceil(estimatedTime)} sec`} remaining
          </div>
        )}
      </div>
    </Card>
  );
};
