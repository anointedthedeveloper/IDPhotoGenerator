import { createContext, ReactNode, useState, useEffect } from 'react';
import { getSupabaseClient } from '@/template';

// Virtual user ID for anonymous usage
const VIRTUAL_USER_ID = '00000000-0000-0000-0000-000000000000';

export interface IDPhoto {
  id: string;
  user_id: string;
  original_image_url: string;
  generated_image_url: string;
  photo_type: 'full' | 'half';
  background_color: 'white' | 'gray' | 'blue';
  aspect_ratio: '4:3' | '3:4';
  created_at: string;
}

export interface PhotoLibraryContextType {
  photos: IDPhoto[];
  loading: boolean;
  error: string | null;
  addPhoto: (photo: Omit<IDPhoto, 'id' | 'user_id' | 'created_at'>) => Promise<{ data: IDPhoto | null; error: string | null }>;
  deletePhoto: (id: string) => Promise<{ error: string | null }>;
  refreshPhotos: () => Promise<void>;
}

export const PhotoLibraryContext = createContext<PhotoLibraryContextType | undefined>(undefined);

export function PhotoLibraryProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<IDPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const loadPhotos = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('id_photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPhotos(data || []);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const addPhoto = async (
    photo: Omit<IDPhoto, 'id' | 'user_id' | 'created_at'>
  ): Promise<{ data: IDPhoto | null; error: string | null }> => {
    try {
      const { data, error: insertError } = await supabase
        .from('id_photos')
        .insert({
          user_id: VIRTUAL_USER_ID,
          original_image_url: photo.original_image_url,
          generated_image_url: photo.generated_image_url,
          photo_type: photo.photo_type,
          background_color: photo.background_color,
          aspect_ratio: photo.aspect_ratio,
        })
        .select()
        .single();

      if (insertError) {
        return { data: null, error: insertError.message };
      }

      setPhotos(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to add photo' };
    }
  };

  const deletePhoto = async (id: string): Promise<{ error: string | null }> => {
    try {
      const photo = photos.find(p => p.id === id);
      if (!photo) {
        return { error: 'Photo not found' };
      }

      // Delete from storage
      const originalPath = photo.original_image_url.split('/id-photos/')[1];
      const generatedPath = photo.generated_image_url.split('/id-photos/')[1];

      if (originalPath) {
        await supabase.storage.from('id-photos').remove([originalPath]);
      }
      if (generatedPath) {
        await supabase.storage.from('id-photos').remove([generatedPath]);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('id_photos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return { error: deleteError.message };
      }

      setPhotos(prev => prev.filter(p => p.id !== id));
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message || 'Failed to delete photo' };
    }
  };

  const refreshPhotos = async () => {
    await loadPhotos();
  };

  return (
    <PhotoLibraryContext.Provider
      value={{
        photos,
        loading,
        error,
        addPhoto,
        deletePhoto,
        refreshPhotos,
      }}
    >
      {children}
    </PhotoLibraryContext.Provider>
  );
}
