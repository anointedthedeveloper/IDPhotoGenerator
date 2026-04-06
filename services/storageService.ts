import { getSupabaseClient } from '@/template';
import { Platform } from 'react-native';

const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binaryStr = atob(parts[1]);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
};

const localUriToBlob = async (uri: string): Promise<Blob> => {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    return res.blob();
  }
  // On native: use expo-file-system to read file bytes directly
  const FileSystem = await import('expo-file-system');
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
};

export const uploadImageToStorage = async (
  imageUri: string,
  userId: string,
  type: 'original' | 'generated'
): Promise<{ url: string | null; error: string | null }> => {
  const supabase = getSupabaseClient();

  try {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const filename = `${userId}/${type}_${timestamp}_${randomSuffix}.jpg`;

    let file: Blob;
    if (imageUri.startsWith('data:')) {
      file = base64ToBlob(imageUri);
    } else {
      file = await localUriToBlob(imageUri);
    }

    const { data, error } = await supabase.storage
      .from('id-photos')
      .upload(filename, file, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: null, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('id-photos')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload exception:', err);
    return { url: null, error: (err as Error).message || 'Failed to upload image' };
  }
};
