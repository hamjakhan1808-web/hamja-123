import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SettingsProvider } from '@/src/providers/SettingsProvider';
import { AuthProvider } from '@/src/providers/AuthProvider';
import { PatientsProvider } from '@/src/providers/PatientsProvider';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { useSettings } from '@/src/providers/SettingsProvider';
import { useAuth } from '@/src/providers/AuthProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { buildTheme } from '@/src/theme';

SplashScreen.preventAutoHideAsync();

function Gate({ children }: { children: React.ReactNode }) {
  const { loading } = useSettings();
  const { unlocked } = useAuth();
  const theme = buildTheme(false);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!unlocked) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="lock" />
      </Stack>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SettingsProvider>
      <AuthProvider>
        <PatientsProvider>
          <ThemeProvider>
            <Gate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="patient/[id]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="patient/register" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
                <Stack.Screen name="module/[id]/[module]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="reports/[id]" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="backup" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="lock" options={{ animation: 'fade' }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </Gate>
            <StatusBar style="auto" />
          </ThemeProvider>
        </PatientsProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
