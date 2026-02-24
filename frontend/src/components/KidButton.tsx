import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Radius, Typography } from '@/src/utils/theme';

type Props = {
  title: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  emoji?: string;
  testID?: string;
  size?: 'normal' | 'large';
};

export default function KidButton({ title, onPress, color, textColor, disabled, emoji, testID, size = 'normal' }: Props) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const bg = disabled ? Colors.action.disabled : (color || Colors.action.primary);
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.btn, { backgroundColor: bg }, size === 'large' && styles.large]}
      >
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={[styles.text, { color: textColor || Colors.action.primaryText }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 60, borderRadius: Radius.full, paddingHorizontal: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  large: { height: 72, paddingHorizontal: 36 },
  text: { ...Typography.bodyLg, textAlign: 'center' },
  emoji: { fontSize: 24, marginRight: 8 },
});
