
import { Folder } from '@/lib/types';
import { storageManager } from '@/services/storage/storageManager';
import { globalCache } from '@/services/storage/cacheStrategy';

// Storage key for folders
const FOLDERS_KEY = 'folders';

// In-memory cache for folders
const foldersCache = globalCache;

/**
 * Save a folder to storage
 */
export const saveFolderToLocalStorage = (folder: Folder): void => {
  try {
    const folders = getFoldersFromLocalStorage();
    
    const existingIndex = folders.findIndex((f: Folder) => f.id === folder.id);
    if (existingIndex >= 0) {
      folders[existingIndex] = folder;
    } else {
      folders.push(folder);
    }
    
    // Update cache
    foldersCache.set(FOLDERS_KEY, folders);
    
    // Save to storage
    storageManager.setItem(FOLDERS_KEY, folders);
  } catch (error) {
    console.error("Error saving folder:", error);
  }
};

/**
 * Get all folders from storage
 */
export const getFoldersFromLocalStorage = (): Folder[] => {
  try {
    // Try to get from cache first
    const cachedFolders = foldersCache.get(FOLDERS_KEY);
    if (cachedFolders) {
      return cachedFolders;
    }
    
    // If not in cache, get from storage
    const folders = storageManager.getItem<Folder[]>(FOLDERS_KEY, []);
    
    // Update cache for future reads
    foldersCache.set(FOLDERS_KEY, folders);
    
    return folders;
  } catch (error) {
    console.error("Error getting folders:", error);
    return [];
  }
};

/**
 * Move a video to a folder
 */
export const moveVideoToFolder = (videoId: string, folderId: string | null): void => {
  try {
    const savedVideos = storageManager.getItem('videos');
    if (!savedVideos) return;
    
    const videos = savedVideos;
    const videoIndex = videos.findIndex((v: any) => v.id === videoId);
    
    if (videoIndex >= 0) {
      videos[videoIndex] = {
        ...videos[videoIndex],
        folderId: folderId || undefined
      };
      
      // Update storage
      storageManager.setItem('videos', videos);
      
      // Update cache
      globalCache.set('videos', videos);
    }
  } catch (error) {
    console.error("Error moving video:", error);
  }
};

/**
 * Delete a folder and optionally move its videos
 */
export const deleteFolder = (folderId: string, moveVideosTo?: string | null): void => {
  try {
    // Delete the folder
    const folders = getFoldersFromLocalStorage();
    const updatedFolders = folders.filter(f => f.id !== folderId);
    
    // Update folders in storage
    storageManager.setItem(FOLDERS_KEY, updatedFolders);
    foldersCache.set(FOLDERS_KEY, updatedFolders);
    
    // Handle videos in this folder
    const videos = storageManager.getItem('videos') || [];
    const updatedVideos = videos.map((video: any) => {
      if (video.folderId === folderId) {
        return {
          ...video,
          folderId: moveVideosTo || undefined
        };
      }
      return video;
    });
    
    // Update videos in storage
    storageManager.setItem('videos', updatedVideos);
    globalCache.set('videos', updatedVideos);
  } catch (error) {
    console.error("Error deleting folder:", error);
  }
};
