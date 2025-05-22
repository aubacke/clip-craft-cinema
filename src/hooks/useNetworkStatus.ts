
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to track network status changes
 */
export const useNetworkStatus = (
  onOnline?: () => void,
  onOffline?: () => void
) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const isOnlineRef = useRef<boolean>(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      setIsOnline(true);
      toast.info("You're back online. Resuming video processing.");
      if (onOnline) onOnline();
    };
    
    const handleOffline = () => {
      isOnlineRef.current = false;
      setIsOnline(false);
      toast.warning("You're offline. Video processing will resume when connection returns.");
      if (onOffline) onOffline();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);
  
  return { isOnline, isOnlineRef };
};
