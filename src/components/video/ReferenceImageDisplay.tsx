
import React from 'react';

interface ReferenceImageDisplayProps {
  referenceImage: { dataUrl: string } | null;
}

export const ReferenceImageDisplay: React.FC<ReferenceImageDisplayProps> = ({
  referenceImage
}) => {
  if (!referenceImage) return null;

  return (
    <div className="mb-6 p-4 border rounded-lg">
      <h2 className="text-lg font-medium mb-2">Reference Image</h2>
      <div className="max-w-md">
        <img 
          src={referenceImage.dataUrl} 
          alt="Reference" 
          className="rounded-md w-full object-contain max-h-60"
        />
      </div>
    </div>
  );
};
