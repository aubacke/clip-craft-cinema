
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
}

export const ErrorFallback = React.memo<ErrorFallbackProps>(({ 
  error, 
  resetErrorBoundary,
  title = "Something went wrong",
  description
}) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>{description || error.message}</p>
        {resetErrorBoundary && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetErrorBoundary}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
});

ErrorFallback.displayName = 'ErrorFallback';
