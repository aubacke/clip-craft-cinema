
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const lumaRayParameters: ModelParameterDefinition[] = [
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
      { value: 5, label: '5 seconds' },
      { value: 9, label: '9 seconds' }
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
    name: 'model_specific.concepts',
    type: 'select',
    label: 'Camera Concept',
    defaultValue: 'static',
    options: [
      { value: 'static', label: 'Static' },
      { value: 'pan_left', label: 'Pan Left' },
      { value: 'pan_right', label: 'Pan Right' },
      { value: 'zoom_in', label: 'Zoom In' },
      { value: 'zoom_out', label: 'Zoom Out' },
      { value: 'tilt_up', label: 'Tilt Up' },
      { value: 'tilt_down', label: 'Tilt Down' }
    ],
    description: 'Camera concept to apply to the video',
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
