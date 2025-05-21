
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SettingsButton } from '@/components/SettingsButton';
import { createVideoPrediction } from '@/services/videoApi';
import { toast } from 'sonner';
import { Video } from '@/lib/types';
import { useReplicateModels } from '@/hooks/useReplicateModels';
import { PromptInput } from './PromptInput';
import { ModelSelector } from './ModelSelector';

interface VideoGeneratorCardProps {
  onVideoCreated: (video: Video) => void;
}

export const VideoGeneratorCard: React.FC<VideoGeneratorCardProps> = ({ onVideoCreated }) => {
  const [prompt, setPrompt] = useState('');
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
    if (!prompt.trim()) {
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
      
      const newVideo = await createVideoPrediction(prompt, selectedModelId, modelVersion);
      onVideoCreated(newVideo);
      
      toast.success("Video generation started");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to start video generation");
    } finally {
      setIsGenerating(false);
    }
  };

  // Log current models for debugging
  console.log("Available models:", models.map(m => `${m.owner}/${m.name}`));
  console.log("Selected model ID:", selectedModelId);

  return (
    <Card className="glass-card animate-fade-in">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Video</h2>
          <SettingsButton />
        </div>
        
        <PromptInput 
          prompt={prompt} 
          onPromptChange={setPrompt} 
        />
        
        <ModelSelector 
          isLoading={isLoading}
          errorMessage={errorMessage}
          models={models}
          selectedModelId={selectedModelId}
          onModelSelect={setSelectedModelId}
          selectedModel={selectedModel}
        />
        
        <Button 
          className="w-full" 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || isLoading || !selectedModel}
        >
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </CardContent>
    </Card>
  );
};
