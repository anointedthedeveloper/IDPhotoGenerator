import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getSupabaseClient } from '@/template';

export interface Photo {
  id: string;
  original_image_url: string;
  generated_image_url: string;
  photo_type: string;
  background_color: string;
  aspect_ratio: string;
  created_at: string;
}

interface AddPhotoParams {
  original_image_url: string;
  generated_image_url: string;
  photo_type: string;
  background_color: string;
  aspect_ratio: string;
}

interface PhotoLibraryContextType {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  addPhoto: (params: AddPhotoParams) => Promise<{ data: Photo | null; error: string | null }>;
  deletePhoto: (id: string) => Promise<{ error: string | null }>;
  refreshPhotos: () => Promise<void>;
}

const PhotoLibraryContext = createContext<PhotoLibraryContextType | null>(null);

export function PhotoLibraryProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data, error: fetchError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPhotos(data ?? []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPhoto = useCallback(async (params: AddPhotoParams) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error: insertError } = await supabase
        .from('photos')
        .insert(params)
        .select()
        .single();

      if (insertError) return { data: null, error: insertError.message };

      setPhotos(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message };
    }
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error: deleteError } = await supabase.from('photos').delete().eq('id', id);

      if (deleteError) return { error: deleteError.message };

      setPhotos(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }, []);

  return (
    <PhotoLibraryContext.Provider value={{ photos, loading, error, addPhoto, deletePhoto, refreshPhotos }}>
      {children}
    </PhotoLibraryContext.Provider>
  );
}

export function usePhotoLibraryContext() {
  const ctx = useContext(PhotoLibraryContext);
  if (!ctx) throw new Error('usePhotoLibraryContext must be used within PhotoLibraryProvider');
  return ctx;
}
