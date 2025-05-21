
import { ModelFormatter } from '../types';
import { veoFormatter } from './veoFormatter';
import { klingFormatter } from './klingFormatter';
import { lumaFormatter } from './lumaFormatter';

export const getModelFormatter = (modelId: string): ModelFormatter => {
  if (modelId.includes('google/veo')) {
    return veoFormatter;
  } 
  else if (modelId.includes('kwaivgi/kling')) {
    return klingFormatter;
  } 
  else if (modelId.includes('luma/ray')) {
    return lumaFormatter;
  } 
  
  // Default to veoFormatter if no match
  return veoFormatter;
};
