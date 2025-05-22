
import React from "react";
import { ErrorBoundary } from "@/lib/errorHandling";
import { ErrorFallback } from "@/components/ui/error-fallback";

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function ErrorBoundaryWrapper({
  children,
  fallbackComponent: FallbackComponent = ErrorFallback,
  onReset,
  onError,
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      fallback={(error, resetErrorBoundary) => {
        const handleReset = () => {
          resetErrorBoundary();
          onReset?.();
        };
        
        return <FallbackComponent error={error} resetErrorBoundary={handleReset} />;
      }}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

// Helper component for wrapping video-related components
export function VideoComponentErrorBoundary({
  children,
  componentName,
}: {
  children: React.ReactNode;
  componentName?: string;
}) {
  const handleError = (error: Error) => {
    console.error(`Error in ${componentName || 'video component'}:`, error);
  };
  
  return (
    <ErrorBoundaryWrapper
      onError={handleError}
      fallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          title={`Error in ${componentName || 'video component'}`}
          showDetails={false}
        />
      )}
    >
      {children}
    </ErrorBoundaryWrapper>
  );
}
