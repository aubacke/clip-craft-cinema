
import { useState, useEffect } from 'react';
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
  
  // Poll for video status updates
  useEffect(() => {
    const processingVideos = videos.filter(v => v.status === 'processing');
    
    if (processingVideos.length === 0) return;
    
    const intervalId = setInterval(async () => {
      for (const video of processingVideos) {
        try {
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
          }
        } catch (error) {
          console.error(`Error checking video ${video.id} status:`, error);
        }
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [videos]);
  
  return updatedVideos;
};
