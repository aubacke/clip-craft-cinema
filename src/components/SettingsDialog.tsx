
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ReplicateSettings } from "@/lib/replicateTypes";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    if (open) {
      checkApiKey();
    }
  }, [open]);

  const checkApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("replicate-api", {
        body: { checkApiKey: true }
      });
      
      if (error) {
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
              <div className="flex-1 p-2 border rounded-md bg-muted">
                {apiKeyStatus === 'valid' ? (
                  <div className="flex items-center text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    API key configured in Supabase
                  </div>
                ) : (
                  <div className="flex items-center text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    API key not configured
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
