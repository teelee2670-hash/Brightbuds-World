import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, WorldThemes, GameTypeInfo, WorldId, GameType } from '@/src/utils/theme';
import { getProgress, GameProgress } from '@/src/storage/store';

export default function LevelSelect() {
  const router = useRouter();
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const wId = (worldId || 'world1') as WorldId;
  const theme = WorldThemes[wId];
  const [gameType, setGameType] = useState<GameType>('phonics');
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    (async () => {
      const progress = await getProgress();
      setGameProgress(progress[wId]?.[gameType] || { unlockedLevel: 1, starsByLevel: [] });
    })();
  }, [gameType, wId]);

  const TOTAL_LEVELS = 10;
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  const handleLevel = (level: number) => {
    if (!gameProgress || level > gameProgress.unlockedLevel) return;
    router.push({ pathname: '/game', params: { worldId: wId, gameType, level: String(level) } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.topBar, { backgroundColor: theme.color + '20' }]}>
        <TouchableOpacity testID="level-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.worldTitle}>{theme.emoji} {theme.name}</Text>
      </View>

      <View style={styles.tabs}>
        {(['phonics', 'numbers', 'shapes'] as GameType[]).map(gt => {
          const info = GameTypeInfo[gt];
          const active = gameType === gt;
          return (
            <TouchableOpacity
              key={gt}
              testID={`tab-${gt}`}
              onPress={() => setGameType(gt)}
              activeOpacity={0.7}
              style={[styles.tab, active && { backgroundColor: info.color + '25', borderColor: info.color }]}
            >
              <Text style={styles.tabEmoji}>{info.emoji}</Text>
              <Text style={[styles.tabText, active && { color: info.color }]}>{info.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {levels.map(level => {
          const unlocked = gameProgress ? level <= gameProgress.unlockedLevel : level === 1;
          const stars = gameProgress?.starsByLevel[level - 1] || 0;
          return (
            <TouchableOpacity
              key={level}
              testID={`level-btn-${level}`}
              onPress={() => handleLevel(level)}
              disabled={!unlocked}
              activeOpacity={0.7}
              style={[styles.levelBtn, !unlocked && styles.levelLocked, unlocked && { borderColor: GameTypeInfo[gameType].color }]}
            >
              {unlocked ? (
                <>
                  <Text style={styles.levelNum}>{level}</Text>
                  {stars > 0 && (
                    <Text style={styles.levelStars}>{'⭐'.repeat(stars)}</Text>
                  )}
                </>
              ) : (
                <Text style={styles.lockIcon}>🔒</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { ...Typography.bodyLg, color: Colors.text.heading },
  worldTitle: { ...Typography.h3, color: Colors.text.heading, flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 2, borderColor: 'transparent', backgroundColor: Colors.background.card },
  tabEmoji: { fontSize: 18 },
  tabText: { ...Typography.bodyMd, color: Colors.text.muted, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.md, gap: Spacing.md, justifyContent: 'center' },
  levelBtn: { width: 80, height: 80, borderRadius: Radius.lg, backgroundColor: Colors.background.card, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  levelLocked: { backgroundColor: Colors.status.locked + '20', borderColor: 'transparent' },
  levelNum: { ...Typography.h2, color: Colors.text.heading },
  levelStars: { fontSize: 12, marginTop: 2 },
  lockIcon: { fontSize: 24 },
});
