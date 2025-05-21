
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ReplicateSettings } from "@/lib/replicateTypes";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState<ReplicateSettings>({
    apiKey: null
  });
  const [inputApiKey, setInputApiKey] = useState("");

  useEffect(() => {
    // Load settings from local storage
    const storedApiKey = localStorage.getItem("replicateApiKey");
    if (storedApiKey) {
      setSettings({ apiKey: storedApiKey });
      setInputApiKey("********"); // Don't show actual API key, just placeholders
    }
  }, [open]);

  const handleSaveApiKey = () => {
    // Don't overwrite with placeholder
    if (inputApiKey && inputApiKey !== "********") {
      localStorage.setItem("replicateApiKey", inputApiKey);
      setSettings({ apiKey: inputApiKey });
      toast.success("Replicate API key saved successfully");
    }
    onOpenChange(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("replicateApiKey");
    setSettings({ apiKey: null });
    setInputApiKey("");
    toast.info("Replicate API key removed");
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right col-span-1">
              API Key
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="apiKey"
                type="password"
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                placeholder="Enter your Replicate API key"
                className="flex-1"
              />
              {settings.apiKey && (
                <Button variant="outline" size="icon" onClick={handleClearApiKey} title="Clear API key">
                  <span className="sr-only">Clear</span>
                  ✕
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleSaveApiKey}>Save Changes</Button>
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
