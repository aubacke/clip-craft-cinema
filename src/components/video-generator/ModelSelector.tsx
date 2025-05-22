
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { VIDEO_MODELS } from '@/lib/constants';
import { FormMessage } from '@/components/ui/form';
import { ValidationMessage } from './shared/ValidationMessage';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export interface ModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
  error?: string;
  isLoading?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onModelSelect,
  disabled = false,
  error,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter models based on search query
  const filteredModels = VIDEO_MODELS.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={`model-skeleton-${i}`} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {error && (
        <ValidationMessage message={error} />
      )}
      
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Search models..." 
          onValueChange={setSearchQuery}
          disabled={disabled}
        />
        <CommandList>
          <CommandEmpty>No models found.</CommandEmpty>
          <CommandGroup>
            <div className="grid grid-cols-1 gap-4 p-2">
              {filteredModels.map((model) => {
                const isSelected = selectedModelId === model.id;
                
                return (
                  <CommandItem 
                    key={model.id}
                    onSelect={() => onModelSelect(model.id)}
                    className={`flex items-start p-0 ${isSelected ? 'ring-2 ring-primary/40' : ''}`}
                    disabled={disabled}
                  >
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Card 
                          className={`p-4 w-full cursor-pointer ${
                            isSelected 
                              ? 'bg-primary/10 border-primary/30' 
                              : 'bg-secondary/30 hover:bg-secondary/50'
                          } transition-colors`}
                        >
                          <div className="space-y-1">
                            <RadioGroup value={selectedModelId} onValueChange={onModelSelect} disabled={disabled}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={model.id} id={model.id} className="sr-only" />
                                <Label htmlFor={model.id} className="font-semibold text-sm">{model.name}</Label>
                                {model.isNew && (
                                  <Badge variant="info" className="ml-2 text-xs">New</Badge>
                                )}
                                {model.isBeta && (
                                  <Badge variant="warning" className="ml-2 text-xs">Beta</Badge>
                                )}
                              </div>
                            </RadioGroup>
                            <p className="text-xs text-muted-foreground">{model.description}</p>
                          </div>
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">{model.name}</h4>
                          <div className="space-y-1">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="font-medium">Generation time:</div>
                              <div>{model.generationTime || 'Variable'}</div>
                              
                              <div className="font-medium">Best for:</div>
                              <div>{model.bestFor || 'General purpose'}</div>
                              
                              <div className="font-medium">Resolution:</div>
                              <div>{model.resolution || 'Standard'}</div>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border mt-2">
                            <p className="text-xs text-muted-foreground">{model.extendedDescription || model.description}</p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};
