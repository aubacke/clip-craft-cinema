
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  type: 'text' | 'select' | 'parameters' | 'button' | 'form';
  count?: number;
}

export const LoadingState = React.memo<LoadingStateProps>(({ 
  type, 
  count = 1 
}) => {
  const renderSkeletons = () => {
    switch (type) {
      case 'text':
        return <Skeleton className="h-24 w-full rounded-md" />;
      case 'select':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={`select-skeleton-${i}`} className="h-16 w-full rounded-md" />
            ))}
          </div>
        );
      case 'parameters':
        return (
          <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
              <div key={`param-skeleton-${i}`} className="space-y-2">
                <Skeleton className="h-4 w-1/4 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        );
      case 'button':
        return <Skeleton className="h-10 w-full rounded-md" />;
      case 'form':
        return (
          <div className="space-y-8">
            <Skeleton className="h-24 w-full rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={`form-select-${i}`} className="h-16 w-full rounded-md" />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`form-param-${i}`} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderSkeletons()}</>;
});

LoadingState.displayName = 'LoadingState';
