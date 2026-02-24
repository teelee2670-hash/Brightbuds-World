import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId } from '@/src/utils/theme';
import { getProgress, getDailyStats, resetAllProgress, DailyStats, WorldProgress } from '@/src/storage/store';
import { checkPremium, purchaseProduct, restorePurchases, getStatus, PRODUCTS } from '@/src/services/subscription';
import KidButton from '@/src/components/KidButton';

function getWorldStars(wp: WorldProgress): number {
  return [...wp.phonics.starsByLevel, ...wp.numbers.starsByLevel, ...wp.shapes.starsByLevel].reduce((a, b) => a + b, 0);
}

export default function ParentCorner() {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'subscription'>('overview');
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [progress, setProgress] = useState<Record<WorldId, WorldProgress> | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [subStatus, setSubStatus] = useState('Free');
  const [purchasing, setPurchasing] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      setStats(await getDailyStats());
      setProgress(await getProgress());
      setIsPremium(await checkPremium());
      setSubStatus(await getStatus());
    })();
  }, []));

  const handlePurchase = async (productId: string) => {
    setPurchasing(true);
    const success = await purchaseProduct(productId);
    if (success) {
      setIsPremium(true);
      setSubStatus('Premium Active');
      Alert.alert('Success!', 'Premium unlocked! All worlds are now available.');
    }
    setPurchasing(false);
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      setIsPremium(true);
      setSubStatus('Premium Active');
      Alert.alert('Restored!', 'Your premium subscription has been restored.');
    } else {
      Alert.alert('No Purchase Found', 'No previous subscription found to restore.');
    }
  };

  const handleReset = () => {
    Alert.alert('Reset Progress?', 'This will erase all game progress and stickers. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        await resetAllProgress();
        setProgress(await getProgress());
        Alert.alert('Done', 'Progress has been reset.');
      }},
    ]);
  };

  const worlds: WorldId[] = ['world1', 'world2', 'world3'];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity testID="parent-back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Parent Dashboard</Text>
        <View style={[styles.badge, { backgroundColor: isPremium ? Colors.status.success : Colors.text.muted }]}>
          <Text style={styles.badgeText}>{subStatus}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity testID="parent-tab-overview" onPress={() => setTab('overview')} style={[styles.tabBtn, tab === 'overview' && styles.tabActive]}>
          <Text style={[styles.tabLabel, tab === 'overview' && styles.tabLabelActive]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="parent-tab-subscription" onPress={() => setTab('subscription')} style={[styles.tabBtn, tab === 'subscription' && styles.tabActive]}>
          <Text style={[styles.tabLabel, tab === 'subscription' && styles.tabLabelActive]}>Subscription</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'overview' && (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={styles.statLabel}>Today's Playtime</Text>
              <Text style={styles.statValue}>{stats?.minutesPlayed || 0} min</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📚</Text>
              <Text style={styles.statLabel}>Skills Practiced Today</Text>
              <Text style={styles.statDetail}>Sounds: {stats?.skillsPracticed.sounds.length || 0} practiced</Text>
              <Text style={styles.statDetail}>Numbers: {stats?.skillsPracticed.numbersRange || 'None yet'}</Text>
              <Text style={styles.statDetail}>Shapes: {stats?.skillsPracticed.shapes.length || 0} practiced</Text>
            </View>

            <Text style={styles.sectionTitle}>Progress by World</Text>
            {worlds.map(wId => {
              const theme = WorldThemes[wId];
              const wp = progress?.[wId];
              const stars = wp ? getWorldStars(wp) : 0;
              return (
                <View key={wId} style={[styles.worldRow, { borderLeftColor: theme.color }]}>
                  <Text style={styles.worldEmoji}>{theme.emoji}</Text>
                  <View style={styles.worldInfo}>
                    <Text style={styles.worldName}>{theme.name}</Text>
                    <Text style={styles.worldStars}>{stars} ⭐</Text>
                    <Text style={styles.worldDetail}>
                      Phonics: L{wp?.phonics.unlockedLevel || 1} | Numbers: L{wp?.numbers.unlockedLevel || 1} | Shapes: L{wp?.shapes.unlockedLevel || 1}
                    </Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.resetSection}>
              <KidButton title="Reset All Progress" onPress={handleReset} color={Colors.status.error} testID="reset-progress-btn" />
            </View>
          </>
        )}

        {tab === 'subscription' && (
          <>
            {!isPremium ? (
              <View style={styles.paywall}>
                <Text style={styles.paywallTitle}>Unlock Premium Worlds</Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bullet}>🌟 2 extra worlds: Space Station + Cuddle Critter City</Text>
                  <Text style={styles.bullet}>📚 More levels in Phonics, Numbers, Shapes</Text>
                  <Text style={styles.bullet}>🎨 Extra sticker packs + decor items</Text>
                  <Text style={styles.bullet}>📱 Offline play • No ads</Text>
                </View>
                <View style={styles.productRow}>
                  <TouchableOpacity
                    testID="purchase-monthly"
                    onPress={() => handlePurchase(PRODUCTS.monthly.id)}
                    disabled={purchasing}
                    style={styles.productCard}
                  >
                    <Text style={styles.productTitle}>{PRODUCTS.monthly.title}</Text>
                    <Text style={styles.productPrice}>{PRODUCTS.monthly.price}</Text>
                    <Text style={styles.productTrial}>{PRODUCTS.monthly.trialText}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID="purchase-annual"
                    onPress={() => handlePurchase(PRODUCTS.annual.id)}
                    disabled={purchasing}
                    style={[styles.productCard, styles.productBest]}
                  >
                    <Text style={styles.bestTag}>BEST VALUE</Text>
                    <Text style={styles.productTitle}>{PRODUCTS.annual.title}</Text>
                    <Text style={styles.productPrice}>{PRODUCTS.annual.price}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity testID="restore-purchases" onPress={handleRestore} style={styles.restoreBtn}>
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>
                <Text style={styles.legal}>
                  Subscription auto-renews. Cancel anytime. Terms of Service and Privacy Policy apply.
                </Text>
              </View>
            ) : (
              <View style={styles.premiumActive}>
                <Text style={styles.premiumEmoji}>🎉</Text>
                <Text style={styles.premiumTitle}>Premium Active</Text>
                <Text style={styles.premiumDesc}>You have full access to all worlds, levels, and rewards!</Text>
                <TouchableOpacity testID="restore-purchases" onPress={handleRestore} style={styles.restoreBtn}>
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.primary },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  backBtn: { padding: Spacing.sm },
  backText: { ...Typography.bodyLg, color: Colors.text.heading },
  title: { ...Typography.h3, color: Colors.text.heading, flex: 1 },
  badge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  badgeText: { ...Typography.label, color: '#fff', fontSize: 11 },
  tabs: { flexDirection: 'row', marginHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  tabBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.background.card, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.brand.spaceBlue },
  tabLabel: { ...Typography.bodyMd, color: Colors.text.muted, fontWeight: '600' },
  tabLabelActive: { color: Colors.text.inverse },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  statCard: { backgroundColor: Colors.background.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  statEmoji: { fontSize: 28 },
  statLabel: { ...Typography.bodyLg, color: Colors.text.heading, marginTop: 4 },
  statValue: { ...Typography.h2, color: Colors.action.primary },
  statDetail: { ...Typography.bodyMd, color: Colors.text.muted, marginTop: 2 },
  sectionTitle: { ...Typography.label, color: Colors.text.muted, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  worldRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 4 },
  worldEmoji: { fontSize: 32, marginRight: Spacing.md },
  worldInfo: { flex: 1 },
  worldName: { ...Typography.bodyLg, color: Colors.text.heading },
  worldStars: { ...Typography.bodyMd, color: Colors.brand.sunYellow },
  worldDetail: { ...Typography.label, color: Colors.text.muted, fontSize: 11, marginTop: 2 },
  resetSection: { marginTop: Spacing.xl, alignItems: 'center' },
  paywall: { alignItems: 'center' },
  paywallTitle: { ...Typography.h2, color: Colors.text.heading, marginBottom: Spacing.md },
  bulletList: { width: '100%', marginBottom: Spacing.lg },
  bullet: { ...Typography.bodyMd, color: Colors.text.body, marginBottom: Spacing.sm, paddingLeft: Spacing.sm },
  productRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  productCard: { flex: 1, backgroundColor: Colors.background.card, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 2, borderColor: Colors.action.disabled },
  productBest: { borderColor: Colors.action.primary, backgroundColor: Colors.action.primary + '10' },
  bestTag: { ...Typography.label, color: Colors.action.primary, fontSize: 10, marginBottom: 4 },
  productTitle: { ...Typography.bodyLg, color: Colors.text.heading },
  productPrice: { ...Typography.h3, color: Colors.action.primary, marginTop: 4 },
  productTrial: { ...Typography.bodyMd, color: Colors.text.muted, fontSize: 12, marginTop: 2 },
  restoreBtn: { padding: Spacing.md },
  restoreText: { ...Typography.bodyMd, color: Colors.brand.spaceBlue, textDecorationLine: 'underline' },
  legal: { ...Typography.label, color: Colors.text.muted, fontSize: 10, textAlign: 'center', marginTop: Spacing.md, paddingHorizontal: Spacing.lg },
  premiumActive: { alignItems: 'center', padding: Spacing.xl },
  premiumEmoji: { fontSize: 64 },
  premiumTitle: { ...Typography.h2, color: Colors.status.success, marginTop: Spacing.md },
  premiumDesc: { ...Typography.bodyMd, color: Colors.text.body, textAlign: 'center', marginTop: Spacing.sm },
});
