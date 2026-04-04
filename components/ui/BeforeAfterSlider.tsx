import { View, Text, StyleSheet, PanResponder, Animated, Pressable, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useRef, useState, useCallback } from 'react';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface BeforeAfterSliderProps {
  originalUri: string;
  generatedUri: string;
  aspectRatio?: number;
  onClose?: () => void;
}

export function BeforeAfterSlider({ originalUri, generatedUri, aspectRatio = 3 / 4, onClose }: BeforeAfterSliderProps) {
  const screenWidth = Dimensions.get('window').width - spacing.xl * 2;
  const imageHeight = screenWidth * aspectRatio;

  const sliderPos = useRef(new Animated.Value(0.5)).current;
  const [sliderValue, setSliderValue] = useState(0.5);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newVal = Math.max(0.02, Math.min(0.98, (gestureState.moveX - spacing.xl) / screenWidth));
        sliderPos.setValue(newVal);
        setSliderValue(newVal);
      },
    })
  ).current;

  const getLocalUri = useCallback(async (): Promise<string | null> => {
    try {
      const filename = `idphoto_${Date.now()}.jpg`;
      const localUri = (FileSystem.cacheDirectory ?? '') + filename;
      const { uri } = await FileSystem.downloadAsync(generatedUri, localUri);
      return uri;
    } catch { return null; }
  }, [generatedUri]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to save photos.'); return; }
      const localUri = await getLocalUri();
      if (!localUri) { Alert.alert('Error', 'Failed to download photo.'); return; }
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Saved!', 'ID photo saved to your gallery.');
    } catch { Alert.alert('Error', 'Failed to save photo.'); }
    finally { setDownloading(false); }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const localUri = await getLocalUri();
      if (!localUri) { Alert.alert('Error', 'Failed to prepare photo.'); return; }
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) { Alert.alert('Unavailable', 'Sharing is not available on this device.'); return; }
      await Sharing.shareAsync(localUri, { mimeType: 'image/jpeg', dialogTitle: 'Share ID Photo' });
    } catch { Alert.alert('Error', 'Failed to share photo.'); }
    finally { setSharing(false); }
  };

  const clipWidth = sliderPos.interpolate({
    inputRange: [0, 1],
    outputRange: [0, screenWidth],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Before / After</Text>
          <Text style={styles.headerSub}>Drag slider to compare</Text>
        </View>
        {onClose ? (
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* Comparison View */}
      <View style={[styles.imageContainer, { height: imageHeight, width: screenWidth }]}>
        {/* Generated (right / full background) */}
        <Image source={{ uri: generatedUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />

        {/* Label: After */}
        <View style={[styles.label, styles.labelRight]}>
          <Text style={styles.labelText}>After</Text>
        </View>

        {/* Original clipped (left side) */}
        <Animated.View style={[styles.clipView, { width: clipWidth }]}>
          <Image
            source={{ uri: originalUri }}
            style={{ width: screenWidth, height: imageHeight }}
            contentFit="cover"
          />
        </Animated.View>

        {/* Label: Before */}
        <View style={[styles.label, styles.labelLeft]}>
          <Text style={styles.labelText}>Before</Text>
        </View>

        {/* Divider Line + Handle */}
        <Animated.View
          style={[styles.dividerWrap, { left: sliderPos.interpolate({ inputRange: [0, 1], outputRange: [0, screenWidth] }) }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dividerLine} />
          <View style={styles.handle}>
            <Ionicons name="chevron-back" size={14} color={colors.primary} />
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </Animated.View>
      </View>

      {/* Hint */}
      <View style={styles.hintRow}>
        <Ionicons name="hand-left-outline" size={14} color={colors.textTertiary} />
        <Text style={styles.hintText}>Slide to reveal the transformation</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.actionPrimary, pressed && styles.pressed]}
          onPress={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={18} color="#fff" />
          )}
          <Text style={styles.actionTextWhite}>{downloading ? 'Saving...' : 'Save to Gallery'}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.actionOutline, pressed && styles.pressed]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          )}
          <Text style={styles.actionTextOutline}>{sharing ? 'Sharing...' : 'Share'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  clipView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  label: {
    position: 'absolute',
    top: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(15,23,41,0.55)',
    zIndex: 10,
  },
  labelLeft: { left: spacing.sm },
  labelRight: { right: spacing.sm },
  labelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dividerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    marginLeft: -22,
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2.5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  handle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  hintText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 48,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  actionOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  actionTextWhite: { ...typography.bodyMedium, color: '#fff', fontWeight: '700', fontSize: 14 },
  actionTextOutline: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700', fontSize: 14 },
});
