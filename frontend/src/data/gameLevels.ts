import { WorldId } from '@/src/utils/theme';

type PItem = { word: string; emoji: string };
const PH: Record<string, PItem[]> = {
  m: [{ word: 'Mouse', emoji: '🐭' }, { word: 'Moon', emoji: '🌙' }, { word: 'Monkey', emoji: '🐵' }, { word: 'Mango', emoji: '🥭' }, { word: 'Milk', emoji: '🥛' }, { word: 'Mushroom', emoji: '🍄' }],
  s: [{ word: 'Sun', emoji: '☀️' }, { word: 'Star', emoji: '⭐' }, { word: 'Snake', emoji: '🐍' }, { word: 'Sock', emoji: '🧦' }, { word: 'Strawberry', emoji: '🍓' }, { word: 'Snail', emoji: '🐌' }],
  t: [{ word: 'Tree', emoji: '🌲' }, { word: 'Tiger', emoji: '🐯' }, { word: 'Turtle', emoji: '🐢' }, { word: 'Train', emoji: '🚂' }, { word: 'Tomato', emoji: '🍅' }, { word: 'Tent', emoji: '⛺' }],
  p: [{ word: 'Pig', emoji: '🐷' }, { word: 'Pizza', emoji: '🍕' }, { word: 'Penguin', emoji: '🐧' }, { word: 'Pear', emoji: '🍐' }, { word: 'Pencil', emoji: '✏️' }, { word: 'Panda', emoji: '🐼' }],
  b: [{ word: 'Bear', emoji: '🐻' }, { word: 'Ball', emoji: '⚽' }, { word: 'Bird', emoji: '🐦' }, { word: 'Banana', emoji: '🍌' }, { word: 'Boat', emoji: '⛵' }, { word: 'Book', emoji: '📖' }],
  f: [{ word: 'Fish', emoji: '🐟' }, { word: 'Flower', emoji: '🌸' }, { word: 'Frog', emoji: '🐸' }, { word: 'Fire', emoji: '🔥' }, { word: 'Fork', emoji: '🍴' }, { word: 'Fox', emoji: '🦊' }],
  n: [{ word: 'Nest', emoji: '🪹' }, { word: 'Nut', emoji: '🥜' }, { word: 'Nine', emoji: '9️⃣' }, { word: 'Nose', emoji: '👃' }, { word: 'Noodle', emoji: '🍜' }, { word: 'Note', emoji: '📝' }],
  l: [{ word: 'Lion', emoji: '🦁' }, { word: 'Leaf', emoji: '🍃' }, { word: 'Lamp', emoji: '💡' }, { word: 'Lemon', emoji: '🍋' }, { word: 'Ladybug', emoji: '🐞' }, { word: 'Lock', emoji: '🔒' }],
  d: [{ word: 'Dog', emoji: '🐶' }, { word: 'Duck', emoji: '🦆' }, { word: 'Drum', emoji: '🥁' }, { word: 'Door', emoji: '🚪' }, { word: 'Diamond', emoji: '💎' }, { word: 'Donut', emoji: '🍩' }],
  c: [{ word: 'Cat', emoji: '🐱' }, { word: 'Cake', emoji: '🎂' }, { word: 'Car', emoji: '🚗' }, { word: 'Corn', emoji: '🌽' }, { word: 'Cup', emoji: '☕' }, { word: 'Cloud', emoji: '☁️' }],
  r: [{ word: 'Rabbit', emoji: '🐰' }, { word: 'Rainbow', emoji: '🌈' }, { word: 'Robot', emoji: '🤖' }, { word: 'Ring', emoji: '💍' }, { word: 'Rocket', emoji: '🚀' }, { word: 'Rose', emoji: '🌹' }],
  g: [{ word: 'Goat', emoji: '🐐' }, { word: 'Grapes', emoji: '🍇' }, { word: 'Gift', emoji: '🎁' }, { word: 'Guitar', emoji: '🎸' }, { word: 'Globe', emoji: '🌍' }, { word: 'Ghost', emoji: '👻' }],
};

export type PhonicsItem = { word: string; emoji: string; isCorrect: boolean };
export type PhonicsLevel = { id: number; targetSound: string; items: PhonicsItem[] };

function mkPL(id: number, target: string, distractors: string[]): PhonicsLevel {
  const correct = PH[target].slice(0, 3).map(i => ({ ...i, isCorrect: true }));
  const wrong = distractors.flatMap(d => PH[d]?.slice(0, 1) || []).map(i => ({ ...i, isCorrect: false }));
  return { id, targetSound: target, items: [...correct, ...wrong].slice(0, 6) };
}

export const PHONICS_LEVELS: Record<WorldId, PhonicsLevel[]> = {
  world1: [
    mkPL(1, 'm', ['t', 's', 'f']), mkPL(2, 's', ['m', 'b', 'l']), mkPL(3, 't', ['p', 'f', 'n']),
    mkPL(4, 'p', ['m', 's', 'd']), mkPL(5, 'b', ['t', 'f', 'c']), mkPL(6, 'f', ['s', 'l', 'p']),
    mkPL(7, 'n', ['m', 't', 'b']), mkPL(8, 'l', ['s', 'f', 'd']), mkPL(9, 'd', ['b', 'p', 'm']),
    mkPL(10, 'c', ['t', 's', 'l']),
  ],
  world2: [
    mkPL(1, 'r', ['m', 'g', 'f']), mkPL(2, 'g', ['r', 's', 'l']), mkPL(3, 'm', ['t', 'p', 'n']),
    mkPL(4, 's', ['d', 'c', 'b']), mkPL(5, 't', ['r', 'g', 'f']), mkPL(6, 'p', ['m', 'n', 'l']),
    mkPL(7, 'b', ['s', 'd', 'r']), mkPL(8, 'f', ['g', 'c', 't']), mkPL(9, 'n', ['r', 'b', 'p']),
    mkPL(10, 'l', ['g', 'd', 'c']),
  ],
  world3: [
    mkPL(1, 'c', ['m', 's', 'f']), mkPL(2, 'd', ['t', 'b', 'l']), mkPL(3, 'f', ['p', 'n', 'r']),
    mkPL(4, 'g', ['m', 's', 'd']), mkPL(5, 'l', ['t', 'c', 'b']), mkPL(6, 'n', ['f', 'r', 'p']),
    mkPL(7, 'r', ['g', 'm', 's']), mkPL(8, 'b', ['d', 'l', 't']), mkPL(9, 'p', ['c', 'n', 'f']),
    mkPL(10, 'm', ['r', 'g', 'd']),
  ],
};

export type NumbersLevel = { id: number; targetNumber: number };
export const NUMBERS_LEVELS: Record<WorldId, NumbersLevel[]> = {
  world1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => ({ id: i + 1, targetNumber: n })),
  world2: [3, 5, 7, 9, 11, 13, 15, 12, 14, 16].map((n, i) => ({ id: i + 1, targetNumber: n })),
  world3: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((n, i) => ({ id: i + 1, targetNumber: n })),
};

export const NUMBER_THEMES: Record<WorldId, { character: string; item: string; itemName: string; action: string }> = {
  world1: { character: '🦕', item: '🫐', itemName: 'berries', action: 'Feed' },
  world2: { character: '🚀', item: '⚡', itemName: 'fuel cells', action: 'Load' },
  world3: { character: '🐶', item: '🦴', itemName: 'treats', action: 'Give' },
};

export type ShapeType = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star';
export type ShapesLevel = { id: number; targets: ShapeType[]; extras: ShapeType[] };

export const SHAPES_LEVELS: Record<WorldId, ShapesLevel[]> = {
  world1: [
    { id: 1, targets: ['circle', 'square'], extras: ['triangle'] },
    { id: 2, targets: ['triangle', 'circle'], extras: ['square'] },
    { id: 3, targets: ['square', 'triangle', 'circle'], extras: ['rectangle'] },
    { id: 4, targets: ['rectangle', 'circle'], extras: ['star', 'triangle'] },
    { id: 5, targets: ['star', 'square', 'triangle'], extras: ['circle'] },
    { id: 6, targets: ['circle', 'rectangle', 'star'], extras: ['square', 'triangle'] },
    { id: 7, targets: ['triangle', 'square', 'star'], extras: ['circle', 'rectangle'] },
    { id: 8, targets: ['circle', 'square', 'triangle', 'star'], extras: ['rectangle'] },
    { id: 9, targets: ['rectangle', 'star', 'circle', 'triangle'], extras: ['square'] },
    { id: 10, targets: ['circle', 'square', 'triangle', 'rectangle', 'star'], extras: [] },
  ],
  world2: [
    { id: 1, targets: ['square', 'triangle'], extras: ['circle'] },
    { id: 2, targets: ['circle', 'rectangle'], extras: ['star'] },
    { id: 3, targets: ['star', 'circle', 'square'], extras: ['triangle'] },
    { id: 4, targets: ['triangle', 'rectangle'], extras: ['circle', 'star'] },
    { id: 5, targets: ['circle', 'star', 'square'], extras: ['rectangle'] },
    { id: 6, targets: ['rectangle', 'triangle', 'star'], extras: ['circle', 'square'] },
    { id: 7, targets: ['square', 'circle', 'star'], extras: ['triangle', 'rectangle'] },
    { id: 8, targets: ['triangle', 'rectangle', 'circle', 'star'], extras: ['square'] },
    { id: 9, targets: ['star', 'square', 'rectangle', 'circle'], extras: ['triangle'] },
    { id: 10, targets: ['circle', 'square', 'triangle', 'rectangle', 'star'], extras: [] },
  ],
  world3: [
    { id: 1, targets: ['circle', 'star'], extras: ['square'] },
    { id: 2, targets: ['triangle', 'square'], extras: ['circle'] },
    { id: 3, targets: ['rectangle', 'circle', 'star'], extras: ['triangle'] },
    { id: 4, targets: ['square', 'star'], extras: ['circle', 'rectangle'] },
    { id: 5, targets: ['triangle', 'rectangle', 'circle'], extras: ['star'] },
    { id: 6, targets: ['star', 'square', 'triangle'], extras: ['circle', 'rectangle'] },
    { id: 7, targets: ['circle', 'rectangle', 'triangle'], extras: ['star', 'square'] },
    { id: 8, targets: ['star', 'circle', 'square', 'triangle'], extras: ['rectangle'] },
    { id: 9, targets: ['rectangle', 'triangle', 'star', 'square'], extras: ['circle'] },
    { id: 10, targets: ['circle', 'square', 'triangle', 'rectangle', 'star'], extras: [] },
  ],
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
