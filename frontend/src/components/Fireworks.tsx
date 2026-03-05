import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Single firework particle
const FireworkParticle = ({ 
  startX, 
  startY, 
  color, 
  delay,
  angle,
  distance,
}: { 
  startX: number; 
  startY: number; 
  color: string; 
  delay: number;
  angle: number;
  distance: number;
}) => {
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(position, {
          toValue: { x: endX, y: endY },
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale },
          ],
        },
      ]}
    />
  );
};

// Single firework burst
const FireworkBurst = ({ 
  x, 
  y, 
  colors, 
  delay,
  particleCount = 12,
}: { 
  x: number; 
  y: number; 
  colors: string[]; 
  delay: number;
  particleCount?: number;
}) => {
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const color = colors[i % colors.length];
    const distance = 60 + Math.random() * 40;
    
    particles.push(
      <FireworkParticle
        key={i}
        startX={x}
        startY={y}
        color={color}
        delay={delay}
        angle={angle}
        distance={distance}
      />
    );
  }

  return <>{particles}</>;
};

// Sparkle effect
const Sparkle = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const x = Math.random() * SCREEN_WIDTH;
  const y = Math.random() * (SCREEN_HEIGHT * 0.6);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.5, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(Math.random() * 1000),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sparkle,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={styles.sparkleInner}>✨</View>
    </Animated.View>
  );
};

// Main Fireworks component
export default function Fireworks({ active }: { active: boolean }) {
  if (!active) return null;

  const fireworkColors = [
    ['#FF6B6B', '#FFE66D', '#4ECDC4'],
    ['#FF9F1C', '#FFD166', '#FF6B6B'],
    ['#A855F7', '#EC4899', '#F472B6'],
    ['#3B82F6', '#60A5FA', '#93C5FD'],
    ['#10B981', '#34D399', '#6EE7B7'],
  ];

  const bursts = [
    { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.2, delay: 0 },
    { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.15, delay: 300 },
    { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.1, delay: 600 },
    { x: SCREEN_WIDTH * 0.3, y: SCREEN_HEIGHT * 0.25, delay: 900 },
    { x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.3, delay: 1200 },
    { x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.18, delay: 1500 },
    { x: SCREEN_WIDTH * 0.2, y: SCREEN_HEIGHT * 0.12, delay: 1800 },
    { x: SCREEN_WIDTH * 0.8, y: SCREEN_HEIGHT * 0.22, delay: 2100 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Firework bursts */}
      {bursts.map((burst, i) => (
        <FireworkBurst
          key={`burst-${i}`}
          x={burst.x}
          y={burst.y}
          colors={fireworkColors[i % fireworkColors.length]}
          delay={burst.delay}
          particleCount={16}
        />
      ))}

      {/* Sparkles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Sparkle key={`sparkle-${i}`} delay={i * 200} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleInner: {
    fontSize: 20,
  },
});
