
import React from 'react';
import { PromptInput, PromptInputProps } from './PromptInput';
import { LoadingState } from './shared/LoadingState';
import { Badge } from '@/components/ui/badge';
import { ImageIcon } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface PromptSectionProps extends PromptInputProps {
  hasReferenceImage: boolean;
  isLoading?: boolean;
  onSubmit?: () => void;
}

const promptExamples = [
  "A serene mountain landscape with a flowing river at sunset",
  "A bustling city street at night with vibrant neon signs",
  "A time-lapse of a flower blooming in a garden",
  "An astronaut floating in space with Earth in the background"
];

export const PromptSection = React.memo<PromptSectionProps>(({
  hasReferenceImage,
  isLoading = false,
  onSubmit,
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Describe your video</h3>
      
      <PromptInput {...promptInputProps} onSubmit={onSubmit} />
      
      {/* Sample prompts carousel - only shown when prompt is empty */}
      {!promptInputProps.prompt && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">Try one of these examples:</p>
          <Carousel className="w-full">
            <CarouselContent>
              {promptExamples.map((example, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div 
                    className="bg-secondary/20 p-3 rounded-md border border-secondary/30 h-24 
                              flex items-center justify-center text-center cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => promptInputProps.onPromptChange(example)}
                  >
                    <p className="text-sm">{example}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 lg:-left-12" />
            <CarouselNext className="right-2 lg:-right-12" />
          </Carousel>
        </div>
      )}
      
      {/* Reference Image Info - only shown when used */}
      {hasReferenceImage && (
        <div className="bg-secondary/20 p-3 rounded-md border-l-4 border-primary/70">
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
