
import React, { useCallback, useMemo } from 'react';
import { VideoGenerationParameters } from '@/lib/types';
import { useVideoSubmit } from '@/hooks/useVideoSubmit';
import { VideoComponentErrorBoundary } from '@/components/ui/error-boundary-wrapper';
import { PromptSection } from './PromptSection';
import { ModelSelectionSection } from './ModelSelectionSection';
import { ParametersSection } from './ParametersSection';
import { SubmitButton } from './SubmitButton';
import { OfflineAlert } from './OfflineAlert';
import { useVideoFormValidation } from '@/hooks/useVideoFormValidation';

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
  // Use the validation hook
  const { validationErrors, validateForm, isFormValid, isOffline } = useVideoFormValidation({
    prompt,
    selectedModelId,
    parameters
  });

  // Check if we're using a reference image
  const hasReferenceImage = !!parameters.referenceImageId;

  // Use the submission hook
  const { isGenerating, handleSubmit: handleFormSubmit } = useVideoSubmit({
    onVideoCreated,
    selectedModelId,
    prompt,
    parameters
  });

  // Handle form submission with validation
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      handleFormSubmit(e);
    }
  }, [handleFormSubmit, validateForm]);

  return (
    <VideoComponentErrorBoundary componentName="VideoGeneratorForm">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Offline Warning */}
        <OfflineAlert isOffline={isOffline} />
      
        {/* Main Prompt Input */}
        <PromptSection
          prompt={prompt}
          onPromptChange={onPromptChange}
          placeholder="Describe the video you want to generate..."
          disabled={isGenerating || isOffline}
          maxLength={1000}
          error={validationErrors.prompt}
          hasReferenceImage={hasReferenceImage}
        />
        
        {/* Model Selection */}
        <ModelSelectionSection
          selectedModelId={selectedModelId}
          onModelSelect={onModelSelect}
          disabled={isGenerating || isOffline}
          error={validationErrors.selectedModelId}
        />
        
        {/* Model Parameters */}
        {selectedModelId && (
          <ParametersSection
            selectedModelId={selectedModelId}
            parameters={parameters}
            onParameterChange={onParameterChange}
            errors={validationErrors}
            disabled={isGenerating || isOffline}
          />
        )}
        
        {/* Submit Button */}
        <SubmitButton
          isGenerating={isGenerating}
          isOffline={isOffline}
          isFormValid={isFormValid}
          validationErrors={validationErrors}
        />
      </form>
    </VideoComponentErrorBoundary>
  );
});

VideoGeneratorForm.displayName = 'VideoGeneratorForm';

export { VideoGeneratorForm };
