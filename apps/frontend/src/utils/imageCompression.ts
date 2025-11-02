import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;        // Maximum size in MB (default: 2MB)
  maxWidthOrHeight?: number;  // Maximum width or height in pixels (default: 1920)
  useWebWorker?: boolean;     // Use web worker for better performance (default: true)
  quality?: number;           // Image quality 0-1 (default: 0.8)
  fileType?: string;          // Output file type (default: keep original)
}

/**
 * Compress image before upload
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed file
 */
export async function compressImage(
  file: File,
  options?: CompressionOptions
): Promise<File> {
  // Default options for web images
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 2,              // Target 2MB (still allows up to 10MB after compression)
    maxWidthOrHeight: 1920,    // Max dimension 1920px (good for web)
    useWebWorker: true,        // Better performance
    quality: 0.8,              // 80% quality (good balance)
    fileType: undefined,       // Keep original format unless too large
  };

  const compressionOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    console.log(`📸 Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Compress image
    const compressedFile = await imageCompression(file, compressionOptions as any);
    
    const originalSize = file.size / 1024 / 1024;
    const compressedSize = compressedFile.size / 1024 / 1024;
    const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    
    console.log(`✅ Image compressed: ${originalSize.toFixed(2)}MB → ${compressedSize.toFixed(2)}MB (${compressionRatio}% reduction)`);
    
    return compressedFile;
  } catch (error) {
    console.error('❌ Image compression failed:', error);
    // If compression fails, return original file
    console.warn('⚠️ Returning original file without compression');
    return file;
  }
}

/**
 * Check if file needs compression
 * @param file - File to check
 * @param maxSizeMB - Maximum size in MB before compression (default: 3MB)
 * @returns true if file needs compression
 */
export function needsCompression(file: File, maxSizeMB: number = 3): boolean {
  const fileSizeMB = file.size / 1024 / 1024;
  return fileSizeMB > maxSizeMB;
}

