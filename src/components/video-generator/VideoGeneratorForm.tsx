
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, AlertCircle, WifiOff } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { ModelParameters } from './ModelParameters';
import { PromptInput } from './PromptInput';
import { VideoGenerationParameters } from '@/lib/types';
import { useVideoSubmit } from '@/hooks/useVideoSubmit';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { VideoComponentErrorBoundary } from '@/components/ui/error-boundary-wrapper';

interface VideoGeneratorFormProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  parameters: VideoGenerationParameters;
  onParameterChange: (params: VideoGenerationParameters) => void;
  onVideoCreated: (video: any) => void;
}

const VideoGeneratorForm = React.memo<VideoGeneratorFormProps>(({
  prompt,
  onPromptChange,
  selectedModelId,
  onModelSelect,
  parameters,
  onParameterChange,
  onVideoCreated
}) => {
  const { isGenerating, handleSubmit, validationErrors, isOffline } = useVideoSubmit({
    onVideoCreated,
    selectedModelId,
    prompt,
    parameters
  });

  // Check if we're using a reference image
  const hasReferenceImage = !!parameters.referenceImageId;
  
  // Form validity check
  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0;
  }, [validationErrors]);

  // Get appropriate button text based on form state
  const buttonText = useMemo(() => {
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
  }, [isGenerating, isFormValid, validationErrors, isOffline]);

  return (
    <VideoComponentErrorBoundary componentName="VideoGeneratorForm">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Offline Warning */}
        {isOffline && (
          <Alert variant="destructive" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You're offline</AlertTitle>
            <AlertDescription>
              Video generation requires an internet connection. Please check your network and try again.
            </AlertDescription>
          </Alert>
        )}
      
        {/* Main Prompt Input - stays at the top */}
        <div>
          <h3 className="text-lg font-medium mb-3">Describe your video</h3>
          <PromptInput
            prompt={prompt}
            onPromptChange={onPromptChange}
            placeholder="Describe the video you want to generate..."
            disabled={isGenerating || isOffline}
            maxLength={1000}
            error={validationErrors.prompt}
          />
          {validationErrors.prompt && (
            <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{validationErrors.prompt}</span>
            </div>
          )}
        </div>
        
        {/* Reference Image Info - only shown when used */}
        {hasReferenceImage && (
          <div className="bg-secondary/20 p-3 rounded-md border-l-4 border-primary/70">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Using reference image</span>
              <Badge variant="outline" className="ml-auto text-xs">Reference image applied</Badge>
            </div>
          </div>
        )}
        
        {/* Model Selection */}
        <div>
          <Separator className="my-6" />
          <h3 className="text-lg font-medium mb-3">Select model</h3>
          <ModelSelector
            selectedModelId={selectedModelId}
            onModelSelect={onModelSelect}
            disabled={isGenerating || isOffline}
            error={validationErrors.selectedModelId}
          />
          {validationErrors.selectedModelId && (
            <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{validationErrors.selectedModelId}</span>
            </div>
          )}
        </div>
        
        {/* Model Parameters */}
        {selectedModelId && (
          <div>
            <h3 className="text-md font-medium text-muted-foreground mb-3">Advanced settings</h3>
            <ModelParameters
              selectedModelId={selectedModelId}
              parameters={parameters}
              onParameterChange={onParameterChange}
              errors={validationErrors}
              disabled={isGenerating || isOffline}
            />
            {(validationErrors.cfg_scale || validationErrors.fps) && (
              <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {validationErrors.cfg_scale || validationErrors.fps}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || !isFormValid || isOffline}
            variant={!isFormValid || isOffline ? "secondary" : "default"}
            size="lg"
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </VideoComponentErrorBoundary>
  );
});

VideoGeneratorForm.displayName = 'VideoGeneratorForm';

export { VideoGeneratorForm };
