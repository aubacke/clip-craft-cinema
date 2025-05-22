
import { ReactNode } from 'react';
import { toast } from 'sonner';
import { Component, ErrorInfo } from 'react';

/**
 * Custom error types for better error handling
 */

// Base application error
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

// Network related errors
export class NetworkError extends AppError {
  public readonly originalError?: Error;
  public readonly retryable: boolean;
  
  constructor(message: string, originalError?: Error, retryable = true) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
    this.retryable = retryable;
  }
}

// API errors (server responses with error status codes)
export class APIError extends AppError {
  public readonly statusCode: number;
  public readonly retryable: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    // Only certain types of errors should be retryable
    this.retryable = [408, 429, 500, 502, 503, 504].includes(statusCode);
  }
}

// Validation errors
export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string>;
  
  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Error boundary component to catch and handle rendering errors
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error!, this.resetErrorBoundary);
      }
      return this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Toast notification helpers with retry logic
 */

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffFactor?: number;
}

export const showErrorToast = (error: Error | string, options?: {
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  }
}) => {
  const message = typeof error === 'string' ? error : error.message;
  
  toast.error(options?.title || 'Error', {
    description: message,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    duration: 5000,
  });
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    delayMs = 1000, 
    backoffFactor = 2 
  } = options;

  let lastError: Error;
  let retryCount = 0;

  const retry = async (): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Don't retry non-retryable errors
      if (lastError instanceof AppError && 'retryable' in lastError && !lastError.retryable) {
        throw lastError;
      }
      
      retryCount++;
      
      if (retryCount <= maxRetries) {
        // Calculate exponential backoff delay
        const delay = delayMs * Math.pow(backoffFactor, retryCount - 1);
        
        // Show toast message about retry
        toast.info(`Retrying... (${retryCount}/${maxRetries})`, {
          description: `Automatically retrying in ${Math.round(delay / 1000)} seconds.`,
          duration: delay - 200, // Show toast until just before retry
        });
        
        // Wait for calculated delay before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try again
        return retry();
      }
      
      // Max retries reached, rethrow the last error
      throw lastError;
    }
  };

  return retry();
}

/**
 * Input validation utilities
 */
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export function validateInput(
  data: Record<string, any>,
  schema: ValidationSchema
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Network status utility for checking online/offline status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
