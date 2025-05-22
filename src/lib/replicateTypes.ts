
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

export interface ReplicateModel {
  url: string;
  owner: string;
  name: string;
  description: string;
  visibility: string;
  github_url: string;
  paper_url: string;
  license_url: string;
  run_count: number;
  cover_image_url: string;
  default_version?: string;
  latest_version?: ModelVersion;
}

export interface ModelVersion {
  id: string;
  created_at: string;
  cog_version: string;
  openapi_schema: any;
}

export interface ReplicateModelDetails {
  url: string;
  owner: string;
  name: string;
  description: string;
  visibility: string;
  github_url: string;
  paper_url: string;
  license_url: string;
  run_count: number;
  cover_image_url: string;
  versions: ModelVersion[];
}

export interface VideoGenerationParameters {
  prompt: string;
  negative_prompt?: string;
  image?: File | null;
  image_url?: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  num_frames?: number;
  fps?: number;
  cfg_scale?: number;
  motion_bucket_id?: number;
  seed?: number;
  use_randomized_seed?: boolean;
  steps?: number;
  model_specific?: Record<string, any>;
  duration?: number;   // Adding the missing duration property
}

export interface ModelParameterDefinition {
  name: string;
  type: 'text' | 'number' | 'slider' | 'checkbox' | 'select' | 'image' | 'aspect-ratio' | 'integer' | 'string' | 'boolean';
  label: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: {value: string | number, label: string}[];
  enum?: (string | number)[];
  description?: string;
  isAdvanced?: boolean;
  modelSpecific?: string[];
}
