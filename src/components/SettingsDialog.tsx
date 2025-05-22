
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ReplicateSettings } from "@/lib/replicateTypes";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState<ReplicateSettings>({
    apiKey: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'unchecked' | 'valid' | 'invalid'>('unchecked');
  const [checkingApiKey, setCheckingApiKey] = useState(false);

  useEffect(() => {
    if (open) {
      checkApiKey();
    }
  }, [open]);

  const checkApiKey = async () => {
    try {
      setCheckingApiKey(true);
      
      const { data, error } = await supabase.functions.invoke("replicate-api", {
        body: { checkApiKey: true }
      });
      
      if (error || !data || data.error) {
        console.error("Error checking API key:", error || data?.error);
        setApiKeyStatus('invalid');
        setSettings({ apiKey: null });
      } else {
        setApiKeyStatus('valid');
        setSettings({ apiKey: 'configured' });
      }
    } catch (error) {
      console.error("Error checking API key:", error);
      setApiKeyStatus('invalid');
      setSettings({ apiKey: null });
    } finally {
      setCheckingApiKey(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application settings here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              Replicate API Key
            </Label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 border rounded-md bg-muted">
                {checkingApiKey ? (
                  <div className="flex items-center text-muted-foreground">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking API key status...
                  </div>
                ) : apiKeyStatus === 'valid' ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>API key configured in Supabase ✅</span>
                  </div>
                ) : apiKeyStatus === 'invalid' ? (
                  <div className="flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Invalid API key ❌</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-500">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>API key not configured ⚠️</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The API key needs to be set in Supabase Edge Functions secrets.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground mt-2">
            <a 
              href="https://replicate.com/account/api-tokens" 
              target="_blank" 
              rel="noreferrer"
              className="underline hover:no-underline"
            >
              Get your Replicate API key here
            </a>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={checkApiKey}
            disabled={checkingApiKey}
          >
            {checkingApiKey ? "Checking..." : "Refresh Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
