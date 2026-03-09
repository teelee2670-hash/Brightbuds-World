import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId, GameType } from '@/src/utils/theme';
import { updateLevelProgress, addSticker, updateDailyStats } from '@/src/storage/store';
import { STICKERS } from '@/src/data/rewards';
import { speak, sfx, voice, playSequence, stopSpeaking } from '@/src/utils/audio';
import StarDisplay from '@/src/components/StarDisplay';
import KidButton from '@/src/components/KidButton';
import Fireworks from '@/src/components/Fireworks';

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
  
  // Check if this is the final level (level 10) and player got at least 1 star
  const isFinalLevel = lvl === 10;
  const beatTheGame = isFinalLevel && starCount >= 1;
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    let cancelled = false;

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
    
    // Show fireworks if player beat level 10
    if (beatTheGame) {
      setTimeout(() => setShowFireworks(true), 500);
    }
    
    // Play audio sequentially - each sound waits for the previous to finish
    const playResultAudio = async () => {
      // Small initial delay for the animation to start
      await new Promise(r => setTimeout(r, 400));
      if (cancelled) return;

      if (starCount >= 2) {
        const sequence = ['celebrate'];
        sequence.push(starCount === 3 ? 'three_stars' : 'two_stars');
        if (stickerEarned) sequence.push('sticker_earned');
        await playSequence(sequence, 400);
      } else if (starCount === 1) {
        await playSequence(['one_star'], 0);
      } else {
        await playSequence(['try_again'], 0);
      }
    };
    playResultAudio();

    return () => { cancelled = true; };
  }, []);

  const handlePlayAgain = () => {
    stopSpeaking();
    router.replace({ pathname: '/game', params: { worldId: wId, gameType: gType, level: String(lvl) } });
  };

  // Special message for beating the game
  const getHeading = () => {
    if (beatTheGame) return '🎉 You Beat The Game! 🎉';
    if (starCount >= 2) return 'Awesome!';
    return 'Nice Try!';
  };

  const getMessage = () => {
    if (beatTheGame) {
      return starCount === 3 
        ? 'Perfect victory! You reached the castle!' 
        : 'Amazing! You conquered all 10 levels!';
    }
    if (starCount === 3) return 'Perfect round!';
    if (starCount === 2) return 'Almost perfect!';
    return 'Keep practicing!';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Fireworks celebration for beating level 10 */}
      <Fireworks active={showFireworks} />
      
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Trophy for beating the game */}
        {beatTheGame ? (
          <View style={styles.trophyContainer}>
            <Text style={styles.trophyEmoji}>🏆</Text>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
        ) : (
          <Text style={styles.emoji}>{theme.emoji}</Text>
        )}
        
        <Text style={[styles.heading, beatTheGame && styles.victoryHeading]}>
          {getHeading()}
        </Text>
        
        <StarDisplay stars={starCount} size={48} />
        
        <Text style={styles.message}>{getMessage()}</Text>
        
        {/* Champion badge for beating the game */}
        {beatTheGame && (
          <View style={styles.championBadge}>
            <Text style={styles.championText}>🌟 World Champion! 🌟</Text>
          </View>
        )}
        
        {stickerEarned && !beatTheGame && (
          <View style={styles.stickerBadge}>
            <Text style={styles.stickerText}>Sticker earned!</Text>
          </View>
        )}
        
        <View style={styles.btnCol}>
          {!beatTheGame && (
            <KidButton title="Play Again" emoji="🔄" onPress={handlePlayAgain} testID="play-again-btn" color={theme.color} />
          )}
          <KidButton 
            title={beatTheGame ? "Back to Castle" : "Back to Levels"} 
            emoji={beatTheGame ? "🏰" : "🗺️"} 
            onPress={() => { stopSpeaking(); router.replace({ pathname: '/level-select', params: { worldId: wId, gameType: gType } }); }} 
            testID="back-to-map-btn" 
            color={beatTheGame ? theme.color : Colors.action.secondary} 
          />
          {beatTheGame && (
            <KidButton 
              title="Try Another World" 
              emoji="🌍" 
              onPress={() => { stopSpeaking(); router.replace('/map'); }} 
              testID="other-world-btn" 
              color={Colors.action.secondary} 
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emoji: { fontSize: 72, marginBottom: Spacing.md },
  trophyContainer: { 
    alignItems: 'center', 
    marginBottom: Spacing.md,
  },
  trophyEmoji: { 
    fontSize: 80,
  },
  crownEmoji: { 
    fontSize: 40, 
    marginTop: -15,
  },
  heading: { ...Typography.h1, color: Colors.text.heading, marginBottom: Spacing.lg, textAlign: 'center' },
  victoryHeading: { 
    fontSize: 24, 
    color: '#FFD700',
  },
  message: { ...Typography.bodyLg, color: Colors.text.body, marginTop: Spacing.md, textAlign: 'center' },
  championBadge: { 
    marginTop: Spacing.lg, 
    backgroundColor: '#FFD700' + '30', 
    borderRadius: Radius.full, 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.sm,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  championText: { 
    ...Typography.bodyLg, 
    color: '#B8860B',
    fontWeight: '700',
  },
  stickerBadge: { marginTop: Spacing.lg, backgroundColor: Colors.brand.sunYellow + '30', borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  stickerText: { ...Typography.bodyLg, color: Colors.brand.sunYellow },
  btnCol: { marginTop: Spacing.xl, gap: Spacing.md, width: '100%', maxWidth: 280 },
});
