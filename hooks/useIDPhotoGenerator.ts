import { useState } from 'react';
import { PhotoType, BackgroundColor, AspectRatio, pickImage, convertImageToBase64 } from '@/services/imageService';
import { generateIDPhoto, GeneratePhotoResult } from '@/services/aiService';
import { uploadImageToStorage } from '@/services/storageService';
import { usePhotoLibrary } from './usePhotoLibrary';
import { useGenerationCount } from './useGenerationCount';

const VIRTUAL_USER_ID = '00000000-0000-0000-0000-000000000000';

export const useIDPhotoGenerator = () => {
  const { addPhoto } = usePhotoLibrary();
  const { count, increment, needsWatermark } = useGenerationCount();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>('half');
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>('white');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
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

  const handleGenerate = async () => {
    if (!selectedImage) { setError('Please select an image first'); return; }
    setIsGenerating(true);
    setError(null);
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      const { data, error: genError } = await generateIDPhoto({ image: base64Image, photoType, backgroundColor, aspectRatio });
      if (genError) { setError(genError); return; }
      if (!data) return;

      const { url: originalUrl, error: uploadOriginalError } = await uploadImageToStorage(selectedImage, VIRTUAL_USER_ID, 'original');
      if (uploadOriginalError || !originalUrl) { setError(uploadOriginalError || 'Failed to upload original image'); return; }

      const { url: generatedUrl, error: uploadGeneratedError } = await uploadImageToStorage(data.image, VIRTUAL_USER_ID, 'generated');
      if (uploadGeneratedError || !generatedUrl) { setError(uploadGeneratedError || 'Failed to upload generated image'); return; }

      const { data: savedPhoto, error: saveError } = await addPhoto({
        original_image_url: originalUrl,
        generated_image_url: generatedUrl,
        photo_type: photoType,
        background_color: backgroundColor,
        aspect_ratio: aspectRatio,
      });
      if (saveError || !savedPhoto) { setError(saveError || 'Failed to save photo to library'); return; }

      await increment();

      setGeneratedPhotos(prev => [{ image: generatedUrl, description: data.description }, ...prev]);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate photo');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    selectedImage, photoType, backgroundColor, aspectRatio,
    generatedPhotos, isGenerating, error, needsWatermark,
    generationCount: count,
    setPhotoType, setBackgroundColor, setAspectRatio,
    handlePickImage, handleGenerate,
    clearError: () => setError(null),
  };
};
