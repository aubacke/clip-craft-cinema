
import { useState, useCallback, useEffect } from 'react';

interface UseImageUploadOptions {
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const useImageUpload = ({
  onChange,
  maxSizeMB = 5,
  allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
}: UseImageUploadOptions) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Please use ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    
    return null;
  }, [allowedTypes, maxSizeMB]);

  const handleFile = useCallback((file: File | null) => {
    setError(null);

    if (!file) {
      setImagePreviewUrl(null);
      onChange(null);
      return;
    }
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    onChange(file);
  }, [validateFile, onChange]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
    
    // Reset the file input so the same file can be selected again
    e.target.value = '';
  }, [handleFile]);

  const handleRemoveImage = useCallback(() => {
    setImagePreviewUrl(null);
    onChange(null);
    setError(null);
  }, [onChange]);

  // Drag & drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  return {
    imagePreviewUrl,
    dragActive,
    error,
    handleImageUpload,
    handleRemoveImage,
    handleDrag,
    handleDrop
  };
};
