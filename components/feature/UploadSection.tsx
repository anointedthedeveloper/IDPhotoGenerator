import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { PhotoEditor } from '@/components/feature/PhotoEditor';
import { capturePhotoWithCamera } from '@/services/cameraService';
import { useInAppNotification } from '@/components/ui/InAppNotification';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface UploadSectionProps {
  imageUri: string | null;
  onPress: () => void;
  onEditedImage?: (uri: string) => void;
}

export function UploadSection({ imageUri, onPress, onEditedImage }: UploadSectionProps) {
  const [editorVisible, setEditorVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [sourcePickerVisible, setSourcePickerVisible] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const { showNotification } = useInAppNotification();

  const handlePickSource = () => setSourcePickerVisible(true);

  const handleGallery = () => {
    setSourcePickerVisible(false);
    onPress();
  };

  const handleCamera = async () => {
    setSourcePickerVisible(false);
    try {
      setCameraLoading(true);
      const uri = await capturePhotoWithCamera();
      if (uri && onEditedImage) {
        onEditedImage(uri);
      }
    } catch (err) {
      showNotification({
        title: 'Camera Error',
        message: (err as Error).message || 'Could not access camera',
        type: 'error',
      });
    } finally {
      setCameraLoading(false);
    }
  };

  const handleEditSave = (uri: string) => {
    setEditorVisible(false);
    onEditedImage?.(uri);
  };

  return (
    <View style={styles.wrapper}>
      {/* Source picker modal */}
      <Modal visible={sourcePickerVisible} transparent animationType="fade">
        <Pressable style={styles.pickerOverlay} onPress={() => setSourcePickerVisible(false)}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>Select Photo Source</Text>

            <TouchableOpacity style={styles.pickerOption} onPress={handleGallery} activeOpacity={0.8}>
              <View style={[styles.pickerOptionIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="images-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.pickerOptionText}>
                <Text style={styles.pickerOptionLabel}>Photo Gallery</Text>
                <Text style={styles.pickerOptionSub}>Choose from your existing photos</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerOption}
              onPress={handleCamera}
              disabled={cameraLoading}
              activeOpacity={0.8}
            >
              <View style={[styles.pickerOptionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="camera-outline" size={24} color="#D97706" />
              </View>
              <View style={styles.pickerOptionText}>
                <Text style={styles.pickerOptionLabel}>Camera</Text>
                <Text style={styles.pickerOptionSub}>Take a new photo now</Text>
              </View>
              {cameraLoading
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setSourcePickerVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <TouchableOpacity
        style={styles.container}
        onPress={imageUri ? undefined : handlePickSource}
        activeOpacity={imageUri ? 1 : 0.7}
      >
        {imageUri ? (
          <>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            <View style={styles.imageBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.imageBadgeText}>Photo ready</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.uploadIconCircle}>
              <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
            </View>
            <View style={{ gap: spacing.xs }}>
              <Text style={styles.placeholderText}>Tap to add your photo</Text>
              <Text style={styles.placeholderSubtext}>Gallery or Camera · JPG / PNG · Max 10MB</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Action buttons */}
      {imageUri ? (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.changeBtn} onPress={handlePickSource} activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.changeBtnText}>Change Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditorVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="color-wand-outline" size={16} color={colors.primary} />
            <Text style={styles.editBtnText}>Edit & Adjust</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {imageUri && (
        <PhotoEditor
          visible={editorVisible}
          imageUri={imageUri}
          onSave={handleEditSave}
          onCancel={() => setEditorVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.successLight,
  },
  imageBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  uploadIconCircle: {
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: borderRadius.full,
  },
  placeholderText: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  placeholderSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  changeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  changeBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  editBtnText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  // Picker modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
  },
  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  pickerTitle: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionText: {
    flex: 1,
    gap: 2,
  },
  pickerOptionLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  pickerOptionSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pickerCancel: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerCancelText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
