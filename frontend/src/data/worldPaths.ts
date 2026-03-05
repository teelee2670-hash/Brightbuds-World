// World Path Configurations
// Each world has its own unique path layout
// To add a new world, simply add a new entry with path nodes and bonus rewards

export interface PathNode {
  x: number;  // X position (0-1 percentage of map width)
  y: number;  // Y position (0-1 percentage of map height)
  level: number;
  hasReward?: boolean;
  rewardType?: 'coin' | 'gem' | 'star' | 'treasure';
}

export interface BonusReward {
  x: number;
  y: number;
  type: 'coin' | 'gem' | 'star' | 'treasure';
  requiredLevel: number;
}

export interface WorldPathConfig {
  id: string;
  name: string;
  pathNodes: PathNode[];
  bonusRewards: BonusReward[];
  decorations: string[];  // Emoji decorations for the world
  castleEmoji: string;    // Emoji for the goal/castle
}

// ============================================
// WORLD 1: Dino Meadow - Winding S-curve path
// ============================================
const DINO_MEADOW_PATH: WorldPathConfig = {
  id: 'world1',
  name: 'Dino Meadow',
  castleEmoji: '🏰',
  decorations: ['🌿', '🌴', '🦕', '🌋', '🌸', '🦎', '🥚', '🌺'],
  pathNodes: [
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
  ],
  bonusRewards: [
    { x: 0.32, y: 0.89, type: 'coin', requiredLevel: 2 },
    { x: 0.76, y: 0.68, type: 'gem', requiredLevel: 4 },
    { x: 0.18, y: 0.43, type: 'coin', requiredLevel: 6 },
    { x: 0.56, y: 0.22, type: 'gem', requiredLevel: 8 },
  ],
};

// ============================================
// WORLD 2: Space Station - Spiral upward path
// ============================================
const SPACE_STATION_PATH: WorldPathConfig = {
  id: 'world2',
  name: 'Space Station',
  castleEmoji: '🛸',
  decorations: ['⭐', '🌙', '🪐', '🛸', '☄️', '🌟', '🌌', '✨', '🚀'],
  pathNodes: [
    { x: 0.50, y: 0.94, level: 1 },
    { x: 0.20, y: 0.84, level: 2 },
    { x: 0.15, y: 0.72, level: 3 },
    { x: 0.35, y: 0.60, level: 4, hasReward: true, rewardType: 'star' },
    { x: 0.65, y: 0.52, level: 5 },
    { x: 0.85, y: 0.42, level: 6 },
    { x: 0.70, y: 0.30, level: 7, hasReward: true, rewardType: 'gem' },
    { x: 0.40, y: 0.22, level: 8 },
    { x: 0.25, y: 0.12, level: 9 },
    { x: 0.50, y: 0.03, level: 10, hasReward: true, rewardType: 'treasure' },
  ],
  bonusRewards: [
    { x: 0.35, y: 0.89, type: 'star', requiredLevel: 2 },
    { x: 0.22, y: 0.66, type: 'gem', requiredLevel: 4 },
    { x: 0.78, y: 0.36, type: 'star', requiredLevel: 6 },
    { x: 0.32, y: 0.17, type: 'gem', requiredLevel: 8 },
  ],
};

// ============================================
// WORLD 3: Cuddle Critter City - Zigzag path
// ============================================
const CUDDLE_CITY_PATH: WorldPathConfig = {
  id: 'world3',
  name: 'Cuddle Critter City',
  castleEmoji: '🏠',
  decorations: ['🌸', '🏠', '🌳', '🦋', '🌺', '🐦', '🌷', '☘️', '🍃'],
  pathNodes: [
    { x: 0.85, y: 0.94, level: 1 },
    { x: 0.50, y: 0.86, level: 2 },
    { x: 0.15, y: 0.76, level: 3 },
    { x: 0.30, y: 0.64, level: 4, hasReward: true, rewardType: 'coin' },
    { x: 0.60, y: 0.54, level: 5 },
    { x: 0.85, y: 0.44, level: 6 },
    { x: 0.65, y: 0.32, level: 7, hasReward: true, rewardType: 'star' },
    { x: 0.35, y: 0.22, level: 8 },
    { x: 0.15, y: 0.12, level: 9 },
    { x: 0.50, y: 0.03, level: 10, hasReward: true, rewardType: 'treasure' },
  ],
  bonusRewards: [
    { x: 0.68, y: 0.90, type: 'coin', requiredLevel: 2 },
    { x: 0.20, y: 0.70, type: 'gem', requiredLevel: 4 },
    { x: 0.75, y: 0.38, type: 'coin', requiredLevel: 6 },
    { x: 0.25, y: 0.17, type: 'gem', requiredLevel: 8 },
  ],
};

// ============================================
// PATH REGISTRY - Add new worlds here
// ============================================
export const WORLD_PATHS: Record<string, WorldPathConfig> = {
  world1: DINO_MEADOW_PATH,
  world2: SPACE_STATION_PATH,
  world3: CUDDLE_CITY_PATH,
};

// Helper function to get path config for a world
export const getWorldPath = (worldId: string): WorldPathConfig => {
  return WORLD_PATHS[worldId] || DINO_MEADOW_PATH;
};

// ============================================
// HOW TO ADD A NEW WORLD:
// ============================================
// 1. Create a new WorldPathConfig object with:
//    - id: unique world identifier (e.g., 'world4')
//    - name: display name for the world
//    - castleEmoji: emoji for the goal at the end
//    - decorations: array of emojis to scatter on the map
//    - pathNodes: array of 10 level positions
//    - bonusRewards: array of collectible rewards on the path
//
// 2. Add the config to WORLD_PATHS registry:
//    world4: YOUR_NEW_WORLD_PATH,
//
// 3. Don't forget to add the world to WorldThemes in theme.ts!
// ============================================
