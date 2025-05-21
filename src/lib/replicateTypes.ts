
// Custom types for Replicate API integration
export interface ReplicateResponse {
  id: string;
  version: string;
  urls: {
    get: string;
    cancel: string;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: Record<string, any>;
  output?: string | string[] | null;
  error?: string | null;
  logs?: string | null;
}

export interface ReplicateSettings {
  apiKey: string | null;
}
