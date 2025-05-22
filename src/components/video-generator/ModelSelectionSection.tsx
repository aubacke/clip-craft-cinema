
import React from 'react';
import { ModelSelector, ModelSelectorProps } from './ModelSelector';
import { LoadingState } from './shared/LoadingState';
import { Separator } from '@/components/ui/separator';

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
      <h3 className="text-lg font-medium mb-3">Select model</h3>
      
      {isLoading ? (
        <LoadingState type="select" />
      ) : (
        <ModelSelector {...modelSelectorProps} />
      )}
    </div>
  );
});

ModelSelectionSection.displayName = 'ModelSelectionSection';
