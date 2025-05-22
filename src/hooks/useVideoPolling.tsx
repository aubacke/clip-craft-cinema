
import { useState, useEffect, useRef, useCallback } from 'react';
import { Video } from '@/lib/types';
import { useNetworkStatus } from './useNetworkStatus';
import { processBatch } from '@/services/video/batchProcessor';

/**
 * Hook to poll and update video processing status
 */
export const useVideoPolling = (videos: Video[]) => {
  const [updatedVideos, setUpdatedVideos] = useState<Video[]>(videos);
  
  // Refs to maintain state across renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const errorCountRef = useRef<Record<string, number>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Track online/offline status
  const { isOnline, isOnlineRef } = useNetworkStatus(
    // onOnline callback
    () => {
      // Resume polling if needed
      if (videos.some(v => v.status === 'processing') && !intervalRef.current) {
        startPolling();
      }
    }
  );
  
  // Cleanup function to clear any active intervals and abort fetch requests
  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isPollingRef.current = false;
    }
    
    // Abort any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Helper to update error counts
  const setErrorCount = useCallback((id: string, count: number) => {
    errorCountRef.current[id] = count;
  }, []);
  
  // Function to start polling
  const startPolling = useCallback(() => {
    // Only start if not already polling
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    
    // Function to check status of all processing videos
    const checkVideosStatus = async () => {
      // Create a copy of processingVideos to avoid issues if the array changes during processing
      const currentProcessingVideos = videos.filter(v => v.status === 'processing');
      
      // If no more videos are processing, stop polling
      if (currentProcessingVideos.length === 0) {
        return cleanup();
      }
      
      // Create a new abort controller for this batch
      abortControllerRef.current = new AbortController();
      
      // Process videos in small batches
      const completedCount = await processBatch(
        currentProcessingVideos,
        errorCountRef.current,
        setErrorCount,
        setUpdatedVideos, 
        isOnlineRef.current,
        abortControllerRef.current
      );
      
      // Clean up the abort controller
      abortControllerRef.current = null;
      
      // If all videos we checked are now complete, cleanup
      if (completedCount === currentProcessingVideos.length) {
        cleanup();
      }
    };
    
    // Run the check immediately on mount
    checkVideosStatus();
    
    // Then set the interval for subsequent checks (8000ms as requested)
    intervalRef.current = setInterval(checkVideosStatus, 8000);
  }, [videos, cleanup, setErrorCount, isOnlineRef]);
  
  // Poll for video status updates
  useEffect(() => {
    // First clean up any existing intervals to prevent duplicates
    cleanup();
    
    const processingVideos = videos.filter(v => v.status === 'processing');
    
    // Only start polling if there are videos being processed
    if (processingVideos.length === 0) {
      return cleanup();
    }
    
    // Start polling
    startPolling();
    
    // Clean up the interval when the component unmounts or when videos change
    return () => cleanup();
  }, [videos, cleanup, startPolling]);
  
  return updatedVideos;
};

// Add display name for debugging
useVideoPolling.displayName = 'useVideoPolling';
