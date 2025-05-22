
export interface VideoModel {
  id: string;
  name: string;
  description: string;
  version: string;
  isNew?: boolean;
  isBeta?: boolean;
  generationTime?: string;
  bestFor?: string;
  resolution?: string;
  extendedDescription?: string;
}

export interface Video {
  id: string;
  prompt: string;
  modelId: string;
  status: 'processing' | 'completed' | 'failed';
  url?: string;
  thumbnailUrl?: string;
  createdAt: string;
  folderId?: string;
  referenceImageId?: string;
  error?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  isReferenceFolder?: boolean;
}

// Update the VideoGenerationParameters interface to include duration
export interface VideoGenerationParameters {
  prompt: string;
  image?: File | null;
  image_url?: string;
  referenceImageId?: string;
  referenceImageFolderId?: string;
  duration?: number;  // Adding the duration property
  [key: string]: any; // Allow for additional model-specific parameters
}
