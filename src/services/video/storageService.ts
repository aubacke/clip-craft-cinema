
import { Video, Folder } from '@/lib/types';

// Debounce function to limit localStorage writes
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttled version of saving to localStorage
const saveToLocalStorageThrottled = debounce((key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}, 300); // 300ms debounce time

// Cache for in-memory storage to reduce localStorage reads
const memoryCache: Record<string, any> = {
  videos: null,
  folders: null
};

// Simulate saving to local storage until we have Supabase integration
export const saveVideoToLocalStorage = (video: Video): void => {
  try {
    // Read from cache first if available, otherwise from localStorage
    const videos: Video[] = memoryCache.videos || getVideosFromLocalStorage();
    
    const existingIndex = videos.findIndex(v => v.id === video.id);
    if (existingIndex >= 0) {
      videos[existingIndex] = video;
    } else {
      videos.push(video);
    }
    
    // Update memory cache immediately
    memoryCache.videos = videos;
    
    // Throttled write to localStorage
    saveToLocalStorageThrottled('savedVideos', videos);
  } catch (error) {
    console.error("Error saving video:", error);
  }
};

export const getVideosFromLocalStorage = (): Video[] => {
  try {
    // Return from cache if available
    if (memoryCache.videos !== null) {
      return memoryCache.videos;
    }
    
    const savedVideos = localStorage.getItem('savedVideos');
    const videos = savedVideos ? JSON.parse(savedVideos) : [];
    
    // Update cache
    memoryCache.videos = videos;
    return videos;
  } catch (error) {
    console.error("Error getting videos:", error);
    return [];
  }
};

export const deleteVideoFromLocalStorage = (videoId: string): void => {
  try {
    // Read from cache first if available
    const videos: Video[] = memoryCache.videos || getVideosFromLocalStorage();
    const newVideos = videos.filter(v => v.id !== videoId);
    
    // Update memory cache immediately
    memoryCache.videos = newVideos;
    
    // Throttled write to localStorage
    saveToLocalStorageThrottled('savedVideos', newVideos);
  } catch (error) {
    console.error("Error deleting video:", error);
  }
};
