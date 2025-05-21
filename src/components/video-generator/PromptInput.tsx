
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SAMPLE_PROMPTS } from '@/lib/constants';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  onPromptChange 
}) => {
  const handleSelectSamplePrompt = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    onPromptChange(SAMPLE_PROMPTS[randomIndex]);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium">
          Prompt
        </label>
        <Button 
          variant="link" 
          size="sm" 
          onClick={handleSelectSamplePrompt} 
          className="text-xs p-0 h-auto"
        >
          Use sample prompt
        </Button>
      </div>
      <Textarea 
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Describe the video you want to generate..."
        className="min-h-[120px]"
      />
    </div>
  );
};
