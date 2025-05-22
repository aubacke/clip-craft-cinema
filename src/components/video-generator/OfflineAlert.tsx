
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineAlertProps {
  isOffline: boolean;
  onRetry?: () => void;
}

export const OfflineAlert = React.memo<OfflineAlertProps>(({ 
  isOffline,
  onRetry 
}) => {
  if (!isOffline) return null;
  
  return (
    <Alert variant="destructive" className="mb-4 animate-fade-in">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>You're offline</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>Video generation requires an internet connection. Please check your network and try again.</p>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={() => window.location.reload()}
          >
            Refresh page
          </Button>
          
          {onRetry && (
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs" 
              onClick={onRetry}
            >
              Try again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
});

OfflineAlert.displayName = 'OfflineAlert';
