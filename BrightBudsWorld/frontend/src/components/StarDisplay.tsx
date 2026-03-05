import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/utils/theme';

type Props = { stars: number; size?: number };

export default function StarDisplay({ stars, size = 32 }: Props) {
  return (
    <View style={styles.row} testID="star-display">
      {[1, 2, 3].map(i => (
        <Text key={i} style={[styles.star, { fontSize: size }]}>
          {i <= stars ? '⭐' : '☆'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  star: { color: Colors.brand.sunYellow },
});
