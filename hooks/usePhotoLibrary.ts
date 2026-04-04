import { useContext } from 'react';
import { PhotoLibraryContext } from '@/contexts/PhotoLibraryContext';

export function usePhotoLibrary() {
  const context = useContext(PhotoLibraryContext);
  if (!context) {
    throw new Error('usePhotoLibrary must be used within PhotoLibraryProvider');
  }
  return context;
}
