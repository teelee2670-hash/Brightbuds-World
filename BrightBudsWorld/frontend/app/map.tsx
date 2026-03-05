import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId } from '@/src/utils/theme';
import { getProfile, getProgress, UserProfile, WorldProgress } from '@/src/storage/store';
import { checkPremium } from '@/src/services/subscription';
import { AVATARS } from '@/src/data/avatars';
import ParentalGate from '@/src/components/ParentalGate';

const WORLDS: { id: WorldId; premium: boolean }[] = [
  { id: 'world1', premium: false },
  { id: 'world2', premium: true },
  { id: 'world3', premium: true },
];

function getWorldStars(wp: WorldProgress): number {
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  return sum(wp.phonics.starsByLevel) + sum(wp.numbers.starsByLevel) + sum(wp.shapes.starsByLevel);
}

export default function MapScreen() {
  const router = useRouter();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<Record<WorldId, WorldProgress> | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showGate, setShowGate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setProfileState(await getProfile());
        setProgress(await getProgress());
        setIsPremium(await checkPremium());
      })();
    }, [])
  );

  const avatar = AVATARS.find(a => a.id === (profile?.avatarId || 'dino')) || AVATARS[0];

  const handleWorldTap = (worldId: WorldId, premium: boolean) => {
    if (premium && !isPremium) {
      Alert.alert('Locked!', 'Ask a parent to unlock this world!', [
        { text: 'OK' },
        { text: 'Parent Corner', onPress: () => setShowGate(true) },
      ]);
      return;
    }
    router.push({ pathname: '/level-select', params: { worldId } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/buddy-picker')} activeOpacity={0.7}>
            <View style={styles.avatarBubble}>
              <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Hi, {profile?.nickname || 'Explorer'}!</Text>
            <Text style={styles.sub}>Where shall we go today?</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Worlds</Text>
        {WORLDS.map(w => {
          const theme = WorldThemes[w.id];
          const wp = progress?.[w.id];
          const stars = wp ? getWorldStars(wp) : 0;
          const locked = w.premium && !isPremium;
          return (
            <TouchableOpacity
              key={w.id}
              testID={`world-card-${w.id}`}
              onPress={() => handleWorldTap(w.id, w.premium)}
              activeOpacity={0.8}
              style={[styles.worldCard, { borderColor: locked ? Colors.status.locked : theme.color }]}
            >
              <View style={[styles.worldIcon, { backgroundColor: locked ? Colors.status.locked + '30' : theme.color + '30' }]}>
                <Text style={styles.worldEmoji}>{locked ? '🔒' : theme.emoji}</Text>
              </View>
              <View style={styles.worldInfo}>
                <Text style={styles.worldName}>{theme.name}</Text>
                <Text style={styles.worldStatus}>
                  {locked ? 'Premium' : `${stars} ⭐ earned`}
                </Text>
                {w.premium && !isPremium && <Text style={styles.premiumTag}>PREMIUM</Text>}
              </View>
              <Text style={styles.arrow}>{locked ? '🔒' : '▶'}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.moreRow}>
          <TouchableOpacity testID="rewards-btn" onPress={() => router.push('/rewards')} activeOpacity={0.7} style={[styles.moreCard, { backgroundColor: Colors.brand.sunYellow + '25' }]}>
            <Text style={styles.moreEmoji}>🏆</Text>
            <Text style={styles.moreLabel}>Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="parent-corner-btn" onPress={() => setShowGate(true)} activeOpacity={0.7} style={[styles.moreCard, { backgroundColor: Colors.brand.spaceBlue + '25' }]}>
            <Text style={styles.moreEmoji}>👨‍👩‍👧</Text>
            <Text style={styles.moreLabel}>Parents</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="settings-btn" onPress={() => router.push('/settings')} activeOpacity={0.7} style={[styles.moreCard, { backgroundColor: Colors.brand.critterPink + '25' }]}>
            <Text style={styles.moreEmoji}>⚙️</Text>
            <Text style={styles.moreLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ParentalGate
        visible={showGate}
        onPass={() => { setShowGate(false); router.push('/parent-corner'); }}
        onCancel={() => setShowGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  avatarBubble: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.brand.sunYellow + '30', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 32 },
  greeting: { ...Typography.h2, color: Colors.text.heading },
  sub: { ...Typography.bodyMd, color: Colors.text.muted },
  sectionTitle: { ...Typography.label, color: Colors.text.muted, marginBottom: Spacing.md, marginTop: Spacing.sm },
  worldCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.card, borderRadius: Radius.xl, borderWidth: 3, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  worldIcon: { width: 64, height: 64, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  worldEmoji: { fontSize: 36 },
  worldInfo: { flex: 1, marginLeft: Spacing.md },
  worldName: { ...Typography.h3, color: Colors.text.heading },
  worldStatus: { ...Typography.bodyMd, color: Colors.text.muted, marginTop: 2 },
  premiumTag: { ...Typography.label, color: Colors.action.primary, fontSize: 11, marginTop: 4 },
  arrow: { fontSize: 20, color: Colors.text.muted },
  moreRow: { flexDirection: 'row', gap: Spacing.md },
  moreCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing.md, alignItems: 'center', justifyContent: 'center', height: 100 },
  moreEmoji: { fontSize: 32, marginBottom: Spacing.xs },
  moreLabel: { ...Typography.bodyMd, color: Colors.text.heading, fontWeight: '600' },
});