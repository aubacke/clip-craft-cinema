
import React from 'react';
import { ModelParameters, ModelParametersProps } from './ModelParameters';
import { LoadingState } from './shared/LoadingState';

interface ParametersSectionProps extends ModelParametersProps {
  isLoading?: boolean;
}

export const ParametersSection = React.memo<ParametersSectionProps>(({
  isLoading = false,
  ...modelParametersProps
}) => {
  if (!modelParametersProps.selectedModelId) return null;
  
  return (
    <div>
      <h3 className="text-md font-medium text-muted-foreground mb-3">Advanced settings</h3>
      
      {isLoading ? (
        <LoadingState type="parameters" count={3} />
      ) : (
        <ModelParameters {...modelParametersProps} />
      )}
    </div>
  );
});

ParametersSection.displayName = 'ParametersSection';
