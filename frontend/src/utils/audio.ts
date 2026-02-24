import * as Speech from 'expo-speech';

let audioEnabled = true;

export const setAudioEnabled = (enabled: boolean) => { audioEnabled = enabled; };
export const isAudioEnabled = () => audioEnabled;

export const speak = (text: string, rate: number = 0.85) => {
  if (!audioEnabled) return;
  Speech.stop();
  Speech.speak(text, { rate, pitch: 1.15, language: 'en-US' });
};

export const stopSpeaking = () => { Speech.stop(); };
