import { Video, VideoGenerationParameters } from '@/lib/types';
import { getModelFormatter } from './formatters';
import { NetworkError, APIError, ValidationError } from '@/lib/errorHandling';
import { callReplicateModel, checkPredictionStatus } from '@/services/replicateService';

/**
 * Creates a new video prediction with improved error handling
 */
export const createVideoPrediction = async (
  parameters: VideoGenerationParameters,
  modelId: string,
  modelVersion: string
): Promise<void> => {
  try {
    // Get the appropriate formatter for this model
    const formatter = getModelFormatter(modelId);
    
    // Validate parameters before API call
    if (!formatter) {
      throw new ValidationError(`No formatter available for model: ${modelId}`);
    }
    
    if (!parameters.prompt || parameters.prompt.trim() === '') {
      throw new ValidationError('A prompt is required');
    }
    
    // Format the input parameters for the Replicate API
    const formattedInput = formatter.formatInput(parameters);
    
    // Call the Replicate API
    await callReplicateModel(modelVersion, formattedInput);
    
    // If we reach here, the call was successful
    return;
  } catch (error: any) {
    // Translate errors to our application error types
    if (error.message?.includes('network') || error.message?.includes('connection') || 
        error.message?.includes('timeout') || error.message?.includes('fetch')) {
      throw new NetworkError(`Network error when creating video: ${error.message}`, error);
    } else if (error.statusCode || error.message?.includes('401') || error.message?.includes('403') || 
              error.message?.includes('429') || error.message?.includes('500')) {
      // Extract status code if available
      const statusCode = error.statusCode || 
                        (error.message?.includes('401') ? 401 : 
                         error.message?.includes('403') ? 403 :
                         error.message?.includes('429') ? 429 : 
                         error.message?.includes('500') ? 500 : 400);
      
      throw new APIError(`API error: ${error.message}`, statusCode);
    } else if (error instanceof ValidationError) {
      throw error;
    } else {
      throw new Error(`Error creating video prediction: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Checks the status of a video prediction with improved error handling
 */
export const checkVideoPredictionStatus = async (
  predictionId: string
): Promise<Video> => {
  try {
    // Call the Replicate API to check the prediction status
    const response = await checkPredictionStatus(predictionId);
    
    if (!response) {
      throw new Error(`No response data for prediction ID: ${predictionId}`);
    }
    
    // Map the response to our Video type
    const video: Video = {
      id: predictionId,
      status: response.status === 'succeeded' ? 'completed' : 
              response.status === 'failed' ? 'failed' : 'processing',
      modelId: response.model?.split('/').pop() || '',
      prompt: response.input?.prompt || '',
      createdAt: response.created_at || new Date().toISOString(),
      outputUrl: response.output?.[0] || null,
      error: response.error || undefined
    };
    
    return video;
  } catch (error: any) {
    // Translate errors to our application error types
    if (error.message?.includes('network') || error.message?.includes('connection') || 
        error.message?.includes('timeout') || error.message?.includes('fetch')) {
      throw new NetworkError(`Network error when checking video status: ${error.message}`, error);
    } else if (error.statusCode || error.message?.includes('401') || error.message?.includes('403') || 
              error.message?.includes('429') || error.message?.includes('500')) {
      // Extract status code if available
      const statusCode = error.statusCode || 
                        (error.message?.includes('401') ? 401 : 
                         error.message?.includes('403') ? 403 :
                         error.message?.includes('429') ? 429 : 
                         error.message?.includes('500') ? 500 : 400);
      
      throw new APIError(`API error: ${error.message}`, statusCode);
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      const failedVideo: Video = {
        id: predictionId,
        status: 'failed',
        modelId: '',
        prompt: '',
        createdAt: new Date().toISOString(),
        error: `Prediction not found: ${error.message}`
      };
      return failedVideo;
    } else {
      const failedVideo: Video = {
        id: predictionId,
        status: 'failed',
        modelId: '',
        prompt: '',
        createdAt: new Date().toISOString(),
        error: `Error checking prediction: ${error.message || 'Unknown error'}`
      };
      return failedVideo;
    }
  }
};

// Keep any other existing functions or exports
