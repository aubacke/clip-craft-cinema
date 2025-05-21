
import { v4 as uuidv4 } from 'uuid';
import { Folder } from '@/lib/types';
import { saveFolderToLocalStorage, getFoldersFromLocalStorage } from './folderService';

export interface ReferenceImage {
  id: string;
  name: string;
  dataUrl: string;
  folderId: string;
  createdAt: string;
}

// Save reference image to localStorage
export const saveReferenceImageToLocalStorage = (image: ReferenceImage): void => {
  try {
    const savedImages = localStorage.getItem('referenceImages');
    const images = savedImages ? JSON.parse(savedImages) : [];
    
    const existingIndex = images.findIndex((i: ReferenceImage) => i.id === image.id);
    if (existingIndex >= 0) {
      images[existingIndex] = image;
    } else {
      images.push(image);
    }
    
    localStorage.setItem('referenceImages', JSON.stringify(images));
  } catch (error) {
    console.error("Error saving reference image:", error);
  }
};

// Get all reference images from localStorage
export const getReferenceImagesFromLocalStorage = (): ReferenceImage[] => {
  try {
    const savedImages = localStorage.getItem('referenceImages');
    return savedImages ? JSON.parse(savedImages) : [];
  } catch (error) {
    console.error("Error getting reference images:", error);
    return [];
  }
};

// Create a folder for a reference image
export const createFolderForReferenceImage = (file: File): Folder => {
  const id = uuidv4();
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  
  // Create a folder name based on the date and filename
  const folderName = `Image Ref: ${dateStr} - ${file.name.substring(0, 15)}`;
  
  const folder: Folder = {
    id,
    name: folderName,
    createdAt: now.toISOString(),
    isReferenceFolder: true
  };
  
  saveFolderToLocalStorage(folder);
  return folder;
};

// Get reference image by folder ID
export const getReferenceImageByFolderId = (folderId: string): ReferenceImage | undefined => {
  const images = getReferenceImagesFromLocalStorage();
  return images.find(image => image.folderId === folderId);
};

// Get folders that are reference image folders
export const getReferenceImageFolders = (): Folder[] => {
  return getFoldersFromLocalStorage().filter(folder => folder.isReferenceFolder);
};
