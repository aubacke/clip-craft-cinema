
import React, { KeyboardEvent, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { ValidationMessage } from './shared/ValidationMessage';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Lightbulb } from 'lucide-react';

export interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  error?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  onSubmit,
  placeholder = 'Enter a description of the video you want to generate...',
  disabled = false,
  maxLength = 1000,
  error,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characterCount = prompt?.length || 0;
  const isNearLimit = characterCount > maxLength * 0.8;
  
  // Sample prompts that could inspire users
  const samplePrompts = [
    "A serene mountain landscape with a flowing river, time-lapse of clouds passing by",
    "A bustling city street at night with vibrant neon signs and people walking",
    "Close-up of colorful paint mixing together with swirling patterns",
    "A blooming flower opening its petals in the morning sunlight"
  ];
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <HoverCard openDelay={300} closeDelay={200}>
            <HoverCardTrigger asChild>
              <Badge variant="outline" className="cursor-help">
                <Lightbulb className="h-3 w-3 mr-1" />
                Prompt tips
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Effective prompt tips:</h4>
                <ul className="text-xs space-y-1 list-disc pl-4">
                  <li>Be specific about visual details</li>
                  <li>Mention lighting, camera angle, and style</li>
                  <li>Include mood and atmosphere descriptions</li>
                </ul>
                <div className="pt-2 border-t border-border mt-2">
                  <p className="text-xs font-medium">Try these examples:</p>
                  <div className="mt-2 space-y-1">
                    {samplePrompts.map((sample, i) => (
                      <p 
                        key={i} 
                        className="text-xs p-1 rounded bg-secondary/50 cursor-pointer hover:bg-secondary" 
                        onClick={() => onPromptChange(sample)}
                      >
                        {sample}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          {onSubmit && (
            <Badge variant="outline" className="text-xs">
              Press Ctrl+Enter to submit
            </Badge>
          )}
        </div>
      </div>
      
      <FormControl>
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="h-32 resize-none"
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-errormessage={error ? "prompt-error" : undefined}
          onKeyDown={handleKeyDown}
        />
      </FormControl>
      
      <div className="flex justify-between items-center">
        <FormDescription className={`text-xs ${isNearLimit ? 'text-warning-500' : ''}`}>
          <span className={characterCount >= maxLength ? 'text-destructive font-medium' : ''}>
            {characterCount}
          </span>/{maxLength} characters
        </FormDescription>
        
        {error && <ValidationMessage message={error} />}
      </div>
    </div>
  );
};
