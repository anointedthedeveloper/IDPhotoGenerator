import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Plan = 'free' | 'pro';

interface PlanData {
  plan: Plan;
  totalGenerations: number;       // lifetime count
  dailyGenerations: number;       // resets every 24h
  lastGenerationDate: string;     // ISO date string YYYY-MM-DD
  cooldownUntil: number;          // timestamp ms, 0 = no cooldown
}

interface UserPlanContextType {
  plan: Plan;
  totalGenerations: number;
  dailyGenerations: number;
  cooldownUntil: number;
  isPro: boolean;
  canGenerate: boolean;
  remainingFree: number;
  cooldownSeconds: number;
  needsWatermark: boolean;
  recordGeneration: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  resetToFree: () => Promise<void>;
}

const FREE_DAILY_LIMIT = 3;
const COOLDOWN_MS = 30 * 1000; // 30 seconds between generations
const STORAGE_KEY = 'idphoto_plan_data';

// Use SecureStore on mobile (survives cache clear), fallback to AsyncStorage on web
const secureGet = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
};

const secureSet = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') { await AsyncStorage.setItem(key, value); return; }
  await SecureStore.setItemAsync(key, value);
};

const today = () => new Date().toISOString().split('T')[0];

const defaultData = (): PlanData => ({
  plan: 'free',
  totalGenerations: 0,
  dailyGenerations: 0,
  lastGenerationDate: today(),
  cooldownUntil: 0,
});

const UserPlanContext = createContext<UserPlanContextType | null>(null);

export function UserPlanProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PlanData>(defaultData());
  const [now, setNow] = useState(Date.now());

  // Tick every second to update cooldown countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Load from secure storage on mount
  useEffect(() => {
    secureGet(STORAGE_KEY).then(raw => {
      if (!raw) return;
      try {
        const saved: PlanData = JSON.parse(raw);
        // Reset daily count if it's a new day
        if (saved.lastGenerationDate !== today()) {
          saved.dailyGenerations = 0;
          saved.lastGenerationDate = today();
        }
        setData(saved);
      } catch {}
    });
  }, []);

  const save = useCallback(async (updated: PlanData) => {
    setData(updated);
    await secureSet(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const recordGeneration = useCallback(async () => {
    const updated: PlanData = {
      ...data,
      totalGenerations: data.totalGenerations + 1,
      dailyGenerations: data.dailyGenerations + 1,
      lastGenerationDate: today(),
      cooldownUntil: Date.now() + COOLDOWN_MS,
    };
    await save(updated);
  }, [data, save]);

  const upgradeToPro = useCallback(async () => {
    await save({ ...data, plan: 'pro' });
  }, [data, save]);

  const resetToFree = useCallback(async () => {
    await save({ ...data, plan: 'free' });
  }, [data, save]);

  const isPro = data.plan === 'pro';
  const inCooldown = now < data.cooldownUntil;
  const hitDailyLimit = !isPro && data.dailyGenerations >= FREE_DAILY_LIMIT;
  const canGenerate = !inCooldown && !hitDailyLimit;
  const remainingFree = Math.max(0, FREE_DAILY_LIMIT - data.dailyGenerations);
  const cooldownSeconds = inCooldown ? Math.ceil((data.cooldownUntil - now) / 1000) : 0;
  const needsWatermark = !isPro && data.totalGenerations >= FREE_DAILY_LIMIT;

  return (
    <UserPlanContext.Provider value={{
      plan: data.plan,
      totalGenerations: data.totalGenerations,
      dailyGenerations: data.dailyGenerations,
      cooldownUntil: data.cooldownUntil,
      isPro,
      canGenerate,
      remainingFree,
      cooldownSeconds,
      needsWatermark,
      recordGeneration,
      upgradeToPro,
      resetToFree,
    }}>
      {children}
    </UserPlanContext.Provider>
  );
}

export function useUserPlan() {
  const ctx = useContext(UserPlanContext);
  if (!ctx) throw new Error('useUserPlan must be used within UserPlanProvider');
  return ctx;
}
