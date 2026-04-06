import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { IDPhoto } from '@/contexts/PhotoLibraryContext';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

interface LibraryPhotoGridProps {
  photos: IDPhoto[];
  onDeletePhoto: (id: string) => void;
}

const BG_COLOR_MAP: Record<string, string> = {
  white: '#FFFFFF',
  gray: '#9CA3AF',
  blue: '#3B82F6',
  red: '#EF4444',
  green: '#10B981',
  lightblue: '#38BDF8',
};

const BG_LABEL_MAP: Record<string, string> = {
  white: 'White',
  gray: 'Gray',
  blue: 'Blue',
  red: 'Red',
  green: 'Green',
  lightblue: 'Light Blue',
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

function FullscreenViewer({
  photo,
  visible,
  onClose,
  onDelete,
}: {
  photo: IDPhoto | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!photo) return null;

  const getLocalUri = async (): Promise<string> => {
    if (photo.generated_image_url.startsWith('http')) {
      const fileUri = `${FileSystem.cacheDirectory}id_photo_view_${Date.now()}.jpg`;
      await FileSystem.downloadAsync(photo.generated_image_url, fileUri);
      return fileUri;
    }
    return photo.generated_image_url;
  };

  const handleDownload = async () => {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = photo.generated_image_url;
      link.download = `id_photo_${Date.now()}.jpg`;
      link.target = '_blank';
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
      return;
    }
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;
      const localUri = await getLocalUri();
      await MediaLibrary.saveToLibraryAsync(localUri);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({ title: 'ID Photo', url: photo.generated_image_url });
      } else {
        window.open(photo.generated_image_url, '_blank');
      }
      return;
    }
    try {
      setSharing(true);
      const localUri = await getLocalUri();
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return;
      await Sharing.shareAsync(localUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share your ID Photo',
        UTI: 'public.jpeg',
      });
    } catch (err) {
      console.error('Share error:', err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={viewerStyles.overlay}>
        {/* Close button */}
        <TouchableOpacity style={viewerStyles.closeBtn} onPress={onClose} activeOpacity={0.85}>
          <Ionicons name="close" size={22} color={colors.surface} />
        </TouchableOpacity>

        {/* Photo */}
        <View style={viewerStyles.imageWrap}>
          <Image
            source={{ uri: photo.generated_image_url }}
            style={viewerStyles.image}
            contentFit="contain"
          />
        </View>

        {/* Meta + actions */}
        <View style={viewerStyles.infoPanel}>
          <View style={viewerStyles.metaRow}>
            <View style={viewerStyles.metaChip}>
              <Ionicons name="person-outline" size={13} color={colors.primary} />
              <Text style={viewerStyles.metaChipText}>
                {photo.photo_type === 'full' ? 'Full Body' : 'Half Body'}
              </Text>
            </View>
            <View style={[viewerStyles.metaChip, { borderColor: BG_COLOR_MAP[photo.background_color] + '80' }]}>
              <View style={[viewerStyles.colorDot, { backgroundColor: BG_COLOR_MAP[photo.background_color] }]} />
              <Text style={viewerStyles.metaChipText}>{BG_LABEL_MAP[photo.background_color] || photo.background_color}</Text>
            </View>
            <View style={viewerStyles.metaChip}>
              <Ionicons name="calendar-outline" size={13} color={colors.primary} />
              <Text style={viewerStyles.metaChipText}>{formatDate(photo.created_at)}</Text>
            </View>
          </View>

          <View style={viewerStyles.actionRow}>
            <TouchableOpacity
              style={viewerStyles.actionBtn}
              onPress={handleShare}
              disabled={sharing}
              activeOpacity={0.8}
            >
              {sharing
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Ionicons name="share-outline" size={20} color={colors.primary} />}
              <Text style={viewerStyles.actionBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[viewerStyles.actionBtn, viewerStyles.actionBtnFill, downloaded && viewerStyles.actionBtnSuccess]}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.8}
            >
              {downloading
                ? <ActivityIndicator size="small" color={colors.surface} />
                : downloaded
                ? <Ionicons name="checkmark" size={20} color={colors.surface} />
                : <Ionicons name="download-outline" size={20} color={colors.surface} />}
              <Text style={viewerStyles.actionBtnFillText}>{downloaded ? 'Saved!' : 'Save'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[viewerStyles.actionBtn, viewerStyles.actionBtnDanger]}
              onPress={() => { onDelete(photo.id); onClose(); }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[viewerStyles.actionBtnText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PhotoCard({
  photo,
  onPress,
  onDelete,
}: {
  photo: IDPhoto;
  onPress: () => void;
  onDelete: () => void;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const bgColor = BG_COLOR_MAP[photo.background_color] || '#FFFFFF';

  return (
    <Pressable
      style={cardStyles.card}
      onPress={onPress}
      android_ripple={{ color: colors.primaryLight, borderless: false }}
    >
      <View style={cardStyles.imageWrap}>
        {imageLoading && (
          <View style={cardStyles.loader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: photo.generated_image_url }}
          style={cardStyles.image}
          contentFit="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {/* Delete button */}
        <TouchableOpacity style={cardStyles.deleteBtn} onPress={onDelete} activeOpacity={0.85}>
          <Ionicons name="trash-outline" size={15} color={colors.surface} />
        </TouchableOpacity>
        {/* Tap hint */}
        <View style={cardStyles.expandHint}>
          <Ionicons name="expand-outline" size={13} color={colors.surface} />
        </View>
      </View>

      {/* Metadata strip */}
      <View style={cardStyles.metaStrip}>
        <View style={cardStyles.chipRow}>
          <View style={cardStyles.chip}>
            <Text style={cardStyles.chipText}>{photo.photo_type === 'full' ? 'Full' : 'Half'}</Text>
          </View>
          <View style={[cardStyles.colorChip, { borderColor: bgColor + '60' }]}>
            <View style={[cardStyles.colorDot, { backgroundColor: bgColor }]} />
            <Text style={cardStyles.chipText} numberOfLines={1}>
              {BG_LABEL_MAP[photo.background_color] || photo.background_color}
            </Text>
          </View>
        </View>
        <Text style={cardStyles.dateText}>{formatDate(photo.created_at)}</Text>
      </View>
    </Pressable>
  );
}

function DeleteConfirmModal({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={deleteStyles.overlay}>
        <View style={deleteStyles.modal}>
          <View style={deleteStyles.iconWrap}>
            <Ionicons name="trash-outline" size={32} color={colors.error} />
          </View>
          <Text style={deleteStyles.title}>Delete Photo</Text>
          <Text style={deleteStyles.msg}>
            This photo will be permanently deleted from your library and storage.
          </Text>
          <View style={deleteStyles.btns}>
            <TouchableOpacity style={deleteStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={deleteStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={deleteStyles.confirmBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={16} color={colors.surface} />
              <Text style={deleteStyles.confirmText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function LibraryPhotoGrid({ photos, onDeletePhoto }: LibraryPhotoGridProps) {
  const [viewingPhoto, setViewingPhoto] = useState<IDPhoto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deletingId) {
      onDeletePhoto(deletingId);
      setDeletingId(null);
    }
  }, [deletingId, onDeletePhoto]);

  const renderItem = useCallback(({ item }: { item: IDPhoto }) => (
    <PhotoCard
      photo={item}
      onPress={() => setViewingPhoto(item)}
      onDelete={() => handleDeleteRequest(item.id)}
    />
  ), [handleDeleteRequest]);

  if (photos.length === 0) {
    return (
      <View style={gridStyles.emptyContainer}>
        <View style={gridStyles.emptyIconWrap}>
          <Ionicons name="images-outline" size={56} color={colors.textTertiary} />
        </View>
        <Text style={gridStyles.emptyTitle}>No photos yet</Text>
        <Text style={gridStyles.emptyMsg}>Create your first ID photo and it will appear here</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={gridStyles.row}
        contentContainerStyle={gridStyles.content}
        showsVerticalScrollIndicator={false}
      />

      <FullscreenViewer
        photo={viewingPhoto}
        visible={viewingPhoto !== null}
        onClose={() => setViewingPhoto(null)}
        onDelete={onDeletePhoto}
      />

      <DeleteConfirmModal
        visible={deletingId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </>
  );
}

const gridStyles = StyleSheet.create({
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.lg,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
  },
  emptyMsg: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageWrap: {
    aspectRatio: 3 / 4,
    position: 'relative',
    backgroundColor: colors.borderLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    zIndex: 1,
  },
  deleteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  expandHint: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaStrip: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  dateText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '400',
  },
});

const viewerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageWrap: {
    width: Dimensions.get('window').width * 0.85,
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary + '40',
  },
  actionBtnFill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionBtnSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  actionBtnDanger: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error + '40',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  actionBtnFillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surface,
  },
});

const deleteStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...shadows.lg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.text,
  },
  msg: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  btns: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
  },
  confirmText: {
    ...typography.bodyMedium,
    color: colors.surface,
    fontWeight: '700',
  },
});
