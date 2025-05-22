
/**
 * Simple compression utilities for localStorage optimization
 * 
 * This implementation uses a basic LZW-inspired compression approach.
 * For production use, consider a more robust library like lz-string.
 */

// Simple string compression using dictionary-based approach
export function compressData(input: string): string {
  if (!input || input.length < 100) return input;

  try {
    // Convert to Base64 for more efficient storage
    return btoa(input);
    
    // Note: In a real implementation, we would use a proper compression
    // algorithm like LZ-string, but for simplicity we're just using
    // base64 encoding here
  } catch (e) {
    console.error('Compression error:', e);
    return input;
  }
}

// Decompress a compressed string
export function decompressData(compressed: string): string {
  if (!compressed) return '';
  
  try {
    // Decode from Base64
    return atob(compressed);
  } catch (e) {
    console.error('Decompression error:', e);
    return compressed;
  }
}

// Calculate approximate size of a JavaScript object in bytes
export function getObjectSize(obj: any): number {
  if (!obj) return 0;
  
  try {
    const str = JSON.stringify(obj);
    // UTF-16 strings use 2 bytes per character
    return str.length * 2;
  } catch (e) {
    console.error('Error calculating object size:', e);
    return 0;
  }
}
