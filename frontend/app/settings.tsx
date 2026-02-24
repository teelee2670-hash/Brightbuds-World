import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/src/utils/theme';
import { getProfile, setProfile, resetAllProgress, UserProfile } from '@/src/storage/store';
import { setAudioEnabled } from '@/src/utils/audio';

export default function Settings() {
  const router = useRouter();
  const [profile, setProfileState] = useState<UserProfile | null>(null);

  useFocusEffect(useCallback(() => {
    (async () => { setProfileState(await getProfile()); })();
  }, []));

  const toggleAudio = async () => {
    if (!profile) return;
    const updated = { ...profile, audioOn: !profile.audioOn };
    await setProfile(updated);
    setAudioEnabled(updated.audioOn);
    setProfileState(updated);
  };

  const handleReset = () => {
    Alert.alert('Reset Progress?', 'This will erase all game progress and stickers.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        await resetAllProgress();
        Alert.alert('Done', 'Progress has been reset.');
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity testID="settings-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚙️ Settings</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity testID="toggle-audio" onPress={toggleAudio} style={styles.row}>
          <Text style={styles.rowEmoji}>{profile?.audioOn ? '🔊' : '🔇'}</Text>
          <Text style={styles.rowLabel}>Sound</Text>
          <View style={[styles.toggle, profile?.audioOn && styles.toggleOn]}>
            <View style={[styles.toggleKnob, profile?.audioOn && styles.toggleKnobOn]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity testID="reset-progress-settings" onPress={handleReset} style={styles.row}>
          <Text style={styles.rowEmoji}>🗑️</Text>
          <Text style={[styles.rowLabel, { color: Colors.status.error }]}>Reset Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { ...Typography.bodyLg, color: Colors.text.heading },
  title: { ...Typography.h3, color: Colors.text.heading },
  content: { padding: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.md },
  rowEmoji: { fontSize: 28 },
  rowLabel: { ...Typography.bodyLg, color: Colors.text.heading, flex: 1 },
  toggle: { width: 56, height: 32, borderRadius: 16, backgroundColor: Colors.action.disabled, justifyContent: 'center', padding: 3 },
  toggleOn: { backgroundColor: Colors.status.success },
  toggleKnob: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff' },
  toggleKnobOn: { alignSelf: 'flex-end' },
});
