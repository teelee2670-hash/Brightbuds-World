import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { preloadSounds } from '@/src/utils/audio';

export default function RootLayout() {
  // Preload critical sounds on app start for instant playback
  useEffect(() => {
    preloadSounds();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="map" />
        <Stack.Screen name="level-select" />
        <Stack.Screen name="game" />
        <Stack.Screen name="results" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="parent-corner" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
