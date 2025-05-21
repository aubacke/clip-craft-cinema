
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { ModelParameters } from './ModelParameters';
import { PromptInput } from './PromptInput';
import { VideoGenerationParameters } from '@/lib/types';
import { useVideoSubmit } from '@/hooks/useVideoSubmit';

interface VideoGeneratorFormProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  parameters: VideoGenerationParameters;
  onParameterChange: (params: VideoGenerationParameters) => void;
  onVideoCreated: (video: any) => void;
}

export const VideoGeneratorForm: React.FC<VideoGeneratorFormProps> = ({
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PromptInput
        prompt={prompt}
        onPromptChange={onPromptChange}
        placeholder="Describe the video you want to generate..."
        disabled={isGenerating}
      />
      
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
        disabled={isGenerating || !prompt.trim()}
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
};
