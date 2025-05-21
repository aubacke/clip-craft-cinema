
import { v4 as uuidv4 } from 'uuid';
import { Video, VideoModel } from '../lib/types';
import { toast } from 'sonner';

// This is a placeholder for the API key input that we'll use until Supabase integration
let replicateApiKey = '';

export const setApiKey = (key: string) => {
  replicateApiKey = key;
};

export const getApiKey = () => replicateApiKey;

// Start a prediction with Replicate
export const createVideoPrediction = async (
  prompt: string,
  modelId: string,
  modelVersion: string
): Promise<Video> => {
  try {
    if (!replicateApiKey) {
      throw new Error("API key is required");
    }

    const [owner, name] = modelId.split('/');
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${replicateApiKey}`,
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          prompt,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to start video generation");
    }

    const data = await response.json();
    
    return {
      id: data.id || uuidv4(),
      prompt,
      modelId,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating prediction:", error);
    toast.error("Failed to start video generation");
    throw error;
  }
};

// Check prediction status
export const checkVideoPredictionStatus = async (predictionId: string): Promise<Video> => {
  try {
    if (!replicateApiKey) {
      throw new Error("API key is required");
    }
    
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Token ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to check prediction status");
    }

    const data = await response.json();
    
    let status: 'processing' | 'completed' | 'failed' = 'processing';
    if (data.status === 'succeeded') {
      status = 'completed';
    } else if (data.status === 'failed') {
      status = 'failed';
    }
    
    return {
      id: predictionId,
      prompt: data.input.prompt,
      modelId: `${data.version.split("/")[0]}/${data.version.split("/")[1]}`,
      status,
      url: data.output ? Array.isArray(data.output) ? data.output[0] : data.output : undefined,
      createdAt: data.created_at || new Date().toISOString(),
      error: data.error,
    };
  } catch (error) {
    console.error("Error checking prediction:", error);
    throw error;
  }
};

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

// Folder management
export const saveFolderToLocalStorage = (folder: { id: string; name: string; createdAt: string }): void => {
  try {
    const savedFolders = localStorage.getItem('savedFolders');
    const folders = savedFolders ? JSON.parse(savedFolders) : [];
    
    const existingIndex = folders.findIndex((f: any) => f.id === folder.id);
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

export const getFoldersFromLocalStorage = () => {
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
    
    const videos: Video[] = JSON.parse(savedVideos);
    const videoIndex = videos.findIndex(v => v.id === videoId);
    
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
