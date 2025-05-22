
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bug, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  className?: string;
  title?: string;
  showReset?: boolean;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  className,
  title = "Something went wrong",
  showReset = true,
  showDetails = true,
}: ErrorFallbackProps) {
  return (
    <Alert
      variant="destructive"
      className={cn("flex flex-col items-center justify-center p-6", className)}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-10 w-10" />
        <AlertTitle className="text-lg">{title}</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </AlertDescription>

        {showDetails && (
          <div className="text-xs text-muted-foreground mt-2 max-w-[400px] overflow-hidden text-ellipsis">
            <details>
              <summary className="cursor-pointer">Technical details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-left p-2 bg-background/10 rounded">
                {error.stack || error.toString()}
              </pre>
            </details>
          </div>
        )}

        {showReset && resetErrorBoundary && (
          <Button
            onClick={resetErrorBoundary}
            className="mt-4"
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    </Alert>
  );
}

export function ComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}

export function ErrorCard({
  title,
  message,
  onRetry,
  className,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-6 flex flex-col items-center text-center gap-4",
        className
      )}
    >
      <Bug className="h-10 w-10 text-destructive" />
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
