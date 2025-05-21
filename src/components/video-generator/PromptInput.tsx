
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SAMPLE_PROMPTS } from '@/lib/constants';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  onPromptChange,
  placeholder = "Describe the video you want to generate...",
  disabled = false
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
          disabled={disabled}
        >
          Use sample prompt
        </Button>
      </div>
      <Textarea 
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px]"
        disabled={disabled}
      />
    </div>
  );
};
