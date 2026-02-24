# BrightBuds World - Product Requirements Document

## Overview
BrightBuds World is a mobile-first kids learning game app (ages 4+) with Dinosaurs, Space, and Cute Animals themes. Built with React Native/Expo (TypeScript), it follows a "Map + Mini-Games + Rewards" structure with calm, parent-trusted design.

## Tech Stack
- **Frontend**: React Native with Expo SDK 54 (TypeScript), expo-router
- **Storage**: AsyncStorage (offline-first, no account required)
- **Audio**: expo-speech (TTS for voice instructions)
- **Subscription**: MOCKED RevenueCat (easy to plug in real keys)
- **Backend**: FastAPI (minimal - app is offline-first)

## Architecture
```
/app/frontend/
  app/                    # Expo Router screens
    _layout.tsx           # Root stack navigator
    index.tsx             # Entry (redirect to onboarding/map)
    onboarding.tsx        # 4-step onboarding
    map.tsx               # Home hub with worlds
    level-select.tsx      # Game type tabs + level grid
    game.tsx              # Mini-game runner
    results.tsx           # Stars + sticker rewards
    rewards.tsx           # Sticker album + decor corner
    parent-corner.tsx     # Parent dashboard + subscription
    settings.tsx          # Audio toggle + reset
  src/
    components/           # KidButton, StarDisplay, ParentalGate
    games/                # PhonicsGame, NumbersGame, ShapesGame
    data/                 # Level configs, avatars, rewards
    storage/              # AsyncStorage helpers + types
    services/             # Mocked subscription service
    utils/                # Theme, audio helpers
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

## Subscription (MOCKED)
- Monthly: $1.99/month with 3-day free trial
- Annual: $14.99/year (best value)
- Replace with real RevenueCat SDK for production

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
