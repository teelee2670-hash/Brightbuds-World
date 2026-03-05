import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile } from '@/src/storage/store';
import { Colors, Typography } from '@/src/utils/theme';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    (async () => {
      const profile = await getProfile();
      // Small delay to show splash
      await new Promise(r => setTimeout(r, 800));
      if (profile.onboarded) {
        router.replace('/map');
      } else {
        router.replace('/onboarding');
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.emoji}>🌟</Text>
          <Text style={styles.title}>BrightBuds</Text>
          <Text style={styles.subtitle}>World</Text>
          <ActivityIndicator 
            testID="loading-indicator" 
            size="large" 
            color="#FF9F1C" 
            style={styles.loader}
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFF9F0',
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...Typography.h1,
    color: '#FF9F1C',
    fontSize: 36,
  },
  subtitle: {
    ...Typography.h2,
    color: '#FFD166',
    marginTop: -4,
  },
  loader: {
    marginTop: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
});
