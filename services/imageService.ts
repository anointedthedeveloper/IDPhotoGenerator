import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type PhotoType = 'full' | 'half';
export type BackgroundColor = 'white' | 'gray' | 'blue' | 'red' | 'green' | 'lightblue';
export type ClothingStyle = 'suit' | 'keep';
export type AspectRatio = '4:3' | '3:4';

export interface GeneratePhotoParams {
  image: string;
  photoType: PhotoType;
  backgroundColor: BackgroundColor;
  aspectRatio: AspectRatio;
  clothingStyle: ClothingStyle;
}

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Gallery permission denied. Please enable photo library access in settings.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
};

export const convertImageToBase64 = async (uri: string): Promise<string> => {
  // For local file URIs on native (file:// or content://)
  if (Platform.OS !== 'web' && (uri.startsWith('file://') || uri.startsWith('content://'))) {
    // Use expo-file-system to read file and convert to base64
    const FileSystem = await import('expo-file-system');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Detect format from uri
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  }

  // For web or http URLs
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
