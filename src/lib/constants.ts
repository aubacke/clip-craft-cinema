
import { VideoModel } from "./types";

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: "google/veo-2",
    name: "Google Veo 2",
    description: "Google's state-of-the-art text-to-video generation model",
    version: "accd3bc82888e83d9628378a5b55312c36566a6d33a004ee3a9a35141eb69286"
  },
  {
    id: "kwaivgi/kling-v2.0",
    name: "Kling 2.0",
    description: "Generate high-quality videos with advanced motion dynamics",
    version: "2ca27df545d8de09bd3ea02ec12f2c6eb8620d6dac03b9e83bbc39eced1866a5"
  },
  {
    id: "kwaivgi/kling-v1.6-pro",
    name: "Kling 1.6 Pro",
    description: "Professional video generation with enhanced visual quality",
    version: "6dc5f9c41eeaef32368eb8c0b56bb93c06f0e53a3386c690f72bbe01c18d8e14"
  },
  {
    id: "luma/ray-2-720p",
    name: "Luma Ray 2",
    description: "High-definition video generation with cinematic quality",
    version: "bbf97c586baab12a5955ecd3a3e98d1151218c4633779b5d1f292c915460f9f6"
  },
  {
    id: "luma/ray-flash-2-720p",
    name: "Luma Ray Flash",
    description: "Ultra-fast video generation with the Luma engine",
    version: "4e3c4baefed2b072283c909bb13008aa3cd29f6dacfef95e04a5055f95e29145"
  }
];

export const DEFAULT_MODEL_ID = "google/veo-2";

export const SAMPLE_PROMPTS = [
  "A cinematic shot of a fluffy corgi running through a field at sunset",
  "Beautiful timelapse of cherry blossoms blooming in spring",
  "Drone footage flying over mountains with snow-capped peaks",
  "An animation of a futuristic cityscape with flying cars and neon lights",
  "Close-up of coffee being poured into a cup in slow motion"
];
