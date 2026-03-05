import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, WorldThemes, GameTypeInfo, WorldId, GameType } from '@/src/utils/theme';
import { getProgress, getRewards, getProfile, addSticker, setRewards, GameProgress, Rewards } from '@/src/storage/store';
import MarioPathMap from '@/src/components/MarioPathMap';
import { sfx } from '@/src/utils/audio';

// Avatar emoji mapping
const AVATARS: Record<string, string> = {
  dino: '🦕',
  astronaut: '👨‍🚀',
  puppy: '🐶',
  kitten: '🐱',
  bunny: '🐰',
  panda: '🐼',
  owl: '🦉',
  fox: '🦊',
};

// Rare rewards that can be collected on the path
const PATH_REWARDS = [
  { id: 'path_coin_1', type: 'coin', stars: 5 },
  { id: 'path_gem_1', type: 'gem', stars: 10 },
  { id: 'path_coin_2', type: 'coin', stars: 5 },
  { id: 'path_gem_2', type: 'gem', stars: 10 },
];

export default function LevelSelect() {
  const router = useRouter();
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const wId = (worldId || 'world1') as WorldId;
  const theme = WorldThemes[wId];
  const [gameType, setGameType] = useState<GameType>('phonics');
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [rewards, setRewardsState] = useState<Rewards | null>(null);
  const [collectedPathRewards, setCollectedPathRewards] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🦕');

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [gameType, wId])
  );

  const loadProgress = async () => {
    const progress = await getProgress();
    setGameProgress(progress[wId]?.[gameType] || { unlockedLevel: 1, starsByLevel: [] });
    const rewardsData = await getRewards();
    setRewardsState(rewardsData);
    // Track which path rewards have been collected (stored in stickers)
    const collected = PATH_REWARDS.filter(r => 
      rewardsData.stickersEarned.includes(`${wId}_${gameType}_${r.id}`)
    ).map(r => r.id);
    setCollectedPathRewards(collected);
    
    // Get user's selected avatar
    const profile = await getProfile();
    const avatarEmoji = AVATARS[profile.avatar] || '🦕';
    setSelectedAvatar(avatarEmoji);
  };

  const handleLevel = (level: number) => {
    if (!gameProgress || level > gameProgress.unlockedLevel) {
      sfx.wrong();
      return;
    }
    sfx.tap();
    router.push({ pathname: '/game', params: { worldId: wId, gameType, level: String(level) } });
  };

  const handleRewardPress = async (rewardType: string, index: number) => {
    const reward = PATH_REWARDS[index];
    if (!reward || collectedPathRewards.includes(reward.id)) return;

    // Check if player has enough total stars to collect this reward
    const totalStars = gameProgress?.starsByLevel.reduce((a, b) => a + b, 0) || 0;
    const requiredStars = reward.stars;

    if (totalStars < requiredStars) {
      Alert.alert(
        '⭐ More Stars Needed!',
        `You need ${requiredStars} stars to collect this ${rewardType}!\n\nYou have: ${totalStars} ⭐`,
        [{ text: 'Keep Playing!' }]
      );
      return;
    }

    // Collect the reward!
    sfx.stickerEarned();
    const rewardId = `${wId}_${gameType}_${reward.id}`;
    await addSticker(rewardId);
    setCollectedPathRewards([...collectedPathRewards, reward.id]);
    
    Alert.alert(
      '🎉 Reward Collected!',
      `You got a ${getRewardName(rewardType)}!\n\nCheck your Rewards room!`,
      [{ text: 'Awesome!' }]
    );
  };

  const getRewardName = (type: string) => {
    switch (type) {
      case 'coin': return 'Golden Coin 🪙';
      case 'gem': return 'Magic Gem 💎';
      case 'star': return 'Super Star ⭐';
      case 'treasure': return 'Royal Crown 👑';
      default: return 'Mystery Gift 🎁';
    }
  };

  const totalStars = gameProgress?.starsByLevel.reduce((a, b) => a + b, 0) || 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top navigation bar */}
      <View style={[styles.topBar, { backgroundColor: theme.color + '20' }]}>
        <TouchableOpacity testID="level-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.starCounter}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.starCount}>{totalStars}</Text>
        </View>
        <TouchableOpacity testID="level-home-btn" onPress={() => router.replace('/map')} style={styles.homeBtn}>
          <Text style={styles.homeText}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Game type tabs */}
      <View style={styles.worldTitleRow}>
        <Text style={[styles.worldEmoji]}>{theme.emoji}</Text>
        <Text style={[styles.worldTitle, { color: theme.color }]}>{theme.name}</Text>
      </View>
      
      <View style={styles.tabs}>
        {(['phonics', 'numbers', 'shapes'] as GameType[]).map(gt => {
          const info = GameTypeInfo[gt];
          const active = gameType === gt;
          return (
            <TouchableOpacity
              key={gt}
              testID={`tab-${gt}`}
              onPress={() => {
                sfx.tap();
                setGameType(gt);
              }}
              activeOpacity={0.7}
              style={[styles.tab, active && { backgroundColor: info.color + '25', borderColor: info.color }]}
            >
              <Text style={styles.tabEmoji}>{info.emoji}</Text>
              <Text style={[styles.tabText, active && { color: info.color }]}>{info.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Mario-style path map */}
      <MarioPathMap
        worldId={wId}
        gameType={gameType}
        gameProgress={gameProgress}
        selectedAvatar={selectedAvatar}
        onLevelPress={handleLevel}
        onRewardPress={handleRewardPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: Colors.background.primary,
  },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.md, 
    gap: Spacing.md,
  },
  backBtn: { 
    padding: Spacing.sm,
  },
  backText: { 
    ...Typography.bodyLg, 
    color: Colors.text.heading,
  },
  starCounter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.brand.sunYellow + '30',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  starEmoji: {
    fontSize: 18,
  },
  starCount: {
    ...Typography.bodyLg,
    color: Colors.text.heading,
    fontWeight: '700',
  },
  homeBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: Colors.background.card, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  homeText: { 
    fontSize: 22,
  },
  tabs: { 
    flexDirection: 'row', 
    paddingHorizontal: Spacing.md, 
    gap: Spacing.sm, 
    marginBottom: Spacing.sm,
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 4, 
    paddingVertical: Spacing.sm, 
    borderRadius: Radius.full, 
    borderWidth: 2, 
    borderColor: 'transparent', 
    backgroundColor: Colors.background.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabEmoji: { 
    fontSize: 18,
  },
  tabText: { 
    ...Typography.bodyMd, 
    color: Colors.text.muted, 
    fontWeight: '600',
  },
  worldTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  worldEmoji: {
    fontSize: 28,
  },
  worldTitle: {
    ...Typography.h3,
    fontWeight: '700',
  },
});
