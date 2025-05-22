
import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Video, VideoGenerationParameters } from '@/lib/types';
import { createVideoPrediction } from '@/services/video/predictionService';
import { VIDEO_MODELS } from '@/lib/constants';
import { toast } from 'sonner';
import { 
  validateInput, 
  ValidationRule,
  ValidationSchema, 
  withRetry,
  NetworkError,
  ValidationError,
  APIError
} from '@/lib/errorHandling';

interface UseVideoSubmitProps {
  onVideoCreated: (video: Video) => void;
  selectedModelId: string;
  prompt: string;
  parameters: VideoGenerationParameters;
}

const MAX_RETRIES = 2;
const RETRY_DELAY = 1500; // 1.5 seconds

// Prompt validation schema
const promptValidationRules: ValidationRule[] = [
  {
    validate: (value) => !!value && typeof value === 'string',
    message: 'Please enter a description for your video'
  },
  {
    validate: (value) => typeof value === 'string' && value.trim().length > 0,
    message: 'Description cannot be empty'
  },
  {
    validate: (value) => typeof value === 'string' && value.length <= 1000,
    message: 'Description is too long (max 1000 characters)'
  }
];

// Model validation schema
const modelValidationRules: ValidationRule[] = [
  {
    validate: (value) => !!value && typeof value === 'string',
    message: 'Please select a video model'
  },
  {
    validate: (value) => VIDEO_MODELS.some(model => model.id === value),
    message: 'Selected model is not available'
  }
];

// Sanitize user inputs to prevent potential issues
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous HTML/script tags
  const withoutTags = input.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Normalize whitespace
  return withoutTags.trim();
};

export const useVideoSubmit = ({
  onVideoCreated,
  selectedModelId,
  prompt,
  parameters
}: UseVideoSubmitProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // UseRef to avoid stale closures
  const propsRef = useRef({ onVideoCreated, selectedModelId, prompt, parameters });
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Update ref when props change
  useEffect(() => {
    propsRef.current = { onVideoCreated, selectedModelId, prompt, parameters };
  }, [onVideoCreated, selectedModelId, prompt, parameters]);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Cleanup function for aborting requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);
  
  // Validate form inputs with more comprehensive rules
  const validateForm = useCallback((): boolean => {
    // Get current props from ref to avoid stale closures
    const { prompt, selectedModelId, parameters } = propsRef.current;
    
    // Build validation schema based on model and parameters
    const validationSchema: ValidationSchema = {
      prompt: promptValidationRules,
      selectedModelId: modelValidationRules,
    };
    
    // Add parameter-specific validation rules if needed
    if (parameters.cfg_scale !== undefined) {
      validationSchema.cfg_scale = [
        {
          validate: (value) => value >= 1 && value <= 30,
          message: 'CFG Scale must be between 1 and 30'
        }
      ];
    }
    
    if (parameters.fps !== undefined) {
      validationSchema.fps = [
        {
          validate: (value) => value >= 1 && value <= 60,
          message: 'FPS must be between 1 and 60'
        }
      ];
    }
    
    // Validate all inputs
    const result = validateInput(
      { prompt, selectedModelId, ...parameters }, 
      validationSchema
    );
    
    // Store validation errors
    setValidationErrors(result.errors);
    
    // If offline, show offline error
    if (isOffline) {
      toast.error('You are currently offline. Please check your internet connection.');
      return false;
    }
    
    // Show first error message if validation fails
    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError);
      return false;
    }
    
    return result.isValid;
  }, [isOffline]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current props from ref to avoid stale closures
    const { onVideoCreated, selectedModelId, prompt, parameters } = propsRef.current;
    
    // Validate form inputs
    if (!validateForm()) return;
    
    try {
      setIsGenerating(true);
      
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
        
        toast.success("Video generation started successfully");
      } catch (error: any) {
        console.error("Error generating video:", error);
        
        // Provide more specific error messages based on error type
        if (error instanceof NetworkError) {
          if (!navigator.onLine) {
            toast.error("You're offline. Please check your internet connection and try again.", {
              action: {
                label: 'Retry',
                onClick: () => handleSubmit(e)
              }
            });
          } else {
            toast.error("Network error. Please check your connection and try again.", {
              action: {
                label: 'Retry',
                onClick: () => handleSubmit(e)
              }
            });
          }
        } else if (error instanceof APIError) {
          if (error.statusCode === 401 || error.statusCode === 403) {
            toast.error("Authentication failed. Please check your API key.");
          } else if (error.statusCode === 429) {
            toast.error("Rate limit exceeded. Please try again later.");
          } else if (error.statusCode >= 500) {
            toast.error("Server error. The service might be temporarily unavailable.", {
              action: {
                label: 'Retry',
                onClick: () => handleSubmit(e)
              }
            });
          } else {
            toast.error(`API Error: ${error.message}`, {
              action: {
                label: 'Retry',
                onClick: () => handleSubmit(e)
              }
            });
          }
        } else if (error instanceof ValidationError) {
          toast.error(`Validation error: ${error.message}`);
        } else {
          toast.error("Failed to start video generation. Please try again later.", {
            action: {
              label: 'Retry',
              onClick: () => handleSubmit(e)
            }
          });
        }
        
        // Update the optimistic video to show it failed
        const failedVideo: Video = {
          ...newVideo,
          status: 'failed',
          error: error.message || "Failed to start video generation"
        };
        onVideoCreated(failedVideo);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [validateForm]);
  
  return {
    isGenerating,
    handleSubmit,
    validationErrors,
    isOffline
  };
};
