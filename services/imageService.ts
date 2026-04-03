import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
  
  if (status !== 'granted') {
    throw new Error('Permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

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
  } else {
    const base64 = await fetch(uri)
      .then(res => res.blob())
      .then(blob => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
    return base64;
  }
};
