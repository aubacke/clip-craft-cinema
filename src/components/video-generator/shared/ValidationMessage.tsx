
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  message: string;
  className?: string;
}

export const ValidationMessage = React.memo<ValidationMessageProps>(({ 
  message, 
  className = '' 
}) => {
  if (!message) return null;
  
  return (
    <div className={`flex items-center gap-1.5 text-destructive text-sm mt-1 ${className}`}>
      <AlertCircle className="h-3.5 w-3.5" />
      <span>{message}</span>
    </div>
  );
});

ValidationMessage.displayName = 'ValidationMessage';
