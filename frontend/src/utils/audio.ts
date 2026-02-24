import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let audioEnabled = true;
let soundObjects: Record<string, Audio.Sound> = {};

export const setAudioEnabled = (enabled: boolean) => { audioEnabled = enabled; };
export const isAudioEnabled = () => audioEnabled;

export const speak = (text: string, rate: number = 0.85) => {
  if (!audioEnabled) return;
  Speech.stop();
  Speech.speak(text, { rate, pitch: 1.15, language: 'en-US' });
};

export const stopSpeaking = () => { Speech.stop(); };

// ── Sound Effects via short TTS phrases ──
// These use expressive short words that sound like SFX when spoken quickly

export const sfx = {
  tap: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('pop', { rate: 1.8, pitch: 1.6, language: 'en-US' });
  },
  correct: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('ding!', { rate: 1.5, pitch: 1.5, language: 'en-US' });
  },
  wrong: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('oops', { rate: 1.2, pitch: 0.8, language: 'en-US' });
  },
  celebrate: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('woo hoo! amazing!', { rate: 1.0, pitch: 1.4, language: 'en-US' });
  },
  levelUp: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('level up!', { rate: 1.1, pitch: 1.3, language: 'en-US' });
  },
  starEarned: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('star!', { rate: 1.6, pitch: 1.6, language: 'en-US' });
  },
  stickerEarned: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('yay! new sticker!', { rate: 1.0, pitch: 1.3, language: 'en-US' });
  },
  countUp: (num: number) => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak(String(num), { rate: 1.3, pitch: 1.2, language: 'en-US' });
  },
  tryAgain: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak('try again!', { rate: 1.0, pitch: 1.1, language: 'en-US' });
  },
  welcome: () => {
    if (!audioEnabled) return;
    Speech.stop();
    Speech.speak("let's go!", { rate: 0.9, pitch: 1.2, language: 'en-US' });
  },
};
