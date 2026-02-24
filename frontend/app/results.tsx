import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId, GameType } from '@/src/utils/theme';
import { updateLevelProgress, addSticker, updateDailyStats } from '@/src/storage/store';
import { STICKERS } from '@/src/data/rewards';
import { speak } from '@/src/utils/audio';
import StarDisplay from '@/src/components/StarDisplay';
import KidButton from '@/src/components/KidButton';

const MESSAGES = {
  3: ['Amazing!', 'Superstar!', 'Perfect!'],
  2: ['Great job!', 'Well done!', 'Nice work!'],
  1: ['Good try!', 'Keep going!', 'You did it!'],
  0: ['Try again!'],
};

export default function ResultsScreen() {
  const router = useRouter();
  const { worldId, gameType, level, stars } = useLocalSearchParams<{ worldId: string; gameType: string; level: string; stars: string }>();
  const wId = (worldId || 'world1') as WorldId;
  const gType = (gameType || 'phonics') as GameType;
  const lvl = parseInt(level || '1', 10);
  const starCount = Math.min(3, Math.max(0, parseInt(stars || '0', 10)));
  const theme = WorldThemes[wId];
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const stickerEarned = starCount >= 2;

  useEffect(() => {
    (async () => {
      await updateLevelProgress(wId, gType, lvl, starCount);
      if (stickerEarned) {
        const worldStickers = STICKERS[wId] || [];
        const stickerIdx = (lvl - 1) % worldStickers.length;
        if (worldStickers[stickerIdx]) await addSticker(worldStickers[stickerIdx].id);
      }
      await updateDailyStats({
        sounds: gType === 'phonics' ? [`level_${lvl}`] : undefined,
        numbersRange: gType === 'numbers' ? `1-${lvl * 2}` : undefined,
        shapes: gType === 'shapes' ? [`level_${lvl}`] : undefined,
      });
    })();
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    const msgs = MESSAGES[starCount as keyof typeof MESSAGES] || MESSAGES[1];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    setTimeout(() => speak(msg), 500);
  }, []);

  const handlePlayAgain = () => {
    router.replace({ pathname: '/game', params: { worldId: wId, gameType: gType, level: String(lvl) } });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>{theme.emoji}</Text>
        <Text style={styles.heading}>
          {starCount >= 2 ? 'Awesome!' : 'Nice Try!'}
        </Text>
        <StarDisplay stars={starCount} size={48} />
        <Text style={styles.message}>
          {starCount === 3 ? 'Perfect round!' : starCount === 2 ? 'Almost perfect!' : 'Keep practicing!'}
        </Text>
        {stickerEarned && (
          <View style={styles.stickerBadge}>
            <Text style={styles.stickerText}>🎉 Sticker earned!</Text>
          </View>
        )}
        <View style={styles.btnCol}>
          <KidButton title="Play Again" emoji="🔄" onPress={handlePlayAgain} testID="play-again-btn" color={theme.color} />
          <KidButton title="Back to Map" emoji="🗺️" onPress={() => router.replace('/map')} testID="back-to-map-btn" color={Colors.action.secondary} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emoji: { fontSize: 72, marginBottom: Spacing.md },
  heading: { ...Typography.h1, color: Colors.text.heading, marginBottom: Spacing.lg },
  message: { ...Typography.bodyLg, color: Colors.text.body, marginTop: Spacing.md, textAlign: 'center' },
  stickerBadge: { marginTop: Spacing.lg, backgroundColor: Colors.brand.sunYellow + '30', borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  stickerText: { ...Typography.bodyLg, color: Colors.brand.sunYellow },
  btnCol: { marginTop: Spacing.xl, gap: Spacing.md, width: '100%', maxWidth: 280 },
});
