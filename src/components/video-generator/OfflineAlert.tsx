
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

interface OfflineAlertProps {
  isOffline: boolean;
}

export const OfflineAlert = React.memo<OfflineAlertProps>(({ isOffline }) => {
  if (!isOffline) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>You're offline</AlertTitle>
      <AlertDescription>
        Video generation requires an internet connection. Please check your network and try again.
      </AlertDescription>
    </Alert>
  );
});

OfflineAlert.displayName = 'OfflineAlert';
