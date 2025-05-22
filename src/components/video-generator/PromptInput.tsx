
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SAMPLE_PROMPTS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  onPromptChange,
  placeholder = "Describe the video you want to generate...",
  disabled = false,
  maxLength = 1000
}) => {
  const handleSelectSamplePrompt = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    onPromptChange(SAMPLE_PROMPTS[randomIndex]);
  };

  const useSamplePrompt = React.useCallback((samplePrompt: string) => {
    onPromptChange(samplePrompt);
  }, [onPromptChange]);

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
        onChange={(e) => onPromptChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        className="min-h-[120px]"
        disabled={disabled}
      />
      
      <div className="flex flex-col mt-2 space-y-2">
        <div className="text-xs text-muted-foreground text-right">
          {prompt.length}/{maxLength} characters
        </div>
        
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Quick Start Ideas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.slice(0, 3).map((sample, index) => (
              <Badge 
                key={index}
                variant="outline" 
                interactive={true}
                className="hover:bg-primary hover:text-primary-foreground"
                onClick={() => useSamplePrompt(sample)}
              >
                {sample.length > 30 ? `${sample.substring(0, 30)}...` : sample}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
