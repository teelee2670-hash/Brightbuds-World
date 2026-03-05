import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/src/utils/theme';

type Props = { visible: boolean; onPass: () => void; onCancel: () => void };

export default function ParentalGate({ visible, onPass, onCancel }: Props) {
  const [step, setStep] = useState<'hold' | 'math'>('hold');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [nums] = useState(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { a, b, sum: a + b };
  });
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const startHold = () => {
    Animated.timing(progress, { toValue: 1, duration: 3000, useNativeDriver: false }).start();
    holdTimer.current = setTimeout(() => { setStep('math'); }, 3000);
  };

  const endHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const checkAnswer = () => {
    if (parseInt(answer, 10) === nums.sum) {
      setStep('hold');
      setAnswer('');
      setError('');
      onPass();
    } else {
      setError('Not quite, try again!');
      setAnswer('');
    }
  };

  const handleCancel = () => {
    setStep('hold');
    setAnswer('');
    setError('');
    onCancel();
  };

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Parent Area</Text>
          {step === 'hold' ? (
            <>
              <Text style={styles.desc}>Press and hold the button for 3 seconds</Text>
              <TouchableOpacity
                testID="parental-gate-hold-btn"
                onPressIn={startHold}
                onPressOut={endHold}
                activeOpacity={0.9}
                style={styles.holdBtn}
              >
                <Text style={styles.holdText}>Hold Here</Text>
                <View style={styles.progressBg}>
                  <Animated.View style={[styles.progressFill, { width }]} />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.desc}>What is {nums.a} + {nums.b}?</Text>
              <TextInput
                testID="parental-gate-input"
                style={styles.input}
                value={answer}
                onChangeText={setAnswer}
                keyboardType="number-pad"
                placeholder="Type answer"
                placeholderTextColor={Colors.text.muted}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity testID="parental-gate-submit" onPress={checkAnswer} style={styles.submitBtn}>
                <Text style={styles.submitText}>Check</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity testID="parental-gate-cancel" onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.background.overlay, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  card: { backgroundColor: Colors.background.card, borderRadius: Radius.xl, padding: Spacing.xl, width: '100%', maxWidth: 360, alignItems: 'center' },
  title: { ...Typography.h2, color: Colors.text.heading, marginBottom: Spacing.md },
  desc: { ...Typography.bodyMd, color: Colors.text.body, textAlign: 'center', marginBottom: Spacing.lg },
  holdBtn: { backgroundColor: Colors.brand.spaceBlue, borderRadius: Radius.lg, padding: Spacing.lg, width: '100%', alignItems: 'center' },
  holdText: { ...Typography.bodyLg, color: Colors.text.inverse, marginBottom: Spacing.sm },
  progressBg: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  input: { borderWidth: 2, borderColor: Colors.brand.spaceBlue, borderRadius: Radius.md, padding: Spacing.md, width: '100%', fontSize: 24, textAlign: 'center', marginBottom: Spacing.md },
  error: { color: Colors.status.error, ...Typography.bodyMd, marginBottom: Spacing.sm },
  submitBtn: { backgroundColor: Colors.action.primary, borderRadius: Radius.full, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  submitText: { ...Typography.bodyLg, color: Colors.action.primaryText },
  cancelBtn: { paddingVertical: Spacing.sm },
  cancelText: { ...Typography.bodyMd, color: Colors.text.muted },
});
