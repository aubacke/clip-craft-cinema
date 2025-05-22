
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { ModelParameters } from './ModelParameters';
import { PromptInput } from './PromptInput';
import { VideoGenerationParameters } from '@/lib/types';
import { useVideoSubmit } from '@/hooks/useVideoSubmit';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VideoGeneratorFormProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  parameters: VideoGenerationParameters;
  onParameterChange: (params: VideoGenerationParameters) => void;
  onVideoCreated: (video: any) => void;
}

interface ValidationErrors {
  prompt?: string;
  model?: string;
  duration?: string;
  cfgScale?: string;
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
  const { isGenerating, handleSubmit } = useVideoSubmit({
    onVideoCreated,
    selectedModelId,
    prompt,
    parameters
  });

  // Check if we're using a reference image
  const hasReferenceImage = !!parameters.referenceImageId;
  
  // Enhanced form validation
  const validationErrors = useMemo<ValidationErrors>(() => {
    const errors: ValidationErrors = {};
    
    // Prompt validation
    if (!prompt.trim()) {
      errors.prompt = "Please describe your video";
    } else if (prompt.trim().length < 10) {
      errors.prompt = "Please provide a more detailed description";
    }
    
    // Model validation
    if (!selectedModelId) {
      errors.model = "Please select a model";
    }
    
    // Duration validation
    if (parameters.duration && parameters.duration < 1) {
      errors.duration = "Duration must be at least 1 second";
    }
    
    // CFG Scale validation
    if (parameters.cfg_scale && (parameters.cfg_scale < 1 || parameters.cfg_scale > 15)) {
      errors.cfgScale = "CFG Scale must be between 1 and 15";
    }
    
    return errors;
  }, [prompt, selectedModelId, parameters]);
  
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
    } else if (!isFormValid) {
      if (validationErrors.prompt) return 'Please describe your video';
      if (validationErrors.model) return 'Please select a model';
      return 'Please complete all fields correctly';
    } else {
      return 'Generate Video';
    }
  }, [isGenerating, isFormValid, validationErrors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Main Prompt Input - stays at the top */}
      <div>
        <h3 className="text-lg font-medium mb-3">Describe your video</h3>
        <PromptInput
          prompt={prompt}
          onPromptChange={onPromptChange}
          placeholder="Describe the video you want to generate..."
          disabled={isGenerating}
          maxLength={1000}
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
          disabled={isGenerating}
        />
        {validationErrors.model && (
          <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{validationErrors.model}</span>
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
          />
          {(validationErrors.duration || validationErrors.cfgScale) && (
            <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                {validationErrors.duration || validationErrors.cfgScale}
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
          disabled={isGenerating || !isFormValid}
          variant={!isFormValid ? "secondary" : "default"}
          size="lg"
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
});

VideoGeneratorForm.displayName = 'VideoGeneratorForm';

export { VideoGeneratorForm };
