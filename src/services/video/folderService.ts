
import { Folder } from '@/lib/types';

// Folder management
export const saveFolderToLocalStorage = (folder: Folder): void => {
  try {
    const savedFolders = localStorage.getItem('savedFolders');
    const folders = savedFolders ? JSON.parse(savedFolders) : [];
    
    const existingIndex = folders.findIndex((f: Folder) => f.id === folder.id);
    if (existingIndex >= 0) {
      folders[existingIndex] = folder;
    } else {
      folders.push(folder);
    }
    
    localStorage.setItem('savedFolders', JSON.stringify(folders));
  } catch (error) {
    console.error("Error saving folder:", error);
  }
};

export const getFoldersFromLocalStorage = (): Folder[] => {
  try {
    const savedFolders = localStorage.getItem('savedFolders');
    return savedFolders ? JSON.parse(savedFolders) : [];
  } catch (error) {
    console.error("Error getting folders:", error);
    return [];
  }
};

export const moveVideoToFolder = (videoId: string, folderId: string | null): void => {
  try {
    const savedVideos = localStorage.getItem('savedVideos');
    if (!savedVideos) return;
    
    const videos = JSON.parse(savedVideos);
    const videoIndex = videos.findIndex((v: any) => v.id === videoId);
    
    if (videoIndex >= 0) {
      videos[videoIndex] = {
        ...videos[videoIndex],
        folderId: folderId || undefined
      };
      
      localStorage.setItem('savedVideos', JSON.stringify(videos));
    }
  } catch (error) {
    console.error("Error moving video:", error);
  }
};
