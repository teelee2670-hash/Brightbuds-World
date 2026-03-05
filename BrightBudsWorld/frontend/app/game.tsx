import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, WorldThemes, WorldId, GameType } from '@/src/utils/theme';
import { PHONICS_LEVELS, NUMBERS_LEVELS, SHAPES_LEVELS } from '@/src/data/gameLevels';
import PhonicsGame from '@/src/games/PhonicsGame';
import NumbersGame from '@/src/games/NumbersGame';
import ShapesGame from '@/src/games/ShapesGame';
import { addPlaytime } from '@/src/storage/store';

export default function GameScreen() {
  const router = useRouter();
  const { worldId, gameType, level } = useLocalSearchParams<{ worldId: string; gameType: string; level: string }>();
  const wId = (worldId || 'world1') as WorldId;
  const gType = (gameType || 'phonics') as GameType;
  const lvl = parseInt(level || '1', 10);
  const theme = WorldThemes[wId];
  const startTime = useRef(Date.now());
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    startTime.current = Date.now();
    setCompleted(false);
  }, [worldId, gameType, level]);

  const handleComplete = async (stars: number) => {
    if (completed) return;
    setCompleted(true);
    const elapsed = Math.round((Date.now() - startTime.current) / 60000);
    await addPlaytime(Math.max(1, elapsed));
    router.replace({ pathname: '/results', params: { worldId: wId, gameType: gType, level: String(lvl), stars: String(stars) } });
  };

  const getLevelData = () => {
    if (gType === 'phonics') return PHONICS_LEVELS[wId]?.[lvl - 1];
    if (gType === 'numbers') return NUMBERS_LEVELS[wId]?.[lvl - 1];
    if (gType === 'shapes') return SHAPES_LEVELS[wId]?.[lvl - 1];
    return null;
  };

  const levelData = getLevelData();

  if (!levelData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Level not found!</Text>
          <TouchableOpacity testID="game-back-btn" onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <View style={styles.topBar}>
        <TouchableOpacity testID="game-exit-btn" onPress={() => router.back()} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.levelLabel}>Level {lvl}</Text>
        <TouchableOpacity testID="game-home-btn" onPress={() => router.replace('/map')} style={styles.exitBtn}>
          <Text style={styles.exitText}>🏠</Text>
        </TouchableOpacity>
      </View>
      {gType === 'phonics' && <PhonicsGame level={levelData as any} worldId={wId} onComplete={handleComplete} />}
      {gType === 'numbers' && <NumbersGame level={levelData as any} worldId={wId} onComplete={handleComplete} />}
      {gType === 'shapes' && <ShapesGame level={levelData as any} worldId={wId} onComplete={handleComplete} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  exitBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background.card, alignItems: 'center', justifyContent: 'center' },
  exitText: { fontSize: 20, color: Colors.text.muted },
  levelLabel: { ...Typography.bodyLg, color: Colors.text.heading },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...Typography.h2, color: Colors.text.heading, marginBottom: Spacing.lg },
  backBtn: { backgroundColor: Colors.action.primary, borderRadius: 20, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backText: { ...Typography.bodyLg, color: Colors.action.primaryText },
});
