import { getSupabaseClient } from '@/template';
import { Platform } from 'react-native';

export const uploadImageToStorage = async (
  imageUri: string,
  userId: string,
  type: 'original' | 'generated'
): Promise<{ url: string | null; error: string | null }> => {
  const supabase = getSupabaseClient();
  
  try {
    // Generate unique filename with random suffix to avoid conflicts
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const filename = `${userId}/${type}_${timestamp}_${randomSuffix}.jpg`;

    // Convert image to blob
    let file: Blob;
    if (Platform.OS === 'web') {
      if (imageUri.startsWith('data:')) {
        // Handle base64 data URLs on web
        const base64Data = imageUri.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        file = new Blob([byteArray], { type: 'image/jpeg' });
      } else {
        const response = await fetch(imageUri);
        file = await response.blob();
      }
    } else {
      // For mobile, convert base64 to blob
      if (imageUri.startsWith('data:')) {
        const base64Data = imageUri.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        file = new Blob([byteArray], { type: 'image/jpeg' });
      } else {
        const response = await fetch(imageUri);
        file = await response.blob();
      }
    }

    // Upload to storage with upsert to handle duplicates
    const { data, error } = await supabase.storage
      .from('id-photos')
      .upload(filename, file, {
        contentType: 'image/jpeg',
        upsert: false, // Don't overwrite, create unique files
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('id-photos')
      .getPublicUrl(data.path);

    console.log('Image uploaded successfully:', urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload exception:', err);
    return { url: null, error: (err as Error).message || 'Failed to upload image' };
  }
};
