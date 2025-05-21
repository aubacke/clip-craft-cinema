
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SettingsButton } from '@/components/SettingsButton';
import { createVideoPrediction } from '@/services/video/predictionService';
import { toast } from 'sonner';
import { Video } from '@/lib/types';
import { useReplicateModels } from '@/hooks/useReplicateModels';
import { PromptInput } from './PromptInput';
import { ModelSelector } from './ModelSelector';
import { ModelParameters } from './ModelParameters';
import { VideoGenerationParameters } from '@/lib/replicateTypes';

interface VideoGeneratorCardProps {
  onVideoCreated: (video: Video) => void;
}

export const VideoGeneratorCard: React.FC<VideoGeneratorCardProps> = ({ onVideoCreated }) => {
  const [parameters, setParameters] = useState<VideoGenerationParameters>({
    prompt: '',
    negative_prompt: '',
    use_randomized_seed: true,
    model_specific: {}
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { 
    models, 
    isLoading, 
    errorMessage, 
    modelVersions, 
    selectedModelId, 
    selectedModel,
    setSelectedModelId
  } = useReplicateModels();

  const handleGenerate = async () => {
    if (!parameters.prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!selectedModelId || !modelVersions[selectedModelId]) {
      toast.error("Invalid model selection");
      return;
    }

    try {
      setIsGenerating(true);
      const modelVersion = modelVersions[selectedModelId];
      
      const newVideo = await createVideoPrediction(
        parameters, 
        selectedModelId, 
        modelVersion
      );
      
      onVideoCreated(newVideo);
      toast.success("Video generation started");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to start video generation");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Video</h2>
          <SettingsButton />
        </div>
        
        <PromptInput 
          prompt={parameters.prompt} 
          onPromptChange={(prompt) => setParameters({...parameters, prompt})} 
        />
        
        <ModelSelector 
          isLoading={isLoading}
          errorMessage={errorMessage}
          models={models}
          selectedModelId={selectedModelId}
          onModelSelect={setSelectedModelId}
          selectedModel={selectedModel}
        />
        
        {selectedModelId && (
          <div className="mb-6">
            <ModelParameters
              selectedModelId={selectedModelId}
              parameters={parameters}
              onParameterChange={setParameters}
            />
          </div>
        )}
        
        <Button 
          className="w-full" 
          onClick={handleGenerate}
          disabled={isGenerating || !parameters.prompt.trim() || isLoading || !selectedModel}
        >
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </CardContent>
    </Card>
  );
};
