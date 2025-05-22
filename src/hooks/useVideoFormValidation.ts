
import { useState, useCallback, useEffect } from 'react';
import { VideoGenerationParameters } from '@/lib/types';
import { createVideoValidationSchema } from '@/services/validation/videoValidationService';
import { validateInput } from '@/lib/errorHandling';
import { toast } from 'sonner';
import { useNetworkStatus } from './useNetworkStatus';

interface UseVideoFormValidationProps {
  prompt: string;
  selectedModelId: string;
  parameters: VideoGenerationParameters;
}

export const useVideoFormValidation = ({
  prompt,
  selectedModelId,
  parameters
}: UseVideoFormValidationProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { isOnline } = useNetworkStatus();

  // Validate the form inputs and store validation errors
  const validateForm = useCallback((): boolean => {
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
    if (!isOnline) {
      return false;
    }
    
    // Show first error message if validation fails
    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError);
      return false;
    }
    
    return result.isValid;
  }, [prompt, selectedModelId, parameters, isOnline]);

  // Run validation when critical form values change
  useEffect(() => {
    // Perform validation without showing toast messages
    const quietValidate = () => {
      const validationSchema = createVideoValidationSchema(parameters);
      const result = validateInput(
        { prompt, selectedModelId, ...parameters }, 
        validationSchema
      );
      setValidationErrors(result.errors);
    };

    quietValidate();
  }, [prompt, selectedModelId, parameters]);

  // Check if form is valid
  const isFormValid = Object.keys(validationErrors).length === 0 && isOnline;

  return {
    validationErrors,
    validateForm,
    isFormValid,
    isOffline: !isOnline
  };
};
