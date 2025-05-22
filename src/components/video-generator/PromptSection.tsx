
import React from 'react';
import { PromptInput, PromptInputProps } from './PromptInput';
import { LoadingState } from './shared/LoadingState';
import { Badge } from '@/components/ui/badge';
import { ImageIcon } from 'lucide-react';

interface PromptSectionProps extends PromptInputProps {
  hasReferenceImage: boolean;
  isLoading?: boolean;
}

export const PromptSection = React.memo<PromptSectionProps>(({
  hasReferenceImage,
  isLoading = false,
  ...promptInputProps
}) => {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Describe your video</h3>
        <LoadingState type="text" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Describe your video</h3>
      <PromptInput {...promptInputProps} />
      
      {/* Reference Image Info - only shown when used */}
      {hasReferenceImage && (
        <div className="bg-secondary/20 p-3 rounded-md border-l-4 border-primary/70 mt-3">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Using reference image</span>
            <Badge variant="outline" className="ml-auto text-xs">Reference image applied</Badge>
          </div>
        </div>
      )}
    </div>
  );
});

PromptSection.displayName = 'PromptSection';
