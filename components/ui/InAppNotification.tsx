import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState, createContext, useContext, ReactNode, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/theme';

type NotifType = 'success' | 'error' | 'info' | 'warning';

interface NotifConfig {
  title: string;
  message?: string;
  type?: NotifType;
  duration?: number;
}

interface NotifContextType {
  showNotification: (config: NotifConfig) => void;
}

const NotifContext = createContext<NotifContextType | undefined>(undefined);

function SingleNotification({
  title,
  message,
  type = 'success',
  onDismiss,
}: NotifConfig & { onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  }, []);

  const iconMap: Record<NotifType, { icon: any; bg: string; iconColor: string; border: string }> = {
    success: {
      icon: 'checkmark-circle',
      bg: '#F0FDF4',
      iconColor: '#16A34A',
      border: '#BBF7D0',
    },
    error: {
      icon: 'alert-circle',
      bg: '#FEF2F2',
      iconColor: colors.error,
      border: '#FECACA',
    },
    info: {
      icon: 'information-circle',
      bg: colors.primaryLight,
      iconColor: colors.primary,
      border: '#BFDBFE',
    },
    warning: {
      icon: 'warning',
      bg: '#FFFBEB',
      iconColor: '#D97706',
      border: '#FDE68A',
    },
  };

  const cfg = iconMap[type];

  return (
    <Animated.View
      style={[
        styles.notifContainer,
        {
          top: insets.top + (Platform.OS === 'android' ? spacing.sm : spacing.xs),
          transform: [{ translateY }],
          opacity,
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: cfg.iconColor + '20' }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.iconColor} />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.notifTitle} numberOfLines={1}>{title}</Text>
        {message ? (
          <Text style={styles.notifMessage} numberOfLines={2}>{message}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn} activeOpacity={0.7}>
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function InAppNotificationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<(NotifConfig & { id: number })[]>([]);
  const counterRef = useRef(0);

  const showNotification = useCallback((config: NotifConfig) => {
    const id = ++counterRef.current;
    const duration = config.duration ?? 4000;

    setQueue(prev => [...prev, { ...config, id }]);

    setTimeout(() => {
      setQueue(prev => prev.filter(n => n.id !== id));
    }, duration + 500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotifContext.Provider value={{ showNotification }}>
      {children}
      {queue.map(n => (
        <SingleNotification
          key={n.id}
          title={n.title}
          message={n.message}
          type={n.type}
          onDismiss={() => dismiss(n.id)}
        />
      ))}
    </NotifContext.Provider>
  );
}

export function useInAppNotification() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useInAppNotification must be used within InAppNotificationProvider');
  return ctx;
}

const styles = StyleSheet.create({
  notifContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    ...shadows.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBox: {
    flex: 1,
    gap: 2,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
  },
  notifMessage: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 17,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
    flexShrink: 0,
  },
});
