
import { useState, useCallback, useRef, useEffect } from 'react';
import { Video, VideoGenerationParameters } from '@/lib/types';
import { toast } from 'sonner';
import { validateInput } from '@/lib/errorHandling';
import { NetworkError, ValidationError, APIError } from '@/lib/errorHandling';
import { submitVideoGeneration } from '@/services/video/videoSubmissionService';
import { createVideoValidationSchema } from '@/services/validation/videoValidationService';

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
    const validationSchema = createVideoValidationSchema(parameters);
    
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
      
      await submitVideoGeneration(prompt, selectedModelId, parameters, onVideoCreated);
      
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
