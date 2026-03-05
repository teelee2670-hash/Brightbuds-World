import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId } from '@/src/utils/theme';
import { NumbersLevel, NUMBER_THEMES } from '@/src/data/gameLevels';
import { speak, sfx, voice } from '@/src/utils/audio';

type Props = { level: NumbersLevel; worldId: WorldId; onComplete: (stars: number) => void };

export default function NumbersGame({ level, worldId, onComplete }: Props) {
  const theme = WorldThemes[worldId];
  const numTheme = NUMBER_THEMES[worldId];
  const totalItems = Math.min(level.targetNumber + 4, 20);
  const [count, setCount] = useState(0);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [showCheck, setShowCheck] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [done, setDone] = useState(false);
  const bounceAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setCount(0);
    setTapped(new Set());
    setAttempts(0);
    setShowCheck(false);
    setFeedback('');
    setDone(false);
    // Use pre-generated world-specific counting instruction audio
    setTimeout(() => {
      if (worldId === 'world1') voice.countDino();
      else if (worldId === 'world2') voice.countSpace();
      else voice.countAnimals();
    }, 300);
  }, [level]);

  const handleTapItem = (idx: number) => {
    if (tapped.has(idx) || done) return;
    const newTapped = new Set(tapped);
    newTapped.add(idx);
    setTapped(newTapped);
    const newCount = count + 1;
    setCount(newCount);
    sfx.countUp(newCount);
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    if (newCount >= 1) setShowCheck(true);
  };

  const handleCheck = () => {
    if (count === level.targetNumber) {
      setDone(true);
      const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      sfx.celebrate();
      setTimeout(() => onComplete(stars), 1000);
    } else {
      setAttempts(a => a + 1);
      const msg = count < level.targetNumber
        ? `That's ${count}. We need ${level.targetNumber}!`
        : `Oops! ${count} is too many. We need ${level.targetNumber}!`;
      setFeedback(msg);
      sfx.wrong();
      setTimeout(() => sfx.tryAgain(), 500);
      setTimeout(() => {
        setCount(0);
        setTapped(new Set());
        setShowCheck(false);
        setFeedback('');
      }, 1800);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Animated.Text style={[styles.character, { transform: [{ scale: bounceAnim }] }]}>{numTheme.character}</Animated.Text>
        <Text style={styles.instruction}>
          {numTheme.action} <Text style={[styles.targetNum, { color: theme.color }]}>{level.targetNumber}</Text> {numTheme.itemName}!
        </Text>
        <Text style={styles.counter}>{count} / {level.targetNumber}</Text>
      </View>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      <View style={styles.grid}>
        {Array.from({ length: totalItems }, (_, idx) => (
          <TouchableOpacity
            key={idx}
            testID={`number-item-${idx}`}
            onPress={() => handleTapItem(idx)}
            disabled={tapped.has(idx) || done}
            activeOpacity={0.6}
            style={[styles.item, tapped.has(idx) && styles.itemTapped]}
          >
            <Text style={[styles.itemEmoji, tapped.has(idx) && styles.itemEmojiTapped]}>
              {numTheme.item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {showCheck && !done && (
        <TouchableOpacity testID="numbers-check-btn" onPress={handleCheck} style={[styles.checkBtn, { backgroundColor: theme.color }]}>
          <Text style={styles.checkText}>Done! ✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  header: { alignItems: 'center', marginBottom: Spacing.md, paddingTop: Spacing.sm },
  character: { fontSize: 56 },
  instruction: { ...Typography.bodyLg, color: Colors.text.heading, textAlign: 'center', marginTop: Spacing.sm },
  targetNum: { ...Typography.h1, fontSize: 28 },
  counter: { ...Typography.h2, color: Colors.text.heading, marginTop: Spacing.sm },
  feedback: { ...Typography.bodyMd, color: Colors.status.error, textAlign: 'center', marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm },
  item: { width: 60, height: 60, borderRadius: Radius.md, backgroundColor: Colors.background.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  itemTapped: { backgroundColor: Colors.status.success + '30', opacity: 0.5 },
  itemEmoji: { fontSize: 32 },
  itemEmojiTapped: { opacity: 0.4 },
  checkBtn: { marginTop: Spacing.lg, alignSelf: 'center', borderRadius: Radius.full, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xxl },
  checkText: { ...Typography.bodyLg, color: Colors.text.inverse },
});
