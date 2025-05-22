
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Video, VideoGenerationParameters } from '@/lib/types';
import { createVideoPrediction } from '@/services/video/predictionService';
import { VIDEO_MODELS } from '@/lib/constants';
import { toast } from 'sonner';

interface UseVideoSubmitProps {
  onVideoCreated: (video: Video) => void;
  selectedModelId: string;
  prompt: string;
  parameters: VideoGenerationParameters;
}

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500; // 1.5 seconds

export const useVideoSubmit = ({
  onVideoCreated,
  selectedModelId,
  prompt,
  parameters
}: UseVideoSubmitProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const validateForm = useCallback((): boolean => {
    // Clear previous validation error
    setValidationError(null);
    
    // Validate prompt
    if (!prompt || prompt.trim() === '') {
      setValidationError('Please enter a description for your video');
      toast.error('Please enter a description for your video');
      return false;
    }
    
    // Validate model selection
    if (!selectedModelId) {
      setValidationError('Please select a video model');
      toast.error('Please select a video model');
      return false;
    }
    
    // Check if model exists
    const selectedModel = VIDEO_MODELS.find(model => model.id === selectedModelId);
    if (!selectedModel) {
      setValidationError('Selected video model is not available');
      toast.error('Selected video model is not available');
      return false;
    }
    
    // Check prompt length
    if (prompt.length > 1000) {
      setValidationError(`Prompt is too long (${prompt.length}/1000 characters)`);
      toast.error(`Prompt is too long: ${prompt.length}/1000 characters`);
      return false;
    }
    
    return true;
  }, [prompt, selectedModelId]);
  
  // Helper function to attempt prediction with retries
  const attemptPrediction = useCallback(async (
    parameters: VideoGenerationParameters,
    modelId: string,
    modelVersion: string,
    retriesLeft: number = MAX_RETRIES
  ) => {
    try {
      await createVideoPrediction(parameters, modelId, modelVersion);
      toast.success("Video generation started successfully");
      return true;
    } catch (error) {
      console.error("Error creating prediction:", error);
      
      // Determine if this error is retryable
      const isRetryable = 
        error.message.includes("429") || // Rate limit
        error.message.includes("500") || // Server error
        error.message.includes("502") || // Bad gateway
        error.message.includes("503") || // Service unavailable
        error.message.includes("504") || // Gateway timeout
        error.message.includes("non-2xx") || // Generic non-2xx
        error.message.includes("timeout") || // Connection timeout
        error.message.includes("network"); // Network error
      
      // If we have retries left and it's a retryable error, retry after delay
      if (retriesLeft > 0 && isRetryable) {
        console.log(`Retrying prediction... (${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})`);
        
        // Show retry toast
        toast.info(`Connection issue detected. Retrying... (${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return attemptPrediction(parameters, modelId, modelVersion, retriesLeft - 1);
      }
      
      // If we're out of retries or it's not a retryable error, show appropriate message
      // More specific error messaging
      if (error.message.includes("API key") || error.message.includes("Authentication") || 
          error.message.includes("401") || error.message.includes("403")) {
        toast.error("Authentication failed. Please check your API key");
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        toast.error("Rate limit exceeded. Please try again later");
      } else if (error.message.includes("prompt")) {
        toast.error("Invalid prompt. Please provide a clearer description");
      } else if (error.message.includes("network") || error.message.includes("connection")) {
        toast.error("Network error. Please check your internet connection");
      } else if (error.message.includes("500") || error.message.includes("502") || 
                error.message.includes("503") || error.message.includes("504")) {
        toast.error("Server error. The service might be temporarily unavailable");
      } else if (error.message.includes("non-2xx")) {
        toast.error("Service temporarily unavailable. Please try again later");
      } else {
        toast.error("Failed to start video generation. Please try again");
      }
      
      return false;
    }
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) return;
    
    try {
      setIsGenerating(true);
      
      const videoId = uuidv4();
      const newVideo: Video = {
        id: videoId,
        prompt: prompt.trim(),
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
        throw new Error("Selected model not found");
      }
      
      // Make sure prompt is properly synchronized in parameters
      const updatedParameters = {
        ...parameters,
        prompt: prompt.trim()
      };
      
      // First notify the user that a video is being created (optimistic UI)
      onVideoCreated(newVideo);
      
      // Attempt prediction with retry logic
      await attemptPrediction(updatedParameters, selectedModelId, selectedModel.version);
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Error starting video generation");
    } finally {
      setIsGenerating(false);
    }
  }, [validateForm, prompt, selectedModelId, parameters, onVideoCreated, attemptPrediction]);
  
  return {
    isGenerating,
    handleSubmit,
    validationError
  };
};
