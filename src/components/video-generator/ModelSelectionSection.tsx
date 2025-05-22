
import React from 'react';
import { ModelSelector, ModelSelectorProps } from './ModelSelector';
import { LoadingState } from './shared/LoadingState';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface ModelSelectionSectionProps extends ModelSelectorProps {
  isLoading?: boolean;
}

export const ModelSelectionSection = React.memo<ModelSelectionSectionProps>(({
  isLoading = false,
  ...modelSelectorProps
}) => {
  return (
    <div>
      <Separator className="my-6" />
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Select model</h3>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge variant="outline" className="cursor-help">
              <Lightbulb className="h-3 w-3 mr-1" />
              Model tips
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Choosing the right model:</h4>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>Fast models are great for quick iterations</li>
                <li>Higher quality models take longer but produce better results</li>
                <li>Some models excel at specific types of content</li>
              </ul>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      
      {isLoading ? (
        <LoadingState type="select" />
      ) : (
        <ModelSelector {...modelSelectorProps} isLoading={isLoading} />
      )}
    </div>
  );
});

ModelSelectionSection.displayName = 'ModelSelectionSection';
