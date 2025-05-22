
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shuffle, AlertCircle } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  error?: string; // Add error prop
}

// Categorized sample prompts
const PROMPT_CATEGORIES = {
  'Nature': [
    'Beautiful timelapse of cherry blossoms blooming in spring',
    'Drone footage flying over mountains with snow-capped peaks',
    'Ocean waves crashing against rocky cliffs at sunset',
    'Misty forest at dawn with sunbeams filtering through trees'
  ],
  'Animals': [
    'A cinematic shot of a fluffy corgi running through a field at sunset',
    'Majestic eagle soaring through mountain valleys',
    'Playful dolphins jumping in crystal clear ocean water',
    'Slow motion of a hummingbird hovering near colorful flowers'
  ],
  'Urban': [
    'An animation of a futuristic cityscape with flying cars and neon lights',
    'Busy street market with vendors and colorful stalls',
    'Rain falling on city streets with neon reflections',
    'Time-lapse of traffic flowing through a major intersection at night'
  ],
  'Creative': [
    'Close-up of coffee being poured into a cup in slow motion',
    'Abstract patterns of colorful paint mixing in water',
    'Ink drops spreading in clear water creating beautiful patterns',
    'Sparks flying from a blacksmith forging metal in slow motion'
  ]
};

// Function to truncate prompt for display
const truncatePrompt = (prompt: string, maxLength: number = 30): string => {
  if (prompt.length <= maxLength) return prompt;
  
  // Try to find a good breaking point (space) near the maxLength
  const breakPoint = prompt.lastIndexOf(' ', maxLength - 3);
  if (breakPoint > maxLength * 0.6) {
    // If we found a good breaking point that's not too short
    return prompt.substring(0, breakPoint) + '...';
  }
  
  // Otherwise just cut at maxLength
  return prompt.substring(0, maxLength - 3) + '...';
};

// Get all prompts as a flattened array
const getAllPrompts = (): string[] => {
  return Object.values(PROMPT_CATEGORIES).flat();
};

export const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, 
  onPromptChange,
  placeholder = "Describe the video you want to generate...",
  disabled = false,
  maxLength = 1000,
  error
}) => {
  // State for shuffled prompts
  const [shuffledPrompts, setShuffledPrompts] = useState<string[]>([]);
  
  // Function to shuffle prompts and get a subset
  const shufflePrompts = useCallback(() => {
    const allPrompts = getAllPrompts();
    const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
    setShuffledPrompts(shuffled.slice(0, 5));
  }, []);
  
  // Initialize shuffled prompts on component mount
  useEffect(() => {
    shufflePrompts();
  }, [shufflePrompts]);

  const handleSelectSamplePrompt = () => {
    const allPrompts = getAllPrompts();
    const randomIndex = Math.floor(Math.random() * allPrompts.length);
    onPromptChange(allPrompts[randomIndex]);
  };

  const useSamplePrompt = useCallback((samplePrompt: string) => {
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
        className={`min-h-[120px] ${error ? 'border-destructive' : ''}`}
        disabled={disabled}
      />
      
      {error && (
        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex flex-col mt-2 space-y-2">
        <div className="text-xs text-muted-foreground text-right">
          {prompt.length}/{maxLength} characters
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>Quick Start Ideas:</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs px-2 py-0 flex items-center" 
              onClick={shufflePrompts}
              disabled={disabled}
            >
              <Shuffle className="h-3 w-3 mr-1" /> Shuffle
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {shuffledPrompts.map((sample, index) => (
              <Badge 
                key={index}
                variant="outline" 
                interactive={true}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => useSamplePrompt(sample)}
              >
                {truncatePrompt(sample, 35)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
