
import { useState } from 'react';
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

export const useVideoSubmit = ({
  onVideoCreated,
  selectedModelId,
  prompt,
  parameters
}: UseVideoSubmitProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const validateForm = (): boolean => {
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
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
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
      
      // Start prediction and handle errors properly
      try {
        await createVideoPrediction(updatedParameters, selectedModelId, selectedModel.version);
        toast.success("Video generation started successfully");
      } catch (error) {
        console.error("Error creating prediction:", error);
        
        // More specific error messaging
        if (error.message.includes("API key") || error.message.includes("Authentication")) {
          toast.error("Authentication failed. Please check your API key");
        } else if (error.message.includes("rate limit") || error.message.includes("429")) {
          toast.error("Rate limit exceeded. Please try again later");
        } else if (error.message.includes("prompt")) {
          toast.error("Invalid prompt. Please provide a clearer description");
        } else if (error.message.includes("network") || error.message.includes("connection")) {
          toast.error("Network error. Please check your internet connection");
        } else {
          toast.error("Failed to start video generation. Please try again");
        }
        
        // We don't throw here as we've already shown the video in the UI
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Error starting video generation");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    isGenerating,
    handleSubmit,
    validationError
  };
};
