import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId, GameType } from '@/src/utils/theme';
import { GameProgress } from '@/src/storage/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Use a fixed width that works well across screen sizes
const MAP_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
const MAP_HEIGHT = 520; // Reduced to fit better in viewport
const NODE_SIZE = 50;
const PATH_WIDTH = 10;
const NODE_MARGIN = NODE_SIZE / 2 + 8; // Margin to keep nodes from edges

// Path coordinates for a winding Mario-style path (zigzag pattern)
// y values from 0.12 to 0.95 to leave room for castle at top and START at bottom
const PATH_NODES = [
  { x: 0.15, y: 0.94, level: 1 },
  { x: 0.50, y: 0.84, level: 2 },
  { x: 0.85, y: 0.74, level: 3 },
  { x: 0.65, y: 0.62, level: 4, hasReward: true, rewardType: 'coin' },
  { x: 0.30, y: 0.50, level: 5 },
  { x: 0.12, y: 0.36, level: 6 },
  { x: 0.40, y: 0.26, level: 7, hasReward: true, rewardType: 'star' },
  { x: 0.70, y: 0.18, level: 8 },
  { x: 0.85, y: 0.10, level: 9 },
  { x: 0.50, y: 0.03, level: 10, hasReward: true, rewardType: 'treasure' },
];

// Extra reward nodes between levels - rare collectibles on the path
// Positioned away from level nodes to be easily tappable
const BONUS_REWARDS = [
  { x: 0.32, y: 0.89, type: 'coin', requiredLevel: 2 },
  { x: 0.76, y: 0.68, type: 'gem', requiredLevel: 4 },
  { x: 0.18, y: 0.43, type: 'coin', requiredLevel: 6 },
  { x: 0.56, y: 0.22, type: 'gem', requiredLevel: 8 },
];

interface Props {
  worldId: WorldId;
  gameType: GameType;
  gameProgress: GameProgress | null;
  onLevelPress: (level: number) => void;
  onRewardPress?: (rewardType: string, index: number) => void;
}

// Animated Level Node Component
const AnimatedLevelNode = ({ 
  level, 
  unlocked, 
  current, 
  stars, 
  worldColor, 
  hasReward,
  rewardType,
  onPress 
}: { 
  level: number; 
  unlocked: boolean; 
  current: boolean;
  stars: number;
  worldColor: string;
  hasReward?: boolean;
  rewardType?: string;
  onPress: () => void;
}) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (current) {
      // Bouncing animation for current level
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else if (unlocked) {
      // Subtle pulse for unlocked levels
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [current, unlocked]);

  const getNodeStyle = () => {
    if (!unlocked) return styles.lockedNode;
    if (current) return [styles.currentNode, { borderColor: worldColor, backgroundColor: worldColor + '20' }];
    if (stars === 3) return [styles.completedNode, { borderColor: '#FFD700', backgroundColor: '#FFD700' + '30' }];
    if (stars > 0) return [styles.playedNode, { borderColor: worldColor }];
    return [styles.unlockedNode, { borderColor: worldColor + '60' }];
  };

  const scale = current ? bounceAnim : unlocked ? pulseAnim : new Animated.Value(1);

  return (
    <TouchableOpacity onPress={onPress} disabled={!unlocked} activeOpacity={0.7}>
      <Animated.View style={[styles.levelNodeContainer, { transform: [{ scale }] }]}>
        {/* Glow effect for current level */}
        {current && (
          <Animated.View 
            style={[
              styles.glowRing, 
              { 
                borderColor: worldColor,
                opacity: glowAnim,
              }
            ]} 
          />
        )}
        
        <View style={[styles.levelNode, getNodeStyle()]}>
          {unlocked ? (
            <>
              <Text style={styles.levelNumber}>{level}</Text>
              {stars > 0 && (
                <View style={styles.starsContainer}>
                  {[1, 2, 3].map((s) => (
                    <Text key={s} style={[styles.starIcon, s <= stars ? styles.starEarned : styles.starEmpty]}>
                      ★
                    </Text>
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={styles.lockIcon}>🔒</Text>
          )}
        </View>

        {/* Reward badge on special nodes */}
        {hasReward && unlocked && (
          <View style={[styles.rewardBadge, { backgroundColor: getRewardColor(rewardType) }]}>
            <Text style={styles.rewardBadgeEmoji}>{getRewardEmoji(rewardType)}</Text>
          </View>
        )}

        {/* Level flag for milestone levels */}
        {(level === 5 || level === 10) && (
          <View style={styles.flagContainer}>
            <Text style={styles.flagEmoji}>{level === 10 ? '🏆' : '🚩'}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Bonus Reward Component (rewards on the path)
const BonusReward = ({ type, collected, onPress }: { type: string; collected: boolean; onPress: () => void }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!collected) {
      // Floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -8, duration: 1000, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      // Sparkle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(sparkleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [collected]);

  if (collected) {
    return (
      <View style={styles.collectedReward}>
        <Text style={styles.collectedCheck}>✓</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View 
        style={[
          styles.bonusReward, 
          { 
            backgroundColor: getRewardColor(type),
            transform: [{ translateY: floatAnim }, { scale: sparkleAnim }] 
          }
        ]}
      >
        <Text style={styles.bonusRewardEmoji}>{getRewardEmoji(type)}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Helper functions
const getRewardEmoji = (type?: string) => {
  switch (type) {
    case 'coin': return '🪙';
    case 'gem': return '💎';
    case 'star': return '⭐';
    case 'treasure': return '👑';
    default: return '🎁';
  }
};

const getRewardColor = (type?: string) => {
  switch (type) {
    case 'coin': return '#FFD700';
    case 'gem': return '#E040FB';
    case 'star': return '#FF9F1C';
    case 'treasure': return '#FF6B6B';
    default: return '#4ECDC4';
  }
};

// Path segment drawing
const PathSegment = ({ from, to, worldColor, completed }: { from: { x: number; y: number }; to: { x: number; y: number }; worldColor: string; completed: boolean }) => {
  const x1 = from.x * MAP_WIDTH;
  const y1 = from.y * MAP_HEIGHT;
  const x2 = to.x * MAP_WIDTH;
  const y2 = to.y * MAP_HEIGHT;
  
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  return (
    <View
      style={[
        styles.pathSegment,
        {
          left: x1,
          top: y1 - PATH_WIDTH / 2,
          width: length,
          backgroundColor: completed ? worldColor : Colors.status.locked + '50',
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
};

export default function MarioPathMap({ worldId, gameType, gameProgress, onLevelPress, onRewardPress }: Props) {
  const theme = WorldThemes[worldId];
  const scrollRef = useRef<ScrollView>(null);
  const unlockedLevel = gameProgress?.unlockedLevel || 1;

  // Auto-scroll to current level on mount
  useEffect(() => {
    const currentNode = PATH_NODES.find(n => n.level === unlockedLevel);
    if (currentNode && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, currentNode.y * MAP_HEIGHT - 300),
          animated: true,
        });
      }, 500);
    }
  }, [unlockedLevel]);

  // Background decorations based on world
  const getWorldDecorations = () => {
    switch (worldId) {
      case 'world1':
        return ['🌿', '🌴', '🦕', '🌋', '🌸', '🦎', '🥚', '🌺'];
      case 'world2':
        return ['⭐', '🌙', '🪐', '🛸', '☄️', '🌟', '🌌', '✨'];
      case 'world3':
        return ['🌸', '🏠', '🌳', '🦋', '🌺', '🐦', '🌷', '☘️'];
      default:
        return ['🌿', '🌸', '⭐'];
    }
  };

  const decorations = getWorldDecorations();

  return (
    <ScrollView 
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.mapContent, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Map area */}
      <View style={styles.mapArea}>
        {/* Background decorations */}
        {decorations.map((emoji, i) => (
          <Text 
            key={i} 
            style={[
              styles.decoration,
              { 
                left: (10 + (i * 12)) % 85 + '%',
                top: (5 + (i * 11)) % 85 + '%',
                fontSize: 20 + (i % 3) * 6,
                opacity: 0.25,
              }
            ]}
          >
            {emoji}
          </Text>
        ))}

        {/* Path segments */}
        {PATH_NODES.slice(0, -1).map((node, i) => (
          <PathSegment
            key={`path-${i}`}
            from={node}
            to={PATH_NODES[i + 1]}
            worldColor={theme.color}
            completed={node.level < unlockedLevel}
          />
        ))}

        {/* Bonus rewards on path - rare collectibles */}
        {BONUS_REWARDS.map((reward, i) => {
          const available = unlockedLevel >= reward.requiredLevel;
          const collected = false; // You can track this in storage
          
          return (
            <View
              key={`bonus-${i}`}
              style={[
                styles.bonusRewardContainer,
                { left: reward.x * MAP_WIDTH - 18, top: reward.y * MAP_HEIGHT - 18 }
              ]}
            >
              {available && (
                <BonusReward 
                  type={reward.type} 
                  collected={collected}
                  onPress={() => onRewardPress?.(reward.type, i)}
                />
              )}
            </View>
          );
        })}

        {/* Level nodes */}
        {PATH_NODES.map((node) => (
          <View
            key={`level-${node.level}`}
            style={[
              styles.nodePosition,
              { left: node.x * MAP_WIDTH - NODE_SIZE / 2, top: node.y * MAP_HEIGHT - NODE_SIZE / 2 }
            ]}
          >
            <AnimatedLevelNode
              level={node.level}
              unlocked={node.level <= unlockedLevel}
              current={node.level === unlockedLevel}
              stars={gameProgress?.starsByLevel[node.level - 1] || 0}
              worldColor={theme.color}
              hasReward={node.hasReward}
              rewardType={node.rewardType}
              onPress={() => onLevelPress(node.level)}
            />
          </View>
        ))}

        {/* Start banner */}
        <View style={[styles.startBanner, { left: PATH_NODES[0].x * MAP_WIDTH - 30, top: PATH_NODES[0].y * MAP_HEIGHT + 35 }]}>
          <Text style={styles.startText}>START</Text>
          <Text style={styles.startArrow}>↑</Text>
        </View>

        {/* Finish castle/goal - positioned above level 10, but not overlapping */}
        <View style={[styles.finishArea, { left: PATH_NODES[9].x * MAP_WIDTH - 30, top: -70 }]}>
          <Text style={styles.finishEmoji}>🏰</Text>
          <Text style={styles.finishText}>GOAL!</Text>
        </View>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(unlockedLevel - 1) * 10}%`, backgroundColor: theme.color }]} />
        <Text style={styles.progressText}>{unlockedLevel - 1}/10 Levels Complete</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContent: {
    minHeight: MAP_HEIGHT + 100,
    paddingBottom: Spacing.xl,
    paddingTop: 80, // More space for castle at top
    alignItems: 'center',
  },
  worldHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  worldEmoji: {
    fontSize: 40,
  },
  worldName: {
    ...Typography.h3,
    marginTop: Spacing.xs,
  },
  mapArea: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    position: 'relative',
  },
  decoration: {
    position: 'absolute',
  },
  pathSegment: {
    position: 'absolute',
    height: PATH_WIDTH,
    borderRadius: PATH_WIDTH / 2,
    transformOrigin: 'left center',
  },
  nodePosition: {
    position: 'absolute',
  },
  levelNodeContainer: {
    width: NODE_SIZE,
    height: NODE_SIZE + 16,
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: NODE_SIZE + 16,
    height: NODE_SIZE + 16,
    borderRadius: (NODE_SIZE + 16) / 2,
    borderWidth: 3,
    top: -8,
    left: -8,
  },
  levelNode: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  lockedNode: {
    backgroundColor: Colors.status.locked + '30',
    borderColor: Colors.status.locked,
  },
  unlockedNode: {
    backgroundColor: Colors.background.card,
  },
  currentNode: {
    backgroundColor: Colors.background.card,
  },
  playedNode: {
    backgroundColor: Colors.background.card,
  },
  completedNode: {
    backgroundColor: Colors.background.card,
  },
  levelNumber: {
    ...Typography.h3,
    color: Colors.text.heading,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  starIcon: {
    fontSize: 10,
    marginHorizontal: 1,
  },
  starEarned: {
    color: '#FFD700',
  },
  starEmpty: {
    color: Colors.status.locked,
  },
  lockIcon: {
    fontSize: 24,
  },
  rewardBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rewardBadgeEmoji: {
    fontSize: 14,
  },
  flagContainer: {
    position: 'absolute',
    top: -20,
    right: -4,
  },
  flagEmoji: {
    fontSize: 20,
  },
  bonusRewardContainer: {
    position: 'absolute',
    width: 36,
    height: 36,
  },
  bonusReward: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bonusRewardEmoji: {
    fontSize: 18,
  },
  collectedReward: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.status.success + '40',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.status.success,
  },
  collectedCheck: {
    fontSize: 18,
    color: Colors.status.success,
  },
  startBanner: {
    position: 'absolute',
    alignItems: 'center',
  },
  startText: {
    ...Typography.label,
    color: Colors.status.success,
    backgroundColor: Colors.status.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    fontSize: 11,
  },
  startArrow: {
    fontSize: 16,
    color: Colors.status.success,
    marginTop: 2,
  },
  finishArea: {
    position: 'absolute',
    alignItems: 'center',
  },
  finishEmoji: {
    fontSize: 36,
  },
  finishText: {
    ...Typography.label,
    color: Colors.action.primary,
    marginTop: 2,
    fontSize: 11,
  },
  progressBar: {
    marginHorizontal: 16,
    marginTop: Spacing.lg,
    height: 24,
    backgroundColor: Colors.background.card,
    borderRadius: Radius.full,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radius.full,
  },
  progressText: {
    ...Typography.label,
    color: Colors.text.heading,
    textAlign: 'center',
    fontSize: 12,
  },
});
