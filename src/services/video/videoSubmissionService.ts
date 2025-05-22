
import { v4 as uuidv4 } from 'uuid';
import { Video, VideoGenerationParameters } from '@/lib/types';
import { createVideoPrediction } from '@/services/video/predictionService';
import { VIDEO_MODELS } from '@/lib/constants';
import { sanitizeInput } from '@/utils/sanitizationUtils';
import { 
  withRetry,
  NetworkError,
  ValidationError,
  APIError
} from '@/lib/errorHandling';

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500; // 1.5 seconds

/**
 * Handles the submission of a video generation request
 */
export const submitVideoGeneration = async (
  prompt: string,
  selectedModelId: string,
  parameters: VideoGenerationParameters,
  onVideoCreated: (video: Video) => void
): Promise<void> => {
  // Sanitize the prompt
  const sanitizedPrompt = sanitizeInput(prompt);
  
  const videoId = uuidv4();
  const newVideo: Video = {
    id: videoId,
    prompt: sanitizedPrompt,
    modelId: selectedModelId,
    status: 'processing',
    createdAt: new Date().toISOString(),
    // If this video has a reference image, link it to the reference image folder
    folderId: parameters.referenceImageFolderId,
    referenceImageId: parameters.referenceImageId
  };
  
  // Get the selected model's version
  const selectedModel = VIDEO_MODELS.find(model => model.id === selectedModelId);
  if (!selectedModel) {
    throw new ValidationError("Selected model not found");
  }
  
  // Make sure prompt is properly synchronized in parameters
  const updatedParameters = {
    ...parameters,
    prompt: sanitizedPrompt
  };
  
  // First notify the user that a video is being created (optimistic UI)
  onVideoCreated(newVideo);
  
  try {
    // Use withRetry for automatic retry with exponential backoff
    await withRetry(() => 
      createVideoPrediction(updatedParameters, selectedModelId, selectedModel.version),
      { maxRetries: MAX_RETRIES, delayMs: RETRY_DELAY, backoffFactor: 2 }
    );
    
    return;
  } catch (error: any) {
    console.error("Error generating video:", error);
    
    // Update the optimistic video to show it failed
    const failedVideo: Video = {
      ...newVideo,
      status: 'failed',
      error: error.message || "Failed to start video generation"
    };
    
    onVideoCreated(failedVideo);
    throw error; // Re-throw for the hook to handle
  }
};
