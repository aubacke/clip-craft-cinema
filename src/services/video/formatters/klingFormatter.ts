
import { VideoGenerationParameters } from '@/lib/replicateTypes';
import { ModelFormatter } from '../types';

export const klingFormatter: ModelFormatter = {
  formatInputs: (parameters: VideoGenerationParameters): Record<string, any> => {
    const inputParams: Record<string, any> = {
      prompt: parameters.prompt
    };
    
    if (parameters.negative_prompt) {
      inputParams.negative_prompt = parameters.negative_prompt;
    }
    
    if (parameters.image_url) {
      inputParams.image = parameters.image_url;
    }
    
    if (parameters.width) inputParams.width = parameters.width;
    if (parameters.height) inputParams.height = parameters.height;
    if (parameters.cfg_scale) inputParams.guidance_scale = parameters.cfg_scale;
    if (parameters.num_frames) inputParams.num_frames = parameters.num_frames;
    if (parameters.fps) inputParams.fps = parameters.fps;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    if (parameters.model_specific?.motion_strength) {
      inputParams.motion_strength = parameters.model_specific.motion_strength;
    }
    
    return inputParams;
  }
};
