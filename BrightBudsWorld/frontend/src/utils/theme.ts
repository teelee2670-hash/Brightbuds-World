export const Colors = {
  background: { primary: '#FFF9F0', secondary: '#F0F7F4', card: '#FFFFFF', overlay: 'rgba(74,85,104,0.5)' },
  brand: { dinoGreen: '#88C999', spaceBlue: '#8ECAE6', critterPink: '#FB6F92', sunYellow: '#FFB703' },
  action: { primary: '#FF9F1C', primaryText: '#FFFFFF', secondary: '#4FD1C5', disabled: '#CBD5E0' },
  text: { heading: '#2D3748', body: '#4A5568', muted: '#718096', inverse: '#FFFFFF' },
  status: { success: '#48BB78', error: '#F56565', locked: '#A0AEC0' },
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const Radius = { sm: 8, md: 16, lg: 24, xl: 32, full: 9999 };

export const Typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  bodyLg: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  bodyMd: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  label: { fontSize: 14, fontWeight: '700' as const, letterSpacing: 1.2 },
};

export type WorldId = 'world1' | 'world2' | 'world3';
export type GameType = 'phonics' | 'numbers' | 'shapes';

export const WorldThemes: Record<WorldId, { name: string; color: string; emoji: string; bg: string }> = {
  world1: { name: 'Dino Meadow', color: Colors.brand.dinoGreen, emoji: '🦕', bg: '#E8F5E9' },
  world2: { name: 'Space Station', color: Colors.brand.spaceBlue, emoji: '🚀', bg: '#E3F2FD' },
  world3: { name: 'Cuddle Critter City', color: Colors.brand.critterPink, emoji: '🐾', bg: '#FCE4EC' },
};

export const GameTypeInfo: Record<GameType, { name: string; emoji: string; color: string }> = {
  phonics: { name: 'Phonics', emoji: '🔤', color: '#FF9F1C' },
  numbers: { name: 'Numbers', emoji: '🔢', color: '#4FD1C5' },
  shapes: { name: 'Shapes', emoji: '🔷', color: '#FB6F92' },
};
