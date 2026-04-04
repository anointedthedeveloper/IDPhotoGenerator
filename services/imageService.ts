import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export type PhotoType = 'full' | 'half';
export type BackgroundColor = 'white' | 'gray' | 'blue';
export type AspectRatio = '4:3' | '3:4';

export interface GeneratePhotoParams {
  image: string;
  photoType: PhotoType;
  backgroundColor: BackgroundColor;
  aspectRatio: AspectRatio;
}

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') throw new Error('Permission denied');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
};

export const convertImageToBase64 = async (uri: string): Promise<string> => {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Mobile: use expo-file-system (no FileReader needed)
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Detect mime type from URI extension
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  return `data:${mime};base64,${base64}`;
};
