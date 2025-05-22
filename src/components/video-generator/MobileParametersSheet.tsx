
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ModelParameters, ModelParametersProps } from './ModelParameters';

interface MobileParametersSheetProps extends ModelParametersProps {
  title?: string;
  description?: string;
}

export const MobileParametersSheet: React.FC<MobileParametersSheetProps> = ({
  title = "Advanced Settings",
  description = "Configure the parameters for your video generation",
  ...modelParametersProps
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="sm:hidden">
          <Settings className="h-4 w-4 mr-2" />
          Parameters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] sm:max-w-none">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          <ModelParameters {...modelParametersProps} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
