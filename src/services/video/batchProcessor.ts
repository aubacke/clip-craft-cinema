
import { Video } from '@/lib/types';
import { checkVideoStatus } from './statusUtils';

/**
 * Process a batch of videos to check their status
 */
export const processBatch = async (
  videos: Video[],
  errorCounts: Record<string, number>,
  setErrorCount: (id: string, count: number) => void,
  setUpdatedVideos: (updaterFn: (prev: Video[]) => Video[]) => void,
  isOnline: boolean,
  abortController?: AbortController
): Promise<number> => {
  let completedCount = 0;
  
  // If offline, skip this cycle
  if (!isOnline) return 0;
  
  // Process videos in sequence to avoid rate limiting
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    try {
      const isComplete = await checkVideoStatus(
        video,
        errorCounts,
        setErrorCount,
        setUpdatedVideos,
        isOnline,
        abortController
      );
      
      if (isComplete) {
        completedCount++;
      }
      
      // Small delay between checking individual videos to avoid API rate limits
      if (i < videos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      // Catch and log errors, but continue with the next video
      console.error(`Failed to check status for video ${video.id}:`, error);
    }
  }
  
  return completedCount;
};
