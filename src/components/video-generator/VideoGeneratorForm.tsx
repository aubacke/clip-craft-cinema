
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { ModelParameters } from './ModelParameters';
import { PromptInput } from './PromptInput';
import { VideoGenerationParameters } from '@/lib/types';
import { useVideoSubmit } from '@/hooks/useVideoSubmit';
import { Badge } from '@/components/ui/badge';

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
  const { isGenerating, handleSubmit } = useVideoSubmit({
    onVideoCreated,
    selectedModelId,
    prompt,
    parameters
  });

  // Check if we're using a reference image
  const hasReferenceImage = !!parameters.referenceImageId;
  
  // Form validation
  const isFormValid = prompt.trim().length > 0 && selectedModelId;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PromptInput
        prompt={prompt}
        onPromptChange={onPromptChange}
        placeholder="Describe the video you want to generate..."
        disabled={isGenerating}
        maxLength={1000}
      />
      
      {hasReferenceImage && (
        <div className="bg-secondary/30 p-3 rounded-md flex items-center space-x-2">
          <ImageIcon className="h-4 w-4" />
          <span className="text-sm">Using reference image for generation</span>
          <Badge variant="secondary" className="ml-auto">Reference image</Badge>
        </div>
      )}
      
      <ModelSelector
        selectedModelId={selectedModelId}
        onModelSelect={onModelSelect}
        disabled={isGenerating}
      />
      
      <ModelParameters
        selectedModelId={selectedModelId}
        parameters={parameters}
        onParameterChange={onParameterChange}
      />
      
      <Button
        type="submit"
        className="w-full"
        disabled={isGenerating || !isFormValid}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Video...
          </>
        ) : (
          'Generate Video'
        )}
      </Button>
    </form>
  );
});

VideoGeneratorForm.displayName = 'VideoGeneratorForm';

export { VideoGeneratorForm };
