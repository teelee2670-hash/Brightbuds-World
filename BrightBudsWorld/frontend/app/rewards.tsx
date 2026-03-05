import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/src/utils/theme';
import { getRewards, setRewards, Rewards } from '@/src/storage/store';
import { STICKERS } from '@/src/data/rewards';
import { DECOR } from '@/src/data/rewards';
import { checkPremium } from '@/src/services/subscription';

export default function RewardsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'stickers' | 'decor'>('stickers');
  const [rewards, setRewardsState] = useState<Rewards | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    (async () => {
      setRewardsState(await getRewards());
      setIsPremium(await checkPremium());
    })();
  }, []);

  const allStickers = [...STICKERS.world1, ...(isPremium ? [...STICKERS.world2, ...STICKERS.world3] : [])];

  const selectDecor = async (type: 'wallpaperId' | 'rugId' | 'posterId', id: string) => {
    if (!rewards) return;
    const updated = { ...rewards, decorSelected: { ...rewards.decorSelected, [type]: id } };
    await setRewards(updated);
    setRewardsState(updated);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity testID="rewards-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Reward Room</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity testID="tab-stickers" onPress={() => setTab('stickers')} style={[styles.tabBtn, tab === 'stickers' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'stickers' && styles.tabTextActive]}>Stickers</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="tab-decor" onPress={() => setTab('decor')} style={[styles.tabBtn, tab === 'decor' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'decor' && styles.tabTextActive]}>Decor</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'stickers' && (
          <View style={styles.stickerGrid}>
            {allStickers.map(s => {
              const earned = rewards?.stickersEarned.includes(s.id);
              return (
                <View key={s.id} testID={`sticker-${s.id}`} style={[styles.stickerSlot, earned && styles.stickerEarned]}>
                  <Text style={styles.stickerEmoji}>{earned ? s.emoji : '❓'}</Text>
                  <Text style={styles.stickerName}>{earned ? s.name : '???'}</Text>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'decor' && (
          <>
            <Text style={styles.decorTitle}>Wallpaper</Text>
            <View style={styles.decorRow}>
              {DECOR.wallpapers.filter(d => !d.premium || isPremium).map(d => (
                <TouchableOpacity
                  key={d.id}
                  testID={`decor-wall-${d.id}`}
                  onPress={() => selectDecor('wallpaperId', d.id)}
                  style={[styles.decorItem, { backgroundColor: d.color }, rewards?.decorSelected.wallpaperId === d.id && styles.decorSelected]}
                >
                  <Text style={styles.decorEmoji}>{d.emoji}</Text>
                  <Text style={styles.decorName}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.decorTitle}>Rug</Text>
            <View style={styles.decorRow}>
              {DECOR.rugs.filter(d => !d.premium || isPremium).map(d => (
                <TouchableOpacity
                  key={d.id}
                  testID={`decor-rug-${d.id}`}
                  onPress={() => selectDecor('rugId', d.id)}
                  style={[styles.decorItem, { backgroundColor: d.color }, rewards?.decorSelected.rugId === d.id && styles.decorSelected]}
                >
                  <Text style={styles.decorEmoji}>{d.emoji}</Text>
                  <Text style={styles.decorName}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.decorTitle}>Poster</Text>
            <View style={styles.decorRow}>
              {DECOR.posters.filter(d => !d.premium || isPremium).map(d => (
                <TouchableOpacity
                  key={d.id}
                  testID={`decor-poster-${d.id}`}
                  onPress={() => selectDecor('posterId', d.id)}
                  style={[styles.decorItem, { backgroundColor: d.color }, rewards?.decorSelected.posterId === d.id && styles.decorSelected]}
                >
                  <Text style={styles.decorEmoji}>{d.emoji}</Text>
                  <Text style={styles.decorName}>{d.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.sm },
  backText: { ...Typography.bodyLg, color: Colors.text.heading },
  title: { ...Typography.h3, color: Colors.text.heading },
  tabs: { flexDirection: 'row', marginHorizontal: Spacing.md, gap: Spacing.sm },
  tabBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.background.card, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.action.primary },
  tabText: { ...Typography.bodyMd, color: Colors.text.muted, fontWeight: '600' },
  tabTextActive: { color: Colors.action.primaryText },
  content: { padding: Spacing.md },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  stickerSlot: { width: 90, height: 90, borderRadius: Radius.lg, backgroundColor: Colors.background.card, borderWidth: 2, borderColor: Colors.status.locked + '40', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  stickerEarned: { borderColor: Colors.brand.sunYellow, borderStyle: 'solid', backgroundColor: Colors.brand.sunYellow + '15' },
  stickerEmoji: { fontSize: 32 },
  stickerName: { fontSize: 10, color: Colors.text.muted, marginTop: 2, textAlign: 'center' },
  decorTitle: { ...Typography.label, color: Colors.text.muted, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  decorRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  decorItem: { width: 80, height: 80, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  decorSelected: { borderColor: Colors.action.primary },
  decorEmoji: { fontSize: 28 },
  decorName: { fontSize: 10, color: Colors.text.heading, marginTop: 2, fontWeight: '600' },
});
