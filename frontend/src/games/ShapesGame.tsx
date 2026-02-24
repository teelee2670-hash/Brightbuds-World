import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId } from '@/src/utils/theme';
import { ShapesLevel, ShapeType, shuffle } from '@/src/data/gameLevels';
import { speak } from '@/src/utils/audio';

type Props = { level: ShapesLevel; worldId: WorldId; onComplete: (stars: number) => void };

const SHAPE_COLORS: Record<ShapeType, string> = {
  circle: '#FF6B6B', square: '#4ECDC4', triangle: '#FFE66D', rectangle: '#A8E6CF', star: '#FF9F1C',
};

const SHAPE_LABELS: Record<ShapeType, string> = {
  circle: '●', square: '■', triangle: '▲', rectangle: '▬', star: '★',
};

const ShapeView = ({ shape, size, filled, selected }: { shape: ShapeType; size: number; filled: boolean; selected: boolean }) => {
  const color = SHAPE_COLORS[shape];
  const borderW = selected ? 4 : 3;
  const borderC = selected ? Colors.action.primary : filled ? color : Colors.text.muted;

  if (shape === 'circle') {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: filled ? color : 'transparent', borderWidth: borderW, borderColor: borderC, borderStyle: filled ? 'solid' : 'dashed' }} />
    );
  }
  if (shape === 'triangle') {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.7, color: filled ? color : borderC }}>{filled ? '▲' : '△'}</Text>
      </View>
    );
  }
  if (shape === 'star') {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.7, color: filled ? color : borderC }}>{filled ? '★' : '☆'}</Text>
      </View>
    );
  }
  const w = shape === 'rectangle' ? size * 1.4 : size;
  return (
    <View style={{ width: w, height: size, borderRadius: Radius.sm, backgroundColor: filled ? color : 'transparent', borderWidth: borderW, borderColor: borderC, borderStyle: filled ? 'solid' : 'dashed' }} />
  );
};

export default function ShapesGame({ level, worldId, onComplete }: Props) {
  const theme = WorldThemes[worldId];
  const allPieces = shuffle([...level.targets, ...level.extras]);
  const [pieces, setPieces] = useState<ShapeType[]>(allPieces);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [placed, setPlaced] = useState<(ShapeType | null)[]>(level.targets.map(() => null));
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [usedPieces, setUsedPieces] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newPieces = shuffle([...level.targets, ...level.extras]);
    setPieces(newPieces);
    setSelectedPiece(null);
    setPlaced(level.targets.map(() => null));
    setMistakes(0);
    setDone(false);
    setUsedPieces(new Set());
    const themeText = worldId === 'world1' ? 'dino fossil puzzle' : worldId === 'world2' ? 'rocket' : 'animal house';
    setTimeout(() => speak(`Match the shapes! Complete the ${themeText}!`), 300);
  }, [level]);

  const handleSelectPiece = (idx: number) => {
    if (usedPieces.has(idx) || done) return;
    setSelectedPiece(idx);
    speak(pieces[idx]);
  };

  const handleTapSlot = (slotIdx: number) => {
    if (placed[slotIdx] !== null || selectedPiece === null || done) return;
    const targetShape = level.targets[slotIdx];
    const pieceShape = pieces[selectedPiece];
    if (pieceShape === targetShape) {
      const newPlaced = [...placed];
      newPlaced[slotIdx] = pieceShape;
      setPlaced(newPlaced);
      const newUsed = new Set(usedPieces);
      newUsed.add(selectedPiece);
      setUsedPieces(newUsed);
      setSelectedPiece(null);
      speak('Great!', 1.1);
      if (newPlaced.every(p => p !== null)) {
        setDone(true);
        const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
        setTimeout(() => {
          speak(stars === 3 ? 'Amazing!' : 'Well done!');
          onComplete(stars);
        }, 800);
      }
    } else {
      setMistakes(m => m + 1);
      speak('Try another shape!');
      setSelectedPiece(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{theme.emoji}</Text>
        <Text style={styles.instruction}>Match the shapes!</Text>
        <Text style={styles.sub}>Tap a shape below, then tap where it goes</Text>
      </View>
      <Text style={styles.sectionLabel}>TARGETS</Text>
      <View style={styles.slotsRow}>
        {level.targets.map((shape, idx) => (
          <TouchableOpacity
            key={`slot-${idx}`}
            testID={`shape-slot-${idx}`}
            onPress={() => handleTapSlot(idx)}
            activeOpacity={0.7}
            style={styles.slotContainer}
          >
            <ShapeView shape={shape} size={48} filled={placed[idx] !== null} selected={false} />
            {placed[idx] === null && <Text style={styles.slotLabel}>{shape}</Text>}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionLabel}>PIECES</Text>
      <View style={styles.piecesRow}>
        {pieces.map((shape, idx) => (
          <TouchableOpacity
            key={`piece-${idx}`}
            testID={`shape-piece-${idx}`}
            onPress={() => handleSelectPiece(idx)}
            disabled={usedPieces.has(idx)}
            activeOpacity={0.7}
            style={[styles.pieceContainer, selectedPiece === idx && styles.pieceSelected, usedPieces.has(idx) && styles.pieceUsed]}
          >
            <ShapeView shape={shape} size={44} filled={!usedPieces.has(idx)} selected={selectedPiece === idx} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.md },
  header: { alignItems: 'center', marginBottom: Spacing.md, paddingTop: Spacing.sm },
  emoji: { fontSize: 48, marginBottom: Spacing.xs },
  instruction: { ...Typography.h3, color: Colors.text.heading },
  sub: { ...Typography.bodyMd, color: Colors.text.muted, marginTop: 4 },
  sectionLabel: { ...Typography.label, color: Colors.text.muted, marginTop: Spacing.md, marginBottom: Spacing.sm, marginLeft: Spacing.sm },
  slotsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  slotContainer: { width: 72, height: 72, borderRadius: Radius.md, backgroundColor: Colors.background.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  slotLabel: { ...Typography.label, color: Colors.text.muted, fontSize: 10, marginTop: 2 },
  piecesRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, flexWrap: 'wrap', marginTop: Spacing.sm },
  pieceContainer: { width: 68, height: 68, borderRadius: Radius.md, backgroundColor: Colors.background.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  pieceSelected: { borderColor: Colors.action.primary, backgroundColor: Colors.action.primary + '15' },
  pieceUsed: { opacity: 0.3 },
});
