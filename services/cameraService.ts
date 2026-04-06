import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const capturePhotoWithCamera = async (): Promise<string | null> => {
  const granted = await requestCameraPermission();
  if (!granted) {
    throw new Error('Camera permission denied. Please enable camera access in settings.');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 1,
    cameraType: ImagePicker.CameraType.front,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
};
