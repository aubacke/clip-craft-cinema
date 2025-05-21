
import { v4 as uuidv4 } from 'uuid';
import { Video } from '@/lib/types';
import { VideoGenerationParameters } from '@/lib/replicateTypes';
import { toast } from 'sonner';
import { callReplicateModel, checkPredictionStatus } from '../replicateService';
import { getModelFormatter } from './formatters';

// Create a video prediction using Replicate
export const createVideoPrediction = async (
  parameters: VideoGenerationParameters,
  modelId: string,
  modelVersion: string
): Promise<Video> => {
  try {
    // Get the appropriate formatter for the model
    const formatter = getModelFormatter(modelId);
    
    // Format the parameters based on the model
    const formattedInputs = formatter.formatInputs(parameters);
    
    console.log("Calling Replicate API with:", {
      modelVersion,
      formattedInputs,
      hasImage: !!parameters.image
    });
    
    // Call the API with the formatted inputs and optional image
    const data = await callReplicateModel(modelVersion, formattedInputs, parameters.image);
    
    if (!data || !data.id) {
      throw new Error("Invalid response from Replicate API");
    }
    
    return {
      id: data.id,
      prompt: parameters.prompt,
      modelId,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating prediction:", error);
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
      prompt: data.input?.prompt || 'Unknown prompt',
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
