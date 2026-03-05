import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

let audioEnabled = true;
let audioCancelled = false;

// Player pool: reuse players to avoid creating/destroying constantly
let playerCache: Map<string, AudioPlayer> = new Map();

export const setAudioEnabled = (enabled: boolean) => { audioEnabled = enabled; };
export const isAudioEnabled = () => audioEnabled;

// All audio files mapped by key
const audioFiles: Record<string, any> = {
  // ── SFX ──
  tap: require('@/assets/audio/sfx/tap.mp3'),
  correct: require('@/assets/audio/sfx/correct.mp3'),
  wrong: require('@/assets/audio/sfx/wrong.mp3'),
  celebrate: require('@/assets/audio/sfx/celebrate.mp3'),
  level_up: require('@/assets/audio/sfx/level_up.mp3'),
  star_earned: require('@/assets/audio/sfx/star_earned.mp3'),
  sticker_earned: require('@/assets/audio/sfx/sticker_earned.mp3'),
  try_again: require('@/assets/audio/sfx/try_again.mp3'),
  welcome: require('@/assets/audio/sfx/welcome.mp3'),
  great_job: require('@/assets/audio/sfx/great_job.mp3'),
  awesome: require('@/assets/audio/sfx/awesome.mp3'),

  // ── Numbers 1-20 ──
  '1': require('@/assets/audio/voice/numbers/1.mp3'),
  '2': require('@/assets/audio/voice/numbers/2.mp3'),
  '3': require('@/assets/audio/voice/numbers/3.mp3'),
  '4': require('@/assets/audio/voice/numbers/4.mp3'),
  '5': require('@/assets/audio/voice/numbers/5.mp3'),
  '6': require('@/assets/audio/voice/numbers/6.mp3'),
  '7': require('@/assets/audio/voice/numbers/7.mp3'),
  '8': require('@/assets/audio/voice/numbers/8.mp3'),
  '9': require('@/assets/audio/voice/numbers/9.mp3'),
  '10': require('@/assets/audio/voice/numbers/10.mp3'),
  '11': require('@/assets/audio/voice/numbers/11.mp3'),
  '12': require('@/assets/audio/voice/numbers/12.mp3'),
  '13': require('@/assets/audio/voice/numbers/13.mp3'),
  '14': require('@/assets/audio/voice/numbers/14.mp3'),
  '15': require('@/assets/audio/voice/numbers/15.mp3'),
  '16': require('@/assets/audio/voice/numbers/16.mp3'),
  '17': require('@/assets/audio/voice/numbers/17.mp3'),
  '18': require('@/assets/audio/voice/numbers/18.mp3'),
  '19': require('@/assets/audio/voice/numbers/19.mp3'),
  '20': require('@/assets/audio/voice/numbers/20.mp3'),

  // ── Voice prompts ──
  phonics_a: require('@/assets/audio/voice/phonics_a.mp3'),
  phonics_b: require('@/assets/audio/voice/phonics_b.mp3'),
  phonics_c: require('@/assets/audio/voice/phonics_c.mp3'),
  phonics_d: require('@/assets/audio/voice/phonics_d.mp3'),
  phonics_f: require('@/assets/audio/voice/phonics_f.mp3'),
  phonics_g: require('@/assets/audio/voice/phonics_g.mp3'),
  phonics_h: require('@/assets/audio/voice/phonics_h.mp3'),
  phonics_k: require('@/assets/audio/voice/phonics_k.mp3'),
  phonics_l: require('@/assets/audio/voice/phonics_l.mp3'),
  phonics_m: require('@/assets/audio/voice/phonics_m.mp3'),
  phonics_n: require('@/assets/audio/voice/phonics_n.mp3'),
  phonics_p: require('@/assets/audio/voice/phonics_p.mp3'),
  phonics_r: require('@/assets/audio/voice/phonics_r.mp3'),
  phonics_s: require('@/assets/audio/voice/phonics_s.mp3'),
  phonics_t: require('@/assets/audio/voice/phonics_t.mp3'),
  phonics_w: require('@/assets/audio/voice/phonics_w.mp3'),
  count_dino: require('@/assets/audio/voice/count_dino.mp3'),
  count_space: require('@/assets/audio/voice/count_space.mp3'),
  count_animals: require('@/assets/audio/voice/count_animals.mp3'),
  shapes_match: require('@/assets/audio/voice/shapes_match.mp3'),
  good_start: require('@/assets/audio/voice/good_start.mp3'),
  keep_going: require('@/assets/audio/voice/keep_going.mp3'),
  almost_there: require('@/assets/audio/voice/almost_there.mp3'),
  you_did_it: require('@/assets/audio/voice/you_did_it.mp3'),
  super_star: require('@/assets/audio/voice/super_star.mp3'),
  three_stars: require('@/assets/audio/voice/three_stars.mp3'),
  two_stars: require('@/assets/audio/voice/two_stars.mp3'),
  one_star: require('@/assets/audio/voice/one_star.mp3'),
  welcome_brightbuds: require('@/assets/audio/voice/welcome_brightbuds.mp3'),
  choose_avatar: require('@/assets/audio/voice/choose_avatar.mp3'),
  whats_your_name: require('@/assets/audio/voice/whats_your_name.mp3'),
  how_old: require('@/assets/audio/voice/how_old.mp3'),
  lets_play: require('@/assets/audio/voice/lets_play.mp3'),
  dino_world: require('@/assets/audio/voice/dino_world.mp3'),
  space_world: require('@/assets/audio/voice/space_world.mp3'),
  animal_world: require('@/assets/audio/voice/animal_world.mp3'),

  // ── Words: Original set ──
  apple: require('@/assets/audio/voice/words/apple.mp3'),
  ant: require('@/assets/audio/voice/words/ant.mp3'),
  alligator: require('@/assets/audio/voice/words/alligator.mp3'),
  ball: require('@/assets/audio/voice/words/ball.mp3'),
  bear: require('@/assets/audio/voice/words/bear.mp3'),
  butterfly: require('@/assets/audio/voice/words/butterfly.mp3'),
  cat: require('@/assets/audio/voice/words/cat.mp3'),
  car: require('@/assets/audio/voice/words/car.mp3'),
  cake: require('@/assets/audio/voice/words/cake.mp3'),
  dog: require('@/assets/audio/voice/words/dog.mp3'),
  duck: require('@/assets/audio/voice/words/duck.mp3'),
  dinosaur: require('@/assets/audio/voice/words/dinosaur.mp3'),
  elephant: require('@/assets/audio/voice/words/elephant.mp3'),
  egg: require('@/assets/audio/voice/words/egg.mp3'),
  fish: require('@/assets/audio/voice/words/fish.mp3'),
  flower: require('@/assets/audio/voice/words/flower.mp3'),
  frog: require('@/assets/audio/voice/words/frog.mp3'),
  giraffe: require('@/assets/audio/voice/words/giraffe.mp3'),
  grapes: require('@/assets/audio/voice/words/grapes.mp3'),
  hat: require('@/assets/audio/voice/words/hat.mp3'),
  house: require('@/assets/audio/voice/words/house.mp3'),
  horse: require('@/assets/audio/voice/words/horse.mp3'),
  ice_cream: require('@/assets/audio/voice/words/ice_cream.mp3'),
  igloo: require('@/assets/audio/voice/words/igloo.mp3'),
  jellyfish: require('@/assets/audio/voice/words/jellyfish.mp3'),
  kite: require('@/assets/audio/voice/words/kite.mp3'),
  koala: require('@/assets/audio/voice/words/koala.mp3'),
  lion: require('@/assets/audio/voice/words/lion.mp3'),
  leaf: require('@/assets/audio/voice/words/leaf.mp3'),
  moon: require('@/assets/audio/voice/words/moon.mp3'),
  monkey: require('@/assets/audio/voice/words/monkey.mp3'),
  nest: require('@/assets/audio/voice/words/nest.mp3'),
  orange: require('@/assets/audio/voice/words/orange.mp3'),
  owl: require('@/assets/audio/voice/words/owl.mp3'),
  pig: require('@/assets/audio/voice/words/pig.mp3'),
  panda: require('@/assets/audio/voice/words/panda.mp3'),
  queen: require('@/assets/audio/voice/words/queen.mp3'),
  rabbit: require('@/assets/audio/voice/words/rabbit.mp3'),
  rainbow: require('@/assets/audio/voice/words/rainbow.mp3'),
  rocket: require('@/assets/audio/voice/words/rocket.mp3'),
  sun: require('@/assets/audio/voice/words/sun.mp3'),
  star: require('@/assets/audio/voice/words/star.mp3'),
  snake: require('@/assets/audio/voice/words/snake.mp3'),
  tree: require('@/assets/audio/voice/words/tree.mp3'),
  tiger: require('@/assets/audio/voice/words/tiger.mp3'),
  turtle: require('@/assets/audio/voice/words/turtle.mp3'),
  umbrella: require('@/assets/audio/voice/words/umbrella.mp3'),
  violin: require('@/assets/audio/voice/words/violin.mp3'),
  watermelon: require('@/assets/audio/voice/words/watermelon.mp3'),
  whale: require('@/assets/audio/voice/words/whale.mp3'),
  xylophone: require('@/assets/audio/voice/words/xylophone.mp3'),
  yak: require('@/assets/audio/voice/words/yak.mp3'),
  zebra: require('@/assets/audio/voice/words/zebra.mp3'),
  zero: require('@/assets/audio/voice/words/zero.mp3'),

  // ── Words: Avatar names ──
  dino: require('@/assets/audio/voice/words/dino.mp3'),
  astronaut: require('@/assets/audio/voice/words/astronaut.mp3'),
  puppy: require('@/assets/audio/voice/words/puppy.mp3'),
  kitten: require('@/assets/audio/voice/words/kitten.mp3'),
  unicorn: require('@/assets/audio/voice/words/unicorn.mp3'),
  bunny: require('@/assets/audio/voice/words/bunny.mp3'),

  // ── Words: Missing game level words ──
  banana: require('@/assets/audio/voice/words/banana.mp3'),
  bird: require('@/assets/audio/voice/words/bird.mp3'),
  boat: require('@/assets/audio/voice/words/boat.mp3'),
  book: require('@/assets/audio/voice/words/book.mp3'),
  cloud: require('@/assets/audio/voice/words/cloud.mp3'),
  corn: require('@/assets/audio/voice/words/corn.mp3'),
  cup: require('@/assets/audio/voice/words/cup.mp3'),
  diamond: require('@/assets/audio/voice/words/diamond.mp3'),
  donut: require('@/assets/audio/voice/words/donut.mp3'),
  door: require('@/assets/audio/voice/words/door.mp3'),
  drum: require('@/assets/audio/voice/words/drum.mp3'),
  fire: require('@/assets/audio/voice/words/fire.mp3'),
  fork: require('@/assets/audio/voice/words/fork.mp3'),
  fox: require('@/assets/audio/voice/words/fox.mp3'),
  ghost: require('@/assets/audio/voice/words/ghost.mp3'),
  gift: require('@/assets/audio/voice/words/gift.mp3'),
  globe: require('@/assets/audio/voice/words/globe.mp3'),
  goat: require('@/assets/audio/voice/words/goat.mp3'),
  guitar: require('@/assets/audio/voice/words/guitar.mp3'),
  ladybug: require('@/assets/audio/voice/words/ladybug.mp3'),
  lamp: require('@/assets/audio/voice/words/lamp.mp3'),
  lemon: require('@/assets/audio/voice/words/lemon.mp3'),
  lock: require('@/assets/audio/voice/words/lock.mp3'),
  mango: require('@/assets/audio/voice/words/mango.mp3'),
  milk: require('@/assets/audio/voice/words/milk.mp3'),
  mouse: require('@/assets/audio/voice/words/mouse.mp3'),
  mushroom: require('@/assets/audio/voice/words/mushroom.mp3'),
  nine: require('@/assets/audio/voice/words/nine.mp3'),
  noodle: require('@/assets/audio/voice/words/noodle.mp3'),
  nose: require('@/assets/audio/voice/words/nose.mp3'),
  note: require('@/assets/audio/voice/words/note.mp3'),
  nut: require('@/assets/audio/voice/words/nut.mp3'),
  pear: require('@/assets/audio/voice/words/pear.mp3'),
  pencil: require('@/assets/audio/voice/words/pencil.mp3'),
  penguin: require('@/assets/audio/voice/words/penguin.mp3'),
  pizza: require('@/assets/audio/voice/words/pizza.mp3'),
  ring: require('@/assets/audio/voice/words/ring.mp3'),
  robot: require('@/assets/audio/voice/words/robot.mp3'),
  rose: require('@/assets/audio/voice/words/rose.mp3'),
  snail: require('@/assets/audio/voice/words/snail.mp3'),
  sock: require('@/assets/audio/voice/words/sock.mp3'),
  strawberry: require('@/assets/audio/voice/words/strawberry.mp3'),
  tent: require('@/assets/audio/voice/words/tent.mp3'),
  tomato: require('@/assets/audio/voice/words/tomato.mp3'),
  train: require('@/assets/audio/voice/words/train.mp3'),
};

// Get or create a player for a given audio key
function getOrCreatePlayer(key: string): AudioPlayer {
  let player = playerCache.get(key);
  if (!player) {
    player = createAudioPlayer(audioFiles[key]);
    playerCache.set(key, player);
  }
  return player;
}

// Play audio from pre-generated MP3 files
function playSound(key: string): void {
  if (!audioEnabled) return;

  try {
    const audioFile = audioFiles[key];
    if (!audioFile) {
      console.warn(`Audio file not found: ${key}`);
      return;
    }

    const player = getOrCreatePlayer(key);
    player.seekTo(0);
    player.play();
  } catch (error) {
    console.warn(`Error playing sound ${key}:`, error);
  }
}

// Play audio and return a Promise that resolves when it finishes
export function playSoundAsync(key: string): Promise<void> {
  return new Promise((resolve) => {
    if (!audioEnabled || audioCancelled) { resolve(); return; }

    const audioFile = audioFiles[key];
    if (!audioFile) {
      console.warn(`Audio file not found: ${key}`);
      resolve();
      return;
    }

    try {
      const player = getOrCreatePlayer(key);
      player.seekTo(0);
      player.play();

      let started = false;
      const checkInterval = setInterval(() => {
        try {
          if (audioCancelled) {
            clearInterval(checkInterval);
            resolve();
            return;
          }
          if (player.playing) {
            started = true;
          } else if (started) {
            clearInterval(checkInterval);
            resolve();
          }
        } catch (_) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Safety timeout: resolve after 6s max so we never hang
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 6000);
    } catch (error) {
      console.warn(`Error playing sound ${key}:`, error);
      resolve();
    }
  });
}

// Play a sequence of sounds one after another, with an optional gap (ms) between each
export async function playSequence(keys: string[], gapMs: number = 300): Promise<void> {
  audioCancelled = false;
  for (let i = 0; i < keys.length; i++) {
    if (audioCancelled) return;
    await playSoundAsync(keys[i]);
    if (audioCancelled) return;
    if (i < keys.length - 1 && gapMs > 0) {
      await new Promise(r => setTimeout(r, gapMs));
    }
  }
}

// Stop all currently playing sounds and cancel any running sequence
export async function stopSpeaking(): Promise<void> {
  audioCancelled = true;
  for (const [_key, player] of playerCache.entries()) {
    try {
      player.pause();
    } catch (e) {
      // ignore
    }
  }
}

// Speak a word - uses pre-generated audio if available
export function speak(text: string, rate?: number): void {
  if (!audioEnabled) return;

  const key = text.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  if (audioFiles[key]) {
    playSound(key);
    return;
  }

  const phonicsMatch = text.match(/start with the (\w) sound/i);
  if (phonicsMatch) {
    const letter = phonicsMatch[1].toLowerCase();
    const phonicsKey = `phonics_${letter}`;
    if (audioFiles[phonicsKey]) {
      playSound(phonicsKey);
      return;
    }
  }

  const numMatch = text.match(/^(\d+)$/);
  if (numMatch && audioFiles[numMatch[1]]) {
    playSound(numMatch[1]);
    return;
  }

  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (audioFiles[cleanWord]) {
      playSound(cleanWord);
      return;
    }
  }

  console.log(`No pre-generated audio for: "${text}" - consider adding to generate_all_audio.py`);
}

// ── Sound Effects ──
export const sfx = {
  tap: () => playSound('tap'),
  correct: () => playSound('correct'),
  wrong: () => playSound('wrong'),
  celebrate: () => playSound('celebrate'),
  levelUp: () => playSound('level_up'),
  starEarned: () => playSound('star_earned'),
  stickerEarned: () => playSound('sticker_earned'),
  tryAgain: () => playSound('try_again'),
  welcome: () => playSound('welcome'),
  greatJob: () => playSound('great_job'),
  awesome: () => playSound('awesome'),
  countUp: (num: number) => {
    if (num >= 1 && num <= 20) {
      playSound(String(num));
    }
  },
};

// ── Voice prompts ──
export const voice = {
  phonics: (letter: string) => playSound(`phonics_${letter.toLowerCase()}`),
  countDino: () => playSound('count_dino'),
  countSpace: () => playSound('count_space'),
  countAnimals: () => playSound('count_animals'),
  shapesMatch: () => playSound('shapes_match'),
  goodStart: () => playSound('good_start'),
  keepGoing: () => playSound('keep_going'),
  almostThere: () => playSound('almost_there'),
  youDidIt: () => playSound('you_did_it'),
  superStar: () => playSound('super_star'),
  threeStars: () => playSound('three_stars'),
  twoStars: () => playSound('two_stars'),
  oneStar: () => playSound('one_star'),
  welcomeBrightbuds: () => playSound('welcome_brightbuds'),
  chooseAvatar: () => playSound('choose_avatar'),
  whatsYourName: () => playSound('whats_your_name'),
  howOld: () => playSound('how_old'),
  letsPlay: () => playSound('lets_play'),
  dinoWorld: () => playSound('dino_world'),
  spaceWorld: () => playSound('space_world'),
  animalWorld: () => playSound('animal_world'),
};

// Preload critical sounds for instant playback
export async function preloadSounds(): Promise<void> {
  const criticalSounds = ['tap', 'correct', 'wrong', 'celebrate', 'try_again', 'welcome'];

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
    interruptionMode: 'duckOthers',
  });

  for (const key of criticalSounds) {
    try {
      getOrCreatePlayer(key);
    } catch (e) {
      console.warn(`Failed to preload ${key}:`, e);
    }
  }
}

// Cleanup sounds when no longer needed
export async function unloadSounds(): Promise<void> {
  for (const [_key, player] of playerCache.entries()) {
    try {
      player.release();
    } catch (e) {
      // ignore
    }
  }
  playerCache.clear();
}