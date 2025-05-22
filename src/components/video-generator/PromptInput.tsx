
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormDescription, FormMessage } from '@/components/ui/form';

export interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  error?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  placeholder = 'Enter a description of the video you want to generate...',
  disabled = false,
  maxLength = 1000,
  error,
}) => {
  const characterCount = prompt?.length || 0;
  
  return (
    <div className="space-y-2">
      <FormControl>
        <Textarea
          placeholder={placeholder}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className="h-32 resize-none"
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-errormessage={error ? "prompt-error" : undefined}
        />
      </FormControl>
      <div className="flex justify-between items-center">
        <FormDescription className="text-xs">
          {characterCount}/{maxLength} characters
        </FormDescription>
        {error && (
          <FormMessage id="prompt-error" className="text-sm" aria-live="polite">
            {error}
          </FormMessage>
        )}
      </div>
    </div>
  );
};
