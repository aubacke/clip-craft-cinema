
import { VideoGenerationParameters } from '@/lib/replicateTypes';
import { ModelFormatter } from '../types';

export const klingFormatter: ModelFormatter = {
  formatInputs: (parameters: VideoGenerationParameters): Record<string, any> => {
    const inputParams: Record<string, any> = {
      prompt: parameters.prompt
    };
    
    // Add negative_prompt parameter
    if (parameters.negative_prompt) {
      inputParams.negative_prompt = parameters.negative_prompt;
    }
    
    // For Kling model, the image parameter is called start_image
    if (parameters.image_url) {
      inputParams.start_image = parameters.image_url;
    }
    
    // Add aspect_ratio parameter
    if (parameters.aspect_ratio) inputParams.aspect_ratio = parameters.aspect_ratio;
    
    // Renamed from cfg_scale to guidance_scale based on the API parameters
    if (parameters.cfg_scale) inputParams.cfg_scale = parameters.cfg_scale;
    
    if (parameters.width) inputParams.width = parameters.width;
    if (parameters.height) inputParams.height = parameters.height;
    if (parameters.num_frames) inputParams.num_frames = parameters.num_frames;
    if (parameters.fps) inputParams.fps = parameters.fps;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    if (parameters.model_specific?.motion_strength) {
      inputParams.motion_strength = parameters.model_specific.motion_strength;
    }
    
    return inputParams;
  }
};
