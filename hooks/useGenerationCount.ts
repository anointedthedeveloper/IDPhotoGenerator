import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@idphoto_gen_count';
const FREE_LIMIT = 3;

export function useGenerationCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => setCount(v ? parseInt(v) : 0));
  }, []);

  const increment = useCallback(async () => {
    const next = count + 1;
    setCount(next);
    await AsyncStorage.setItem(KEY, String(next));
  }, [count]);

  return { count, increment, needsWatermark: count >= FREE_LIMIT };
}
