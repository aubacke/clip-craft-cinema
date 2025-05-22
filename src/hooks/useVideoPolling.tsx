
import { useState, useEffect, useRef } from 'react';
import { Video } from '@/lib/types';
import { checkVideoPredictionStatus } from '@/services/video/predictionService';
import { toast } from 'sonner';
import { saveVideoToLocalStorage } from '@/services/video/storageService';

// Helper function to truncate text
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const useVideoPolling = (videos: Video[]) => {
  const [updatedVideos, setUpdatedVideos] = useState<Video[]>(videos);
  
  // Use refs to manage the interval and polling state
  const intervalRef = useRef<number | null>(null);
  const isPollingRef = useRef<boolean>(false);
  
  // Cleanup function to clear any active intervals
  const cleanup = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      isPollingRef.current = false;
    }
  };
  
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
      for (let i = 0; i < currentProcessingVideos.length; i++) {
        try {
          const video = currentProcessingVideos[i];
          const updatedVideo = await checkVideoPredictionStatus(video.id);
          
          if (updatedVideo.status !== 'processing') {
            // Preserve the reference image ID and folder ID when updating the video
            updatedVideo.referenceImageId = video.referenceImageId;
            updatedVideo.folderId = video.folderId;
            
            setUpdatedVideos(prev => 
              prev.map(v => 
                v.id === video.id ? updatedVideo : v
              )
            );
            
            saveVideoToLocalStorage(updatedVideo);
            
            if (updatedVideo.status === 'completed') {
              toast.success(`Video "${truncateText(video.prompt, 20)}" is ready!`);
            } else if (updatedVideo.status === 'failed') {
              toast.error(`Video generation failed: ${updatedVideo.error || 'Unknown error'}`);
            }
            
            // If this video is done, check if there are any processing videos left
            const remainingProcessingVideos = updatedVideos.filter(
              v => v.status === 'processing' && v.id !== video.id
            );
            
            if (remainingProcessingVideos.length === 0) {
              cleanup();
              return;
            }
          }
        } catch (error) {
          console.error(`Error checking video ${currentProcessingVideos[i].id} status:`, error);
        }
        
        // Small delay between checking individual videos to avoid API rate limits
        if (i < currentProcessingVideos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    };
    
    // Run the check immediately on mount
    checkVideosStatus();
    
    // Then set the interval for subsequent checks (increased to 8000ms as requested)
    intervalRef.current = setInterval(checkVideosStatus, 8000);
    
    // Clean up the interval when the component unmounts or when videos change
    return () => cleanup();
  }, [videos]);
  
  return updatedVideos;
};
