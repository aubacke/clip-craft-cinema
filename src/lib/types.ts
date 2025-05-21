
export interface VideoModel {
  id: string;
  name: string;
  description: string;
  version: string;
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
