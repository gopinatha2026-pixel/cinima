
export enum AppMode {
  LIVE_VOICE = 'LIVE_VOICE',
  IMAGE_EDIT = 'IMAGE_EDIT',
  VIDEO_GEN = 'VIDEO_GEN',
  SEARCH_CHAT = 'SEARCH_CHAT'
}

// Fixed: GroundingMetadata updated to make uri and title optional, 
// ensuring compatibility with the @google/genai SDK's GroundingChunkWeb and GroundingChunkMaps types.
export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: { uri?: string; title?: string };
    maps?: { uri?: string; title?: string };
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  grounding?: GroundingMetadata;
  imageUrl?: string;
}
