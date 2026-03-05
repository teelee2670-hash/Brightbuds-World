import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile } from '@/src/storage/store';
import { Colors } from '@/src/utils/theme';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
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
        <ActivityIndicator testID="loading-indicator" size="large" color={Colors.action.primary} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary },
});
