import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Typography, WorldThemes, WorldId, GameType } from '@/src/utils/theme';
import { GameProgress } from '@/src/storage/store';
import { getWorldPath, PathNode, BonusReward } from '@/src/data/worldPaths';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
const MAP_HEIGHT = 520;
const NODE_SIZE = 50;
const PATH_WIDTH = 10;
const CHARACTER_SIZE = 40;

interface Props {
  worldId: WorldId;
  gameType: GameType;
  gameProgress: GameProgress | null;
  selectedAvatar: string;  // User's selected avatar emoji
  onLevelPress: (level: number) => void;
  onRewardPress?: (rewardType: string, index: number) => void;
}

// Walking Character Component
const WalkingCharacter = ({ 
  avatar, 
  x, 
  y, 
  worldColor 
}: { 
  avatar: string; 
  x: number; 
  y: number; 
  worldColor: string;
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const walkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bouncing animation (walking effect)
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 300, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    // Slight side-to-side sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(walkAnim, { toValue: 3, duration: 400, useNativeDriver: true }),
        Animated.timing(walkAnim, { toValue: -3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.characterContainer,
        {
          left: x - CHARACTER_SIZE / 2,
          top: y - CHARACTER_SIZE - 10,  // Position above the level node
          transform: [
            { translateY: bounceAnim },
            { translateX: walkAnim },
          ],
        },
      ]}
    >
      <View style={[styles.characterBubble, { borderColor: worldColor }]}>
        <Text style={styles.characterEmoji}>{avatar}</Text>
      </View>
      {/* Speech bubble indicator */}
      <View style={[styles.speechPointer, { borderTopColor: worldColor }]} />
    </Animated.View>
  );
};

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
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else if (unlocked) {
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
        {current && (
          <Animated.View 
            style={[styles.glowRing, { borderColor: worldColor, opacity: glowAnim }]} 
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

        {hasReward && unlocked && (
          <View style={[styles.rewardBadge, { backgroundColor: getRewardColor(rewardType) }]}>
            <Text style={styles.rewardBadgeEmoji}>{getRewardEmoji(rewardType)}</Text>
          </View>
        )}

        {(level === 5 || level === 10) && (
          <View style={styles.flagContainer}>
            <Text style={styles.flagEmoji}>{level === 10 ? '🏆' : '🚩'}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Bonus Reward Component
const BonusRewardNode = ({ type, collected, onPress }: { type: string; collected: boolean; onPress: () => void }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!collected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -8, duration: 1000, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

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
const PathSegment = ({ from, to, worldColor, completed }: { from: PathNode; to: PathNode; worldColor: string; completed: boolean }) => {
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

export default function MarioPathMap({ 
  worldId, 
  gameType, 
  gameProgress, 
  selectedAvatar,
  onLevelPress, 
  onRewardPress 
}: Props) {
  const theme = WorldThemes[worldId];
  const pathConfig = getWorldPath(worldId);
  const scrollRef = useRef<ScrollView>(null);
  const unlockedLevel = gameProgress?.unlockedLevel || 1;

  // Get current level position for character
  const currentNode = pathConfig.pathNodes.find(n => n.level === unlockedLevel);
  const characterX = currentNode ? currentNode.x * MAP_WIDTH : 0;
  const characterY = currentNode ? currentNode.y * MAP_HEIGHT : 0;

  useEffect(() => {
    if (currentNode && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, currentNode.y * MAP_HEIGHT - 300),
          animated: true,
        });
      }, 500);
    }
  }, [unlockedLevel]);

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
        {pathConfig.decorations.map((emoji, i) => (
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
        {pathConfig.pathNodes.slice(0, -1).map((node, i) => (
          <PathSegment
            key={`path-${i}`}
            from={node}
            to={pathConfig.pathNodes[i + 1]}
            worldColor={theme.color}
            completed={node.level < unlockedLevel}
          />
        ))}

        {/* Bonus rewards on path */}
        {pathConfig.bonusRewards.map((reward, i) => {
          const available = unlockedLevel >= reward.requiredLevel;
          const collected = false;
          
          return (
            <View
              key={`bonus-${i}`}
              style={[
                styles.bonusRewardContainer,
                { left: reward.x * MAP_WIDTH - 18, top: reward.y * MAP_HEIGHT - 18 }
              ]}
            >
              {available && (
                <BonusRewardNode 
                  type={reward.type} 
                  collected={collected}
                  onPress={() => onRewardPress?.(reward.type, i)}
                />
              )}
            </View>
          );
        })}

        {/* Level nodes */}
        {pathConfig.pathNodes.map((node) => (
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

        {/* Walking character at current level */}
        <WalkingCharacter
          avatar={selectedAvatar || '🦕'}
          x={characterX}
          y={characterY}
          worldColor={theme.color}
        />

        {/* Start banner */}
        <View style={[styles.startBanner, { left: pathConfig.pathNodes[0].x * MAP_WIDTH - 30, top: pathConfig.pathNodes[0].y * MAP_HEIGHT + 35 }]}>
          <Text style={styles.startText}>START</Text>
          <Text style={styles.startArrow}>↑</Text>
        </View>

        {/* Finish castle/goal */}
        <View style={[styles.finishArea, { left: pathConfig.pathNodes[9].x * MAP_WIDTH - 30, top: -70 }]}>
          <Text style={styles.finishEmoji}>{pathConfig.castleEmoji}</Text>
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
    paddingTop: 80,
    alignItems: 'center',
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
    width: MAP_WIDTH,
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
  // Character styles
  characterContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 50,
  },
  characterBubble: {
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    borderRadius: CHARACTER_SIZE / 2,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  characterEmoji: {
    fontSize: 24,
  },
  speechPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
