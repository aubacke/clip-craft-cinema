
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const lumaRayFlashParameters: ModelParameterDefinition[] = [
  {
    name: 'prompt',
    type: 'text',
    label: 'Prompt',
    description: 'Text prompt for video generation',
    isAdvanced: false
  },
  {
    name: 'negative_prompt',
    type: 'text',
    label: 'Negative Prompt',
    description: 'What should not be in the video',
    isAdvanced: true
  },
  {
    name: 'duration',
    type: 'select',
    label: 'Duration',
    defaultValue: 5,
    options: [
      { value: 2, label: '2 seconds' },
      { value: 3, label: '3 seconds' },
      { value: 5, label: '5 seconds' }
    ],
    description: 'Duration of the video in seconds',
    isAdvanced: false
  },
  {
    name: 'aspect_ratio',
    type: 'select',
    label: 'Aspect Ratio',
    defaultValue: '16:9',
    options: [
      { value: '16:9', label: '16:9 (Landscape)' }
    ],
    description: 'Aspect ratio of the generated video',
    isAdvanced: false
  },
  {
    name: 'model_specific.style',
    type: 'select',
    label: 'Style',
    defaultValue: 'abstract',
    options: [
      { value: 'abstract', label: 'Abstract' },
      { value: 'dynamic', label: 'Dynamic' },
      { value: 'colorful', label: 'Colorful' }
    ],
    description: 'Style of the video',
    isAdvanced: false
  },
  {
    name: 'model_specific.loop',
    type: 'checkbox',
    label: 'Loop Video',
    defaultValue: false,
    description: 'Whether the video should loop with smooth transitions',
    isAdvanced: true
  },
  {
    name: 'seed',
    type: 'number',
    label: 'Seed',
    description: 'Random seed for reproducibility. Leave blank for random',
    isAdvanced: true
  }
];
