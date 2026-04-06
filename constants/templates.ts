import { BackgroundColor, AspectRatio, PhotoType } from '@/services/imageService';

export interface IDPhotoTemplate {
  id: string;
  name: string;
  description: string;
  size: string;
  photoType: PhotoType;
  backgroundColor: BackgroundColor;
  aspectRatio: AspectRatio;
  iconName: 'airplane-outline' | 'card-outline' | 'person-outline' | 'school-outline';
  accentColor: string;
  accentBg: string;
}

export const ID_PHOTO_TEMPLATES: IDPhotoTemplate[] = [
  {
    id: 'passport',
    name: 'Passport',
    description: 'International travel document',
    size: '35 × 45mm',
    photoType: 'half',
    backgroundColor: 'white',
    aspectRatio: '3:4',
    iconName: 'airplane-outline',
    accentColor: '#2563EB',
    accentBg: '#DBEAFE',
  },
  {
    id: 'visa',
    name: 'Visa',
    description: 'Entry & residency permits',
    size: '35 × 45mm',
    photoType: 'half',
    backgroundColor: 'white',
    aspectRatio: '3:4',
    iconName: 'card-outline',
    accentColor: '#7C3AED',
    accentBg: '#EDE9FE',
  },
  {
    id: 'national-id',
    name: 'National ID',
    description: 'Government issued identity card',
    size: '35 × 45mm',
    photoType: 'half',
    backgroundColor: 'blue',
    aspectRatio: '3:4',
    iconName: 'person-outline',
    accentColor: '#059669',
    accentBg: '#D1FAE5',
  },
  {
    id: 'student-id',
    name: 'Student ID',
    description: 'Educational institution card',
    size: '25 × 35mm',
    photoType: 'half',
    backgroundColor: 'lightblue',
    aspectRatio: '3:4',
    iconName: 'school-outline',
    accentColor: '#D97706',
    accentBg: '#FEF3C7',
  },
];
