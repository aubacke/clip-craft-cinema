
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, WifiOff } from 'lucide-react';

interface SubmitButtonProps {
  isGenerating: boolean;
  isOffline: boolean;
  isFormValid: boolean;
  validationErrors: Record<string, string>;
}

export const SubmitButton = React.memo<SubmitButtonProps>(({
  isGenerating,
  isOffline,
  isFormValid,
  validationErrors
}) => {
  // Get appropriate button text based on form state
  const getButtonText = () => {
    if (isGenerating) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Video...
        </>
      );
    } else if (isOffline) {
      return (
        <>
          <WifiOff className="mr-2 h-4 w-4" />
          You're Offline
        </>
      );
    } else if (!isFormValid) {
      if (validationErrors.prompt) return 'Please describe your video';
      if (validationErrors.selectedModelId) return 'Please select a model';
      return 'Please complete all fields correctly';
    } else {
      return 'Generate Video';
    }
  };

  return (
    <div className="pt-4">
      <Button
        type="submit"
        className="w-full"
        disabled={isGenerating || !isFormValid || isOffline}
        variant={!isFormValid || isOffline ? "secondary" : "default"}
        size="lg"
      >
        {getButtonText()}
      </Button>
    </div>
  );
});

SubmitButton.displayName = 'SubmitButton';
