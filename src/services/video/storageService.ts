
import { Video, Folder } from '@/lib/types';

// Simulate saving to local storage until we have Supabase integration
export const saveVideoToLocalStorage = (video: Video): void => {
  try {
    const savedVideos = localStorage.getItem('savedVideos');
    const videos: Video[] = savedVideos ? JSON.parse(savedVideos) : [];
    
    const existingIndex = videos.findIndex(v => v.id === video.id);
    if (existingIndex >= 0) {
      videos[existingIndex] = video;
    } else {
      videos.push(video);
    }
    
    localStorage.setItem('savedVideos', JSON.stringify(videos));
  } catch (error) {
    console.error("Error saving video:", error);
  }
};

export const getVideosFromLocalStorage = (): Video[] => {
  try {
    const savedVideos = localStorage.getItem('savedVideos');
    return savedVideos ? JSON.parse(savedVideos) : [];
  } catch (error) {
    console.error("Error getting videos:", error);
    return [];
  }
};

export const deleteVideoFromLocalStorage = (videoId: string): void => {
  try {
    const savedVideos = localStorage.getItem('savedVideos');
    if (!savedVideos) return;
    
    const videos: Video[] = JSON.parse(savedVideos);
    const newVideos = videos.filter(v => v.id !== videoId);
    
    localStorage.setItem('savedVideos', JSON.stringify(newVideos));
  } catch (error) {
    console.error("Error deleting video:", error);
  }
};
