import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId } from '@/src/utils/theme';
import { PhonicsLevel, shuffle } from '@/src/data/gameLevels';
import { speak } from '@/src/utils/audio';

type Props = { level: PhonicsLevel; worldId: WorldId; onComplete: (stars: number) => void };

export default function PhonicsGame({ level, worldId, onComplete }: Props) {
  const theme = WorldThemes[worldId];
  const [items, setItems] = useState(shuffle(level.items));
  const [found, setFound] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const totalCorrect = level.items.filter(i => i.isCorrect).length;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setItems(shuffle(level.items));
    setFound(new Set());
    setMistakes(0);
    setDone(false);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => speak(`Tap the pictures that start with the ${level.targetSound} sound`), 300);
  }, [level]);

  const handleTap = useCallback((idx: number) => {
    if (found.has(idx) || done) return;
    const item = items[idx];
    if (item.isCorrect) {
      const newFound = new Set(found);
      newFound.add(idx);
      setFound(newFound);
      speak(item.word, 1);
      if (newFound.size === totalCorrect) {
        setDone(true);
        const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
        setTimeout(() => {
          speak(stars === 3 ? 'Amazing!' : stars === 2 ? 'Great job!' : 'Good try!');
          onComplete(stars);
        }, 800);
      }
    } else {
      setMistakes(m => m + 1);
      setWrongIdx(idx);
      speak('Try again!', 1);
      setTimeout(() => setWrongIdx(null), 600);
    }
  }, [found, done, items, mistakes, totalCorrect, onComplete, level]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.bg, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{theme.emoji}</Text>
        <Text style={styles.instruction}>
          Tap pictures that start with <Text style={[styles.sound, { color: theme.color }]}>/{level.targetSound}/</Text>
        </Text>
      </View>
      <View style={styles.grid}>
        {items.map((item, idx) => {
          const isFound = found.has(idx);
          const isWrong = wrongIdx === idx;
          return (
            <TouchableOpacity
              key={idx}
              testID={`phonics-item-${idx}`}
              onPress={() => handleTap(idx)}
              disabled={isFound}
              activeOpacity={0.7}
              style={[
                styles.card,
                isFound && { backgroundColor: Colors.status.success + '30', borderColor: Colors.status.success },
                isWrong && { backgroundColor: Colors.status.error + '30', borderColor: Colors.status.error },
              ]}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemWord}>{item.word}</Text>
              {isFound && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.progress}>
        <Text style={styles.progressText}>Found: {found.size}/{totalCorrect}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  header: { alignItems: 'center', marginBottom: Spacing.lg, paddingTop: Spacing.md },
  emoji: { fontSize: 48, marginBottom: Spacing.sm },
  instruction: { ...Typography.bodyLg, color: Colors.text.heading, textAlign: 'center' },
  sound: { ...Typography.h2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  card: { width: '29%', aspectRatio: 0.85, backgroundColor: Colors.background.card, borderRadius: Radius.lg, borderWidth: 3, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, padding: Spacing.sm },
  itemEmoji: { fontSize: 36 },
  itemWord: { ...Typography.label, color: Colors.text.body, marginTop: 4, textAlign: 'center' },
  check: { position: 'absolute', top: 4, right: 8, fontSize: 18, color: Colors.status.success },
  progress: { alignItems: 'center', marginTop: Spacing.lg },
  progressText: { ...Typography.bodyMd, color: Colors.text.muted },
});
