// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from './hook';

const DefaultLoadingScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Loading...</Text>
  </View>
);

interface AuthRouterProps {
  children: React.ReactNode;
  loginRoute?: string;
  loadingComponent?: React.ComponentType;
  excludeRoutes?: string[];
}

export function AuthRouter({
  children,
  loginRoute = '/login',
  loadingComponent: LoadingComponent = DefaultLoadingScreen,
  excludeRoutes = [],
}: AuthRouterProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized || loading) return;
    const isLogin = pathname === loginRoute;
    const isExcluded = excludeRoutes.some(r => pathname.startsWith(r));
    if (!user && !isLogin && !isExcluded) router.push(loginRoute);
    else if (user && isLogin) router.replace('/');
  }, [user, loading, initialized, pathname]);

  if (loading || !initialized) return <LoadingComponent />;

  const isLogin = pathname === loginRoute;
  const isExcluded = excludeRoutes.some(r => pathname.startsWith(r));
  if (isLogin || isExcluded || user) return <>{children}</>;
  return <LoadingComponent />;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  text: { fontSize: 16, color: '#6B7280' },
});
