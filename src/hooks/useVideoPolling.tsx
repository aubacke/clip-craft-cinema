
import { useState, useEffect, useRef, useCallback } from 'react';
import { Video } from '@/lib/types';
import { checkVideoPredictionStatus } from '@/services/video/predictionService';
import { toast } from 'sonner';
import { saveVideoToLocalStorage } from '@/services/video/storageService';

// Helper function to truncate text - memoized outside the component
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Create a proper custom hook (not wrapped in React.memo)
export const useVideoPolling = (videos: Video[]) => {
  const [updatedVideos, setUpdatedVideos] = useState<Video[]>(videos);
  
  // Update the type to accept NodeJS.Timeout instead of number
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const errorCountRef = useRef<Record<string, number>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  
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
  
  // Process single video status check with abort control
  const checkVideoStatus = useCallback(async (video: Video) => {
    try {
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      const updatedVideo = await checkVideoPredictionStatus(video.id, signal);
      
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
            toast.error(`Video generation failed: ${errorMessage}`);
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
        console.log(`Request for video ${video.id} was aborted`);
        return false;
      }
      
      // Get current error count for this video
      const videoId = video.id;
      errorCountRef.current[videoId] = (errorCountRef.current[videoId] || 0) + 1;
      
      console.error(`Error checking video ${videoId} status:`, error);
      
      // Only show error to user if it's repeated multiple times
      if (errorCountRef.current[videoId] > 3) {
        // Critical error after multiple failures - only show once
        if (errorCountRef.current[videoId] === 4) {
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
          
          toast.error(userErrorMessage);
        }
        
        // If we've had too many errors for a single video, mark it as failed
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
      }
      return false;
    } finally {
      abortControllerRef.current = null;
    }
  }, []);
  
  // Poll for video status updates
  useEffect(() => {
    // First clean up any existing intervals to prevent duplicates
    cleanup();
    
    const processingVideos = videos.filter(v => v.status === 'processing');
    
    // Only start polling if there are videos being processed
    if (processingVideos.length === 0) {
      return cleanup();
    }
    
    // Flag to track if we're already polling to prevent parallel polling
    if (isPollingRef.current) {
      return;
    }
    
    isPollingRef.current = true;
    
    // Function to check status of all processing videos
    const checkVideosStatus = async () => {
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
        const isComplete = await checkVideoStatus(video);
        
        if (isComplete) {
          completedCount++;
        }
        
        // Small delay between checking individual videos to avoid API rate limits
        if (i < currentProcessingVideos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
    
    // Clean up the interval when the component unmounts or when videos change
    return () => cleanup();
  }, [videos, cleanup, checkVideoStatus]);
  
  return updatedVideos;
};

// Add display name for debugging
useVideoPolling.displayName = 'useVideoPolling';
