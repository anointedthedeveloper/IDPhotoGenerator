import { useState } from 'react';
import { PhotoType, BackgroundColor, AspectRatio, pickImage, convertImageToBase64 } from '@/services/imageService';
import { generateIDPhoto, GeneratePhotoResult } from '@/services/aiService';
import { uploadImageToStorage } from '@/services/storageService';
import { usePhotoLibrary } from './usePhotoLibrary';
import { useUserPlan } from '@/contexts/UserPlanContext';

const VIRTUAL_USER_ID = '00000000-0000-0000-0000-000000000000';

export type GenerationStage =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'finalizing'
  | 'done';

export interface GenerationProgress {
  stage: GenerationStage;
  label: string;
  subLabel: string;
  percent: number;
}

const STAGES: Record<GenerationStage, GenerationProgress> = {
  idle: { stage: 'idle', label: '', subLabel: '', percent: 0 },
  uploading: { stage: 'uploading', label: 'Uploading photo', subLabel: 'Preparing your image securely...', percent: 20 },
  processing: { stage: 'processing', label: 'Processing with AI', subLabel: 'Generating your professional ID photo...', percent: 60 },
  finalizing: { stage: 'finalizing', label: 'Finalizing', subLabel: 'Saving to your library...', percent: 90 },
  done: { stage: 'done', label: 'Complete', subLabel: 'Your ID photo is ready!', percent: 100 },
};

export const useIDPhotoGenerator = () => {
  const { addPhoto } = usePhotoLibrary();
  const { canGenerate, needsWatermark, remainingFree, cooldownSeconds, isPro, recordGeneration } = useUserPlan();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>('half');
  const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>('white');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [generatedPhotos, setGeneratedPhotos] = useState<GeneratePhotoResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>(STAGES.idle);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<{ original: string; generated: string } | null>(null);

  const setStage = (stage: GenerationStage) => setProgress(STAGES[stage]);

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

    if (!canGenerate) {
      if (cooldownSeconds > 0) {
        setError(`Please wait ${cooldownSeconds}s before generating again`);
      } else {
        setError('You have reached your 3 free photos for today. Upgrade to Pro for unlimited generations.');
      }
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLatestResult(null);

    try {
      setStage('uploading');
      const base64Image = await convertImageToBase64(selectedImage);

      setStage('processing');
      const { data, error: genError } = await generateIDPhoto({ image: base64Image, photoType, backgroundColor, aspectRatio });
      if (genError) { setError(genError); return; }
      if (!data) return;

      setStage('finalizing');
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

      await recordGeneration();

      setLatestResult({ original: selectedImage, generated: generatedUrl });
      setGeneratedPhotos(prev => [{ image: generatedUrl, description: data.description }, ...prev]);
      setStage('done');
    } catch (err) {
      setError((err as Error).message || 'Failed to generate photo');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStage('idle'), 3000);
    }
  };

  return {
    selectedImage, photoType, backgroundColor, aspectRatio,
    generatedPhotos, isGenerating, progress, error, latestResult,
    needsWatermark, remainingFree, cooldownSeconds, isPro, canGenerate,
    setPhotoType, setBackgroundColor, setAspectRatio,
    handlePickImage, handleGenerate,
    clearError: () => setError(null),
  };
};
