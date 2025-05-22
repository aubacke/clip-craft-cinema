
import React from 'react';
import { ModelParameters, ModelParametersProps } from './ModelParameters';
import { LoadingState } from './shared/LoadingState';
import { MobileParametersSheet } from './MobileParametersSheet';
import { Separator } from '@/components/ui/separator';

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
      <Separator className="my-6" />
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-medium text-muted-foreground">Advanced settings</h3>
        
        {/* Mobile-only sheet trigger */}
        <div className="sm:hidden">
          <MobileParametersSheet {...modelParametersProps} />
        </div>
      </div>
      
      {/* Desktop parameters view - hidden on mobile */}
      <div className="hidden sm:block">
        {isLoading ? (
          <LoadingState type="parameters" count={3} />
        ) : (
          <ModelParameters {...modelParametersProps} />
        )}
      </div>
    </div>
  );
});

ParametersSection.displayName = 'ParametersSection';
