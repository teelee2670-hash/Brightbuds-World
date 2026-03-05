import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/src/utils/theme';
import { getProfile, setProfile, UserProfile } from '@/src/storage/store';
import { AVATARS } from '@/src/data/avatars';
import { speak } from '@/src/utils/audio';
import KidButton from '@/src/components/KidButton';

export default function BuddyPicker() {
  const router = useRouter();
  const [profile, setLocalProfile] = useState<UserProfile | null>(null);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setLocalProfile(p);
      setSelectedId(p.avatarId);
    })();
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const avatar = AVATARS.find(a => a.id === id);
    if (avatar) speak(avatar.name);
  };

  const handleConfirm = async () => {
    if (profile) {
      await setProfile({ ...profile, avatarId: selectedId });
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.heading}>Pick your Buddy!</Text>
        <Text style={styles.sub}>Who do you want to explore with?</Text>

        <View style={styles.grid}>
          {AVATARS.map(a => (
            <TouchableOpacity
              key={a.id}
              activeOpacity={0.7}
              onPress={() => handleSelect(a.id)}
              style={[
                styles.card,
                {
                  borderColor: selectedId === a.id ? a.color : 'transparent',
                  backgroundColor: selectedId === a.id ? a.color + '20' : Colors.background.card,
                },
              ]}
            >
              <Text style={styles.emoji}>{a.emoji}</Text>
              <Text style={styles.name}>{a.name}</Text>
              {selectedId === a.id && (
                <Text style={styles.check}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttons}>
          <KidButton
            title="Choose Buddy"
            emoji="🤝"
            onPress={handleConfirm}
            color={Colors.action.primary}
            testID="confirm-buddy-btn"
          />
          <KidButton
            title="Go Back"
            emoji="↩️"
            onPress={() => router.back()}
            color={Colors.action.secondary}
            testID="cancel-buddy-btn"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.warm },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  heading: { ...Typography.h1, color: Colors.text.heading, marginBottom: Spacing.xs },
  sub: { ...Typography.bodyLg, color: Colors.text.body, marginBottom: Spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  card: {
    width: 140, height: 140, borderRadius: Radius.xl, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  emoji: { fontSize: 48, marginBottom: Spacing.sm },
  name: { ...Typography.bodyLg, color: Colors.text.heading },
  check: { position: 'absolute', top: 8, right: 12, fontSize: 20, color: Colors.action.primary },
  buttons: { gap: Spacing.md, width: '100%', maxWidth: 280 },
});
