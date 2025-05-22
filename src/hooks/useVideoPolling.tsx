
import { useState, useEffect, useRef, useCallback } from 'react';
import { Video } from '@/lib/types';
import { checkVideoPredictionStatus } from '@/services/video/predictionService';
import { toast } from 'sonner';
import { saveVideoToLocalStorage } from '@/services/video/storageService';
import { NetworkError, withRetry } from '@/lib/errorHandling';

// Helper function to truncate text - memoized outside the component
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Create a proper custom hook
export const useVideoPolling = (videos: Video[]) => {
  const [updatedVideos, setUpdatedVideos] = useState<Video[]>(videos);
  
  // Update the type to accept NodeJS.Timeout instead of number
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const errorCountRef = useRef<Record<string, number>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const isOnlineRef = useRef<boolean>(navigator.onLine);
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      toast.info("You're back online. Resuming video processing.");
      // Resume polling if needed
      if (videos.some(v => v.status === 'processing') && !intervalRef.current) {
        startPolling();
      }
    };
    
    const handleOffline = () => {
      isOnlineRef.current = false;
      toast.warning("You're offline. Video processing will resume when connection returns.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [videos]);
  
  // Exponential backoff parameters
  const getBackoffDelay = useCallback((retryCount: number, baseDelay = 2000, maxDelay = 60000) => {
    const delay = baseDelay * Math.pow(2, retryCount);
    return Math.min(delay, maxDelay);
  }, []);
  
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
  
  // Process single video status check with abort control and improved error handling
  const checkVideoStatus = useCallback(async (video: Video) => {
    try {
      // Skip check if offline
      if (!isOnlineRef.current) {
        return false;
      }
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Use withRetry for automatic retry with exponential backoff
      const updatedVideo = await withRetry(() => checkVideoPredictionStatus(video.id), {
        maxRetries: 2,
        delayMs: 2000,
        backoffFactor: 1.5
      });
      
      // Reset error count on success
      errorCountRef.current[video.id] = 0;
      
      if (updatedVideo.status !== 'processing') {
        // Preserve the reference image ID and folder ID when updating the video
        updatedVideo.referenceImageId = video.referenceImageId;
        updatedVideo.folderId = video.folderId;
        
        setUpdatedVideos(prev => 
          prev.map(v => v.id === video.id ? updatedVideo : v)
        );
        
        saveVideoToLocalStorage(updatedVideo);
        
        if (updatedVideo.status === 'completed') {
          toast.success(`Video "${truncateText(video.prompt, 20)}" is ready!`);
        } else if (updatedVideo.status === 'failed') {
          // Only show errors to the user if there's a meaningful error message
          if (updatedVideo.error) {
            // Format error message to be more user-friendly
            let errorMessage = updatedVideo.error;
            if (errorMessage.includes("API key")) {
              errorMessage = "API authentication failed. Please check your API key.";
            } else if (errorMessage.includes("timeout")) {
              errorMessage = "The request timed out. Your video might take longer than expected.";
            }
            toast.error(`Video generation failed: ${errorMessage}`, {
              action: {
                label: 'Retry',
                onClick: () => {
                  // Implement retry logic here
                  const retryVideo: Video = {
                    ...updatedVideo,
                    status: 'processing',
                    error: undefined
                  };
                  setUpdatedVideos(prev => 
                    prev.map(v => v.id === video.id ? retryVideo : v)
                  );
                  saveVideoToLocalStorage(retryVideo);
                }
              }
            });
          } else {
            toast.error(`Video "${truncateText(video.prompt, 20)}" failed. Please try again.`);
          }
        }
        
        return true; // Return true to indicate this video is complete
      }
      return false; // Return false to indicate this video is still processing
    } catch (error: any) { // Explicitly type error as any for type safety
      // Handle aborted requests gracefully
      if (error.name === 'AbortError') {
        return false;
      }
      
      // Get current error count for this video
      const videoId = video.id;
      errorCountRef.current[videoId] = (errorCountRef.current[videoId] || 0) + 1;
      
      // Log with video context for better debugging
      const errorContext = `Video ID: ${videoId}, Title: "${truncateText(video.prompt, 30)}", Attempt: ${errorCountRef.current[videoId]}`;
      console.error(`Error checking video status. ${errorContext}`, error);
      
      // Check if offline - handle gracefully
      if (!navigator.onLine) {
        isOnlineRef.current = false;
        // Only show this once per offline event
        if (errorCountRef.current[videoId] === 1) {
          toast.warning("Connection lost. Video processing will continue when you're back online.");
        }
        return false;
      }
      
      // Only show error to user if it's repeated multiple times
      if (errorCountRef.current[videoId] === 3) {
        const errorMessage = error.message && typeof error.message === 'string'
          ? error.message
          : 'Unknown error';
        
        // Format better error message based on error type
        let userErrorMessage = "Error checking video status.";
        if (errorMessage.includes("Authentication") || errorMessage.includes("401") || errorMessage.includes("403")) {
          userErrorMessage = "Authentication error. Please check your API key.";
        } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
          userErrorMessage = "Network error. Please check your internet connection.";
        } else if (errorMessage.includes("not found") || errorMessage.includes("404")) {
          userErrorMessage = "Video tracking information not found.";
        }
        
        toast.error(userErrorMessage, {
          action: {
            label: 'Retry Now',
            onClick: () => {
              // Reset error count to force immediate retry
              errorCountRef.current[videoId] = 0;
              // Force checkVideoStatus to run immediately
              checkVideoStatus(video).catch(console.error);
            }
          }
        });
      }
      
      // If we've had too many errors for a single video, mark it as failed after exponential backoff
      if (errorCountRef.current[videoId] > 5) {
        const failedVideo: Video = {
          ...video,
          status: 'failed',
          error: "Lost connection to video generation service"
        };
        
        setUpdatedVideos(prev => 
          prev.map(v => v.id === videoId ? failedVideo : v)
        );
        
        saveVideoToLocalStorage(failedVideo);
        return true; // This video is now complete (failed)
      }
      
      // Apply increasing backoff for retries based on error count
      const retryCount = errorCountRef.current[videoId];
      if (retryCount <= 5) {
        const delayMs = getBackoffDelay(retryCount - 1);
        
        // Wait before next polling cycle
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      return false;
    } finally {
      abortControllerRef.current = null;
    }
  }, [getBackoffDelay]);
  
  // Function to start polling
  const startPolling = useCallback(() => {
    // Only start if not already polling
    if (isPollingRef.current) return;
    
    isPollingRef.current = true;
    
    // Function to check status of all processing videos
    const checkVideosStatus = async () => {
      // If offline, skip this cycle
      if (!isOnlineRef.current) return;
      
      // Create a copy of processingVideos to avoid issues if the array changes during processing
      const currentProcessingVideos = videos.filter(v => v.status === 'processing');
      
      // If no more videos are processing, stop polling
      if (currentProcessingVideos.length === 0) {
        return cleanup();
      }
      
      // Process videos in small batches to avoid rate limiting
      let completedCount = 0;
      
      for (let i = 0; i < currentProcessingVideos.length; i++) {
        const video = currentProcessingVideos[i];
        try {
          const isComplete = await checkVideoStatus(video);
          
          if (isComplete) {
            completedCount++;
          }
          
          // Small delay between checking individual videos to avoid API rate limits
          if (i < currentProcessingVideos.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          // Catch and log errors, but continue with the next video
          console.error(`Failed to check status for video ${video.id}:`, error);
        }
      }
      
      // If all videos we checked are now complete, cleanup
      if (completedCount === currentProcessingVideos.length) {
        cleanup();
      }
    };
    
    // Run the check immediately on mount
    checkVideosStatus();
    
    // Then set the interval for subsequent checks (8000ms as requested)
    intervalRef.current = setInterval(checkVideosStatus, 8000);
  }, [videos, cleanup, checkVideoStatus]);
  
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
