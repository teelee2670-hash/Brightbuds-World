# BrightBuds World - Product Requirements Document

## Overview
BrightBuds World is a mobile-first kids learning game app (ages 4+) with Dinosaurs, Space, and Cute Animals themes. Built with React Native/Expo (TypeScript), it follows a "Map + Mini-Games + Rewards" structure with calm, parent-trusted design.

## Tech Stack
- **Frontend**: React Native with Expo SDK 54 (TypeScript), expo-router
- **Storage**: AsyncStorage (offline-first, no account required)
- **Audio**: Google Cloud TTS Neural2 (pre-generated MP3s) + expo-av for playback
- **Subscription**: MOCKED RevenueCat (easy to plug in real keys)
- **Backend**: FastAPI (minimal - app is offline-first)

## Architecture
```
/app/frontend/
  app/                    # Expo Router screens
  src/
    components/           # KidButton, StarDisplay, ParentalGate
    games/                # PhonicsGame, NumbersGame, ShapesGame
    data/                 # Level configs, avatars, rewards
    storage/              # AsyncStorage helpers + types
    services/             # Mocked subscription service
    utils/                # Theme, audio helpers
  assets/
    audio/
      sfx/               # Sound effects (tap, correct, wrong, celebrate, etc.)
      voice/             # Voice prompts (phonics instructions, encouragement)
        numbers/         # Number audio 1-20
        words/           # Word pronunciations for phonics
```

## Features Implemented
1. ✅ Onboarding (avatar, nickname, age band, audio)
2. ✅ Home Map (3 worlds + rewards/parent/settings)
3. ✅ Level Select (3 game types, 10 levels each per world)
4. ✅ Phonics Mini-Game (tap matching initial sounds)
5. ✅ Numbers Mini-Game (count items, check answer)
6. ✅ Shapes Mini-Game (match shapes to outlines)
7. ✅ Results Screen (0-3 stars, sticker rewards)
8. ✅ Reward Room (sticker album + decor customization)
9. ✅ Parent Corner (parental gate + dashboard + subscription)
10. ✅ Settings (audio toggle + reset progress)
11. ✅ Premium content gating (World 2 & 3 locked)
12. ✅ Mocked subscription (monthly $1.99 + annual $14.99)
13. ✅ **Human-like child voice audio** (Google Cloud TTS Neural2)

## Audio System (Updated Jan 2026)
### Previous System
- Used expo-speech (TTS) for robotic voice generation at runtime

### New System
- **Pre-generated MP3 files** using Google Cloud TTS Neural2 API
- **Voice**: en-US-Neural2-H (child-like female voice with high pitch)
- **122 audio files** covering:
  - 11 SFX (tap, correct, wrong, celebrate, level up, etc.)
  - 36 voice prompts (phonics instructions, world intros, encouragement)
  - 20 number pronunciations (1-20)
  - 54 word pronunciations for phonics games
- **Benefits**: 
  - No runtime API calls needed
  - Instant playback with caching
  - Consistent, high-quality child-friendly voice
  - Works offline

### Audio Generation Script
Located at `/app/scripts/generate_audio.py` - can regenerate or add new audio files using:
- Google Cloud TTS API key
- Neural2-H voice configuration

## Data Model (AsyncStorage)
- userProfile: avatar, nickname, ageBand, audioOn, onboarded
- subscription: isPremium, lastCheckedAt
- progress: per-world, per-game starsByLevel + unlockedLevel
- rewards: stickersEarned, decorUnlocked, decorSelected
- dailyStats: minutesPlayed, skillsPracticed

## Design System
- Background: #FFF9F0 (warm cream)
- Dino Green: #88C999, Space Blue: #8ECAE6, Critter Pink: #FB6F92
- Primary Action: #FF9F1C (orange)
- Touch targets: 60px+ minimum
- Typography: rounded, heavy weights

---
Last Updated: Jan 2026
