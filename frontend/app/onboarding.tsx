import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/src/utils/theme';
import { AVATARS } from '@/src/data/avatars';
import { setProfile, UserProfile, AgeBand } from '@/src/storage/store';
import { setAudioEnabled, speak } from '@/src/utils/audio';
import KidButton from '@/src/components/KidButton';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [avatarId, setAvatarId] = useState('');
  const [nickname, setNickname] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('4-5');
  const [audioOn, setAudioOn] = useState(true);

  const finish = async () => {
    const profile: UserProfile = { avatarId: avatarId || 'dino', nickname, ageBand, audioOn, onboarded: true };
    setAudioEnabled(audioOn);
    await setProfile(profile);
    router.replace('/map');
  };

  const next = () => {
    if (step === 0 && !avatarId) { speak('Pick your buddy!'); return; }
    if (step < 3) setStep(step + 1);
    else finish();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>BrightBuds World</Text>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          {step === 0 && (
            <View testID="onboarding-step-avatar">
              <Text style={styles.heading}>Pick Your Buddy!</Text>
              <View style={styles.avatarGrid}>
                {AVATARS.map(a => (
                  <TouchableOpacity
                    key={a.id}
                    testID={`avatar-${a.id}`}
                    onPress={() => { setAvatarId(a.id); speak(a.name); }}
                    activeOpacity={0.7}
                    style={[styles.avatarCard, { borderColor: avatarId === a.id ? a.color : 'transparent', backgroundColor: avatarId === a.id ? a.color + '20' : Colors.background.card }]}
                  >
                    <Text style={styles.avatarEmoji}>{a.emoji}</Text>
                    <Text style={styles.avatarName}>{a.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 1 && (
            <View testID="onboarding-step-nickname">
              <Text style={styles.heading}>What's your name?</Text>
              <Text style={styles.sub}>(You can skip this!)</Text>
              <TextInput
                testID="nickname-input"
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Type your name..."
                placeholderTextColor={Colors.text.muted}
                maxLength={20}
              />
            </View>
          )}

          {step === 2 && (
            <View testID="onboarding-step-age">
              <Text style={styles.heading}>How old are you?</Text>
              <View style={styles.ageRow}>
                <TouchableOpacity
                  testID="age-4-5"
                  onPress={() => setAgeBand('4-5')}
                  activeOpacity={0.7}
                  style={[styles.ageCard, ageBand === '4-5' && styles.ageActive]}
                >
                  <Text style={styles.ageEmoji}>🌟</Text>
                  <Text style={styles.ageText}>4 - 5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="age-6-7"
                  onPress={() => setAgeBand('6-7')}
                  activeOpacity={0.7}
                  style={[styles.ageCard, ageBand === '6-7' && styles.ageActive]}
                >
                  <Text style={styles.ageEmoji}>🚀</Text>
                  <Text style={styles.ageText}>6 - 7</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 3 && (
            <View testID="onboarding-step-audio">
              <Text style={styles.heading}>Sound?</Text>
              <View style={styles.ageRow}>
                <TouchableOpacity
                  testID="audio-on"
                  onPress={() => setAudioOn(true)}
                  activeOpacity={0.7}
                  style={[styles.ageCard, audioOn && styles.ageActive]}
                >
                  <Text style={styles.ageEmoji}>🔊</Text>
                  <Text style={styles.ageText}>On</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="audio-off"
                  onPress={() => setAudioOn(false)}
                  activeOpacity={0.7}
                  style={[styles.ageCard, !audioOn && styles.ageActive]}
                >
                  <Text style={styles.ageEmoji}>🔇</Text>
                  <Text style={styles.ageText}>Off</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.btnRow}>
            {step > 0 && (
              <KidButton title="Back" onPress={() => setStep(step - 1)} color={Colors.action.secondary} testID="onboarding-back-btn" />
            )}
            <KidButton
              title={step === 3 ? "Let's Go!" : 'Next'}
              onPress={next}
              emoji={step === 3 ? '🎉' : '➡️'}
              testID="onboarding-next-btn"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background.primary },
  scroll: { flexGrow: 1, padding: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.h1, color: Colors.action.primary, marginBottom: Spacing.md, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.action.disabled },
  dotActive: { backgroundColor: Colors.action.primary, width: 24 },
  heading: { ...Typography.h2, color: Colors.text.heading, textAlign: 'center', marginBottom: Spacing.md },
  sub: { ...Typography.bodyMd, color: Colors.text.muted, textAlign: 'center', marginBottom: Spacing.md },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  avatarCard: { width: 140, height: 140, borderRadius: Radius.xl, borderWidth: 4, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  avatarEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  avatarName: { ...Typography.bodyLg, color: Colors.text.heading },
  input: { borderWidth: 2, borderColor: Colors.brand.sunYellow, borderRadius: Radius.lg, padding: Spacing.md, width: '100%', maxWidth: 300, fontSize: 20, textAlign: 'center', backgroundColor: Colors.background.card },
  ageRow: { flexDirection: 'row', gap: Spacing.lg, justifyContent: 'center' },
  ageCard: { width: 130, height: 130, borderRadius: Radius.xl, backgroundColor: Colors.background.card, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  ageActive: { borderColor: Colors.action.primary, backgroundColor: Colors.action.primary + '15' },
  ageEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  ageText: { ...Typography.h3, color: Colors.text.heading },
  btnRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
});
