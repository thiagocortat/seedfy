# Corpo App (MVP)

A spiritual group challenge app for iOS and Android, built with React Native (Expo) and Firebase.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI
- Firebase Project

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```
    *Note: If you encounter permission errors, try `npm install --force` or check your npm cache permissions.*

2.  **Environment Variables**
    Copy `.env.example` to `.env` and fill in your Firebase config:
    ```bash
    cp .env.example .env
    ```

3.  **Run the App**
    ```bash
    npx expo start
    ```
    - Press `i` for iOS simulator
    - Press `a` for Android emulator
    - Scan QR code with Expo Go app on physical device

## Features

- **Auth**: Email/Password login, Sign Up, Forgot Password.
- **Onboarding**: Profile setup, Church selection, Interest selection.
- **Groups**: Create groups, invite via link, view activity feed.
- **Challenges**: Create spiritual challenges (Reading, Fasting, etc.), track daily progress, group aggregated stats.
- **Content**: Library of podcasts, videos, and music.
- **Home**: Dashboard with active challenges and daily greeting.

## Project Structure

- `src/app`: Navigation stacks (Root, Auth, MainTab, etc.)
- `src/components`: Reusable UI components (Button, Card, Typography, etc.)
- `src/features`: Feature-specific screens and logic (auth, groups, challenges)
- `src/services`: Firebase and external service wrappers
- `src/store`: Zustand state management stores
- `src/theme`: Design tokens (colors, typography, spacing)

## Build

To build for production using EAS:

1.  Install EAS CLI: `npm install -g eas-cli`
2.  Login: `eas login`
3.  Configure: `eas build:configure`
4.  Build:
    ```bash
    eas build --platform ios
    eas build --platform android
    ```

## Testing

Run unit tests:
```bash
npm test
```
