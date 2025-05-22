
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon } from 'lucide-react';
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
        </div>
      )}
      
      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isGenerating || !isFormValid}
          size="lg"
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
      </div>
    </form>
  );
});

VideoGeneratorForm.displayName = 'VideoGeneratorForm';

export { VideoGeneratorForm };
