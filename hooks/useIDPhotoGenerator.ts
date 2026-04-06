import { useState } from 'react';
import {
  PhotoType,
  BackgroundColor,
  AspectRatio,
  ClothingStyle,
  pickImage,
  convertImageToBase64,
} from '@/services/imageService';
import { generateIDPhoto, GeneratePhotoResult } from '@/services/aiService';
import { uploadImageToStorage } from '@/services/storageService';
import { scheduleGenerationCompleteNotification } from '@/services/notificationService';
import { usePhotoLibrary } from './usePhotoLibrary';
import { IDPhotoTemplate } from '@/constants/templates';

const VIRTUAL_USER_ID = '00000000-0000-0000-0000-000000000000';

export const useIDPhotoGenerator = () => {
  const { addPhoto } = usePhotoLibrary();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>('half');
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>('white');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [clothingStyle, setClothingStyle] = useState<ClothingStyle>('suit');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [generatedPhotos, setGeneratedPhotos] = useState<GeneratePhotoResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickImage = async () => {
    try {
      setError(null);
      const uri = await pickImage();
      if (uri) setSelectedImage(uri);
    } catch (err) {
      setError((err as Error).message || 'Failed to pick image');
    }
  };

  const handleEditedImage = (uri: string) => {
    setSelectedImage(uri);
  };

  const applyTemplate = (template: IDPhotoTemplate) => {
    setSelectedTemplateId(template.id);
    setPhotoType(template.photoType);
    setBackgroundColor(template.backgroundColor);
    setAspectRatio(template.aspectRatio);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const base64Image = await convertImageToBase64(selectedImage);

      const { data, error: genError } = await generateIDPhoto({
        image: base64Image,
        photoType,
        backgroundColor,
        aspectRatio,
        clothingStyle,
      });

      if (genError) {
        setError(genError);
        return;
      }

      if (data) {
        // Upload original & generated in parallel for speed
        const [originalResult, generatedResult] = await Promise.all([
          uploadImageToStorage(selectedImage, VIRTUAL_USER_ID, 'original'),
          uploadImageToStorage(data.image, VIRTUAL_USER_ID, 'generated'),
        ]);

        if (originalResult.error || !originalResult.url) {
          setError(originalResult.error || 'Failed to upload original image');
          return;
        }
        if (generatedResult.error || !generatedResult.url) {
          setError(generatedResult.error || 'Failed to upload generated image');
          return;
        }

        const { data: savedPhoto, error: saveError } = await addPhoto({
          original_image_url: originalResult.url,
          generated_image_url: generatedResult.url,
          photo_type: photoType,
          background_color: backgroundColor,
          aspect_ratio: aspectRatio,
        });

        if (saveError || !savedPhoto) {
          setError(saveError || 'Failed to save photo to library');
          return;
        }

        setGeneratedPhotos(prev => [
          { image: generatedResult.url!, description: data.description },
          ...prev,
        ]);

        // Fire completion notification (in-background fallback)
        scheduleGenerationCompleteNotification().catch(() => {});
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to generate photo');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    selectedImage,
    photoType,
    backgroundColor,
    aspectRatio,
    clothingStyle,
    selectedTemplateId,
    generatedPhotos,
    isGenerating,
    error,
    setPhotoType,
    setBackgroundColor,
    setAspectRatio,
    setClothingStyle,
    applyTemplate,
    handlePickImage,
    handleEditedImage,
    handleGenerate,
    clearError: () => setError(null),
  };
};
