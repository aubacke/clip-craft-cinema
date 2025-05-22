
import { Video } from '@/lib/types';
import { toast } from 'sonner';
import { checkVideoPredictionStatus } from '@/services/video/predictionService';
import { saveVideoToLocalStorage } from '@/services/video/storageService';
import { NetworkError, withRetry } from '@/lib/errorHandling';

/**
 * Helper function to truncate text - memoized outside the component
 */
export const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Calculate exponential backoff delay
 */
export const getBackoffDelay = (retryCount: number, baseDelay = 2000, maxDelay = 60000) => {
  const delay = baseDelay * Math.pow(2, retryCount);
  return Math.min(delay, maxDelay);
};

/**
 * Process a single video status check with error handling
 */
export const checkVideoStatus = async (
  video: Video,
  errorCounts: Record<string, number>,
  setErrorCount: (id: string, count: number) => void,
  setUpdatedVideos: (updaterFn: (prev: Video[]) => Video[]) => void,
  isOnline: boolean,
  abortController?: AbortController
): Promise<boolean> => {
  try {
    // Skip check if offline
    if (!isOnline) {
      return false;
    }
    
    // Use withRetry for automatic retry with exponential backoff
    const updatedVideo = await withRetry(() => checkVideoPredictionStatus(video.id), {
      maxRetries: 2,
      delayMs: 2000,
      backoffFactor: 1.5
    });
    
    // Reset error count on success
    setErrorCount(video.id, 0);
    
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
  } catch (error: any) {
    // Handle aborted requests gracefully
    if (error.name === 'AbortError') {
      return false;
    }
    
    // Get current error count for this video
    const videoId = video.id;
    const currentErrorCount = (errorCounts[videoId] || 0) + 1;
    setErrorCount(videoId, currentErrorCount);
    
    // Log with video context for better debugging
    const errorContext = `Video ID: ${videoId}, Title: "${truncateText(video.prompt, 30)}", Attempt: ${currentErrorCount}`;
    console.error(`Error checking video status. ${errorContext}`, error);
    
    // Check if offline - handle gracefully
    if (!navigator.onLine) {
      // Only show this once per offline event
      if (currentErrorCount === 1) {
        toast.warning("Connection lost. Video processing will continue when you're back online.");
      }
      return false;
    }
    
    // Only show error to user if it's repeated multiple times
    if (currentErrorCount === 3) {
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
            setErrorCount(videoId, 0);
          }
        }
      });
    }
    
    // If we've had too many errors for a single video, mark it as failed after exponential backoff
    if (currentErrorCount > 5) {
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
    const retryCount = currentErrorCount;
    if (retryCount <= 5) {
      const delayMs = getBackoffDelay(retryCount - 1);
      
      // Wait before next polling cycle
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    return false;
  }
};
