
import { v4 as uuidv4 } from 'uuid';
import { Video } from '../lib/types';
import { VideoGenerationParameters } from '../lib/replicateTypes';
import { toast } from 'sonner';
import { callReplicateModel, checkPredictionStatus } from './replicateService';

// Format parameters for different models
const formatModelInputs = (
  parameters: VideoGenerationParameters, 
  modelId: string
): Record<string, any> => {
  // Start with the basic parameters that are common
  const inputParams: Record<string, any> = {
    prompt: parameters.prompt
  };
  
  // Add negative prompt if provided
  if (parameters.negative_prompt) {
    inputParams.negative_prompt = parameters.negative_prompt;
  }
  
  // Add image URL if already provided (from a previous upload)
  if (parameters.image_url) {
    inputParams.image = parameters.image_url;
  }
  
  // Handle specific parameters based on the model
  if (modelId.includes('google/veo')) {
    // Handle Google Veo parameters
    if (parameters.aspect_ratio) {
      const [width, height] = parameters.aspect_ratio.split(':').map(Number);
      if (width && height) {
        const ratio = width / height;
        if (ratio > 1) { // Landscape
          inputParams.width = 768;
          inputParams.height = Math.floor(768 / ratio);
        } else { // Portrait or square
          inputParams.height = 768;
          inputParams.width = Math.floor(768 * ratio);
        }
      }
    }
    
    if (parameters.cfg_scale) inputParams.cfg_scale = parameters.cfg_scale;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    if (parameters.steps) inputParams.num_inference_steps = parameters.steps;
  } 
  else if (modelId.includes('kwaivgi/kling')) {
    // Handle Kling parameters
    if (parameters.width) inputParams.width = parameters.width;
    if (parameters.height) inputParams.height = parameters.height;
    if (parameters.cfg_scale) inputParams.guidance_scale = parameters.cfg_scale;
    if (parameters.num_frames) inputParams.num_frames = parameters.num_frames;
    if (parameters.fps) inputParams.fps = parameters.fps;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    if (parameters.model_specific?.motion_strength) {
      inputParams.motion_strength = parameters.model_specific.motion_strength;
    }
  } 
  else if (modelId.includes('luma/ray')) {
    // Handle Luma Ray parameters
    if (parameters.fps) inputParams.fps = parameters.fps;
    if (parameters.num_frames) inputParams.num_frames = parameters.num_frames;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    
    // Add model-specific parameters
    if (parameters.model_specific?.style) {
      inputParams.style = parameters.model_specific.style;
    }
  }

  return inputParams;
};

// Create a video prediction using Replicate
export const createVideoPrediction = async (
  parameters: VideoGenerationParameters,
  modelId: string,
  modelVersion: string
): Promise<Video> => {
  try {
    // Format the parameters based on the model
    const formattedInputs = formatModelInputs(parameters, modelId);
    
    // Call the API with the formatted inputs and optional image
    const data = await callReplicateModel(modelVersion, formattedInputs, parameters.image);
    
    return {
      id: data.id || uuidv4(),
      prompt: parameters.prompt,
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
    const data = await checkPredictionStatus(predictionId);
    
    let status: 'processing' | 'completed' | 'failed' = 'processing';
    if (data.status === 'succeeded') {
      status = 'completed';
    } else if (data.status === 'failed') {
      status = 'failed';
    }
    
    return {
      id: predictionId,
      prompt: data.input.prompt,
      modelId: data.version ? `${data.version.split('/')[0]}/${data.version.split('/')[1]}` : '',
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
