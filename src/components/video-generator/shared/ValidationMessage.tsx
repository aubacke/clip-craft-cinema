
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ValidationMessageProps {
  message: string;
  className?: string;
  variant?: 'inline' | 'alert';
}

export const ValidationMessage = React.memo<ValidationMessageProps>(({ 
  message, 
  className = '',
  variant = 'inline'
}) => {
  if (!message) return null;
  
  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={cn("py-2", className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1.5 text-destructive text-sm", 
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5" />
      <span>{message}</span>
    </div>
  );
});

ValidationMessage.displayName = 'ValidationMessage';
