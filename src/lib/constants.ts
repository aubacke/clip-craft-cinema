
import { VideoModel } from "./types";

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: "stability-ai/stable-video-diffusion",
    name: "Stable Video Diffusion",
    description: "Generate videos from images using Stable Diffusion",
    version: "c8c066dea4e22ce35de56f0226bf144d3f666aac75bbd3418b269729fa0dab40"
  },
  {
    id: "lucataco/animate-diff",
    name: "Animate Diff",
    description: "Create fluid animations from text prompts",
    version: "1f70df83a3f9457a21504b42d2ee3bd797217716ebb86374b872f180e857b889"
  },
  {
    id: "lucataco/sdxl-lightning-4step",
    name: "SDXL Lightning",
    description: "Ultra-fast video generation with SDXL",
    version: "5c5d9e37598e17e8cd5fec6a946c3f65115915ca578fbd6a49d5bfc11102f408"
  },
  {
    id: "video-ldm/text-to-video-synthesis",
    name: "Text to Video",
    description: "Generate videos directly from text descriptions",
    version: "a1631954dce6fe36b8e4fb98aeb9c3ee8c36864b91d766476456d1902bd38ffa"
  }
];

export const DEFAULT_MODEL_ID = "stability-ai/stable-video-diffusion";

export const SAMPLE_PROMPTS = [
  "A cinematic shot of a fluffy corgi running through a field at sunset",
  "Beautiful timelapse of cherry blossoms blooming in spring",
  "Drone footage flying over mountains with snow-capped peaks",
  "An animation of a futuristic cityscape with flying cars and neon lights",
  "Close-up of coffee being poured into a cup in slow motion"
];
