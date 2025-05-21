
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
    // Validate required parameters
    if (!parameters.prompt || parameters.prompt.trim() === '') {
      throw new Error("Please provide a prompt for the video generation");
    }

    if (!modelId || !modelVersion) {
      throw new Error("Missing model information. Please select a valid model.");
    }

    // Get the appropriate formatter for the model
    const formatter = getModelFormatter(modelId);
    if (!formatter) {
      throw new Error(`No formatter found for model ${modelId}`);
    }
    
    // Format the parameters based on the model
    const formattedInputs = formatter.formatInputs(parameters);
    
    console.log("Calling Replicate API with:", {
      modelId,
      modelVersion,
      formattedInputs,
      promptLength: parameters.prompt?.length || 0,
      hasImage: !!parameters.image
    });
    
    // Call the API with the formatted inputs and optional image
    const data = await callReplicateModel(modelVersion, formattedInputs, parameters.image);
    
    if (!data || !data.id) {
      throw new Error("Invalid response from Replicate API. Missing prediction ID.");
    }
    
    return {
      id: data.id,
      prompt: parameters.prompt,
      modelId,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating video prediction:", error);
    
    // Provide more specific error messages based on the type of error
    if (error.message.includes("API key")) {
      toast.error("Authentication error: Please check your Replicate API key");
      throw new Error("Please check your Replicate API key in Supabase Edge Function Secrets");
    } else if (error.message.includes("rate limit")) {
      toast.error("Rate limit exceeded. Please try again later.");
    } else if (error.message.includes("Invalid response") || error.message.includes("No data returned")) {
      toast.error("Communication error with Replicate. Please try again.");
    } else if (error.message.includes("prompt")) {
      toast.error("Please provide a valid prompt for video generation");
    } else {
      // For other errors, show a more user-friendly message but still log the details
      toast.error(`Video generation failed: ${error.message || "Unknown error"}`);
    }
    
    throw error;
  }
};

// Check prediction status
export const checkVideoPredictionStatus = async (predictionId: string): Promise<Video> => {
  try {
    if (!predictionId) {
      throw new Error("Missing prediction ID");
    }
    
    const data = await checkPredictionStatus(predictionId);
    
    let status: 'processing' | 'completed' | 'failed' = 'processing';
    if (data.status === 'succeeded') {
      status = 'completed';
    } else if (data.status === 'failed') {
      status = 'failed';
    }
    
    // Handle different output formats: string, array or undefined
    let outputUrl: string | undefined = undefined;
    if (data.output) {
      if (Array.isArray(data.output) && data.output.length > 0) {
        outputUrl = data.output[0];
      } else if (typeof data.output === 'string') {
        outputUrl = data.output;
      }
    }
    
    return {
      id: predictionId,
      prompt: data.input?.prompt || 'Unknown prompt',
      modelId: data.version ? `${data.version.split('/')[0]}/${data.version.split('/')[1]}` : '',
      status,
      url: outputUrl,
      createdAt: data.created_at || new Date().toISOString(),
      error: data.error || undefined,
    };
  } catch (error) {
    console.error("Error checking video prediction:", error);
    
    if (error.message.includes("not found") || error.message.includes("404")) {
      return {
        id: predictionId,
        prompt: 'Unknown prompt',
        modelId: '',
        status: 'failed',
        error: `Prediction not found: ${error.message}`,
        createdAt: new Date().toISOString(),
      };
    }
    
    // For serious errors, rethrow to be handled by the caller
    throw error;
  }
};
