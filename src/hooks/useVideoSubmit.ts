
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
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
        toast.error("Failed to start video generation. Please check your API key.");
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
    handleSubmit
  };
};
