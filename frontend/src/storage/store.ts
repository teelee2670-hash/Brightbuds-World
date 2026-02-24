import AsyncStorage from '@react-native-async-storage/async-storage';

export type AgeBand = '4-5' | '6-7';
export type GameType = 'phonics' | 'numbers' | 'shapes';
export type WorldId = 'world1' | 'world2' | 'world3';

export interface UserProfile {
  avatarId: string;
  nickname: string;
  ageBand: AgeBand;
  audioOn: boolean;
  onboarded: boolean;
}

export interface GameProgress {
  unlockedLevel: number;
  starsByLevel: number[];
}

export interface WorldProgress {
  phonics: GameProgress;
  numbers: GameProgress;
  shapes: GameProgress;
}

export interface Rewards {
  stickersEarned: string[];
  decorUnlocked: { wallpaperIds: string[]; rugIds: string[]; posterIds: string[] };
  decorSelected: { wallpaperId: string; rugId: string; posterId: string };
}

export interface DailyStats {
  dateKey: string;
  minutesPlayed: number;
  skillsPracticed: { sounds: string[]; numbersRange: string; shapes: string[] };
}

const KEYS = {
  profile: 'bb_profile',
  subscription: 'bb_sub',
  progress: 'bb_progress',
  rewards: 'bb_rewards',
  daily: 'bb_daily',
};

const defaultGameProgress = (): GameProgress => ({ unlockedLevel: 1, starsByLevel: [] });
const defaultWorldProgress = (): WorldProgress => ({
  phonics: defaultGameProgress(),
  numbers: defaultGameProgress(),
  shapes: defaultGameProgress(),
});

const defaultProfile: UserProfile = { avatarId: 'dino', nickname: '', ageBand: '4-5', audioOn: true, onboarded: false };

const defaultProgress = (): Record<WorldId, WorldProgress> => ({
  world1: defaultWorldProgress(),
  world2: defaultWorldProgress(),
  world3: defaultWorldProgress(),
});

const defaultRewards = (): Rewards => ({
  stickersEarned: [],
  decorUnlocked: { wallpaperIds: ['wall_default'], rugIds: ['rug_default'], posterIds: ['poster_default'] },
  decorSelected: { wallpaperId: 'wall_default', rugId: 'rug_default', posterId: 'poster_default' },
});

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

async function set<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const getProfile = () => get(KEYS.profile, defaultProfile);
export const setProfile = (p: UserProfile) => set(KEYS.profile, p);

export const getSubscription = () => get(KEYS.subscription, { isPremium: false, lastCheckedAt: '' });
export const setSubscription = (s: { isPremium: boolean; lastCheckedAt: string }) => set(KEYS.subscription, s);

export const getProgress = () => get(KEYS.progress, defaultProgress());
export const setProgress = (p: Record<WorldId, WorldProgress>) => set(KEYS.progress, p);

export const updateLevelProgress = async (worldId: WorldId, gameType: GameType, level: number, stars: number) => {
  const progress = await getProgress();
  if (!progress[worldId]) progress[worldId] = defaultWorldProgress();
  const game = progress[worldId][gameType];
  while (game.starsByLevel.length < level) game.starsByLevel.push(0);
  game.starsByLevel[level - 1] = Math.max(game.starsByLevel[level - 1] || 0, stars);
  if (level >= game.unlockedLevel) game.unlockedLevel = level + 1;
  await setProgress(progress);
  return progress;
};

export const getRewards = () => get(KEYS.rewards, defaultRewards());
export const setRewards = (r: Rewards) => set(KEYS.rewards, r);

export const addSticker = async (stickerId: string) => {
  const rewards = await getRewards();
  if (!rewards.stickersEarned.includes(stickerId)) {
    rewards.stickersEarned.push(stickerId);
    await setRewards(rewards);
  }
  return rewards;
};

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const getDailyStats = async (): Promise<DailyStats> => {
  const key = getTodayKey();
  const stats = await get<DailyStats | null>(`${KEYS.daily}_${key}`, null);
  return stats || { dateKey: key, minutesPlayed: 0, skillsPracticed: { sounds: [], numbersRange: '', shapes: [] } };
};

export const updateDailyStats = async (update: Partial<DailyStats['skillsPracticed']>) => {
  const stats = await getDailyStats();
  if (update.sounds) {
    stats.skillsPracticed.sounds = [...new Set([...stats.skillsPracticed.sounds, ...update.sounds])];
  }
  if (update.numbersRange) stats.skillsPracticed.numbersRange = update.numbersRange;
  if (update.shapes) {
    stats.skillsPracticed.shapes = [...new Set([...stats.skillsPracticed.shapes, ...update.shapes])];
  }
  await set(`${KEYS.daily}_${getTodayKey()}`, stats);
  return stats;
};

export const addPlaytime = async (minutes: number) => {
  const stats = await getDailyStats();
  stats.minutesPlayed += minutes;
  await set(`${KEYS.daily}_${getTodayKey()}`, stats);
};

export const resetAllProgress = async () => {
  await setProgress(defaultProgress());
  await setRewards(defaultRewards());
};
