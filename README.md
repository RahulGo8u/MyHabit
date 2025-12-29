# MyHabit

A React Native (TypeScript) daily habit tracker with time logging capabilities, built with Expo for easy testing with Expo Go.

## Overview

MyHabit is a simple, clean habit tracking app where:
- Habits are created once and automatically repeat every day
- Each day is a fresh checklist (completion resets daily)
- Users can log time spent when completing a habit
- Past days are read-only (history cannot be edited or deleted)

## Features

### Core Functionality
- **Today Screen**: View and manage today's habits with status (Pending/Done)
- **Add Habit**: Create new habits that automatically repeat daily
- **Time Logging**: Log duration in minutes when marking habits as done
- **History View**: Browse past days and view read-only habit records
- **Habit Deletion**: Delete habits from today (affects future days only, preserves history)

### Key Behaviors
- Habits repeat daily automatically
- Each day starts with all habits in "Pending" status
- Marking a habit as "Done" allows optional time logging
- Deleting a habit removes it from today and all future days
- Past history remains immutable and visible

## Getting Started

### Prerequisites
- Node.js (>= 18)
- Expo CLI (install globally: `npm install -g expo-cli`)
- Expo Go app installed on your Android device (from Google Play Store)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   expo start
   ```

3. **Run on Android with Expo Go:**
   - Open the Expo Go app on your Android device
   - Scan the QR code displayed in the terminal or browser
   - The app will load on your device

   Alternatively, you can press `a` in the terminal to open on Android emulator (if configured).

### Development

Start the Expo development server:
```bash
npm start
```

This will:
- Start the Metro bundler
- Display a QR code for Expo Go
- Open the Expo DevTools in your browser

## Project Structure

```
MyHabit/
├── src/
│   ├── database/
│   │   └── database.ts          # SQLite database layer (expo-sqlite)
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Navigation setup
│   ├── screens/
│   │   ├── TodayScreen.tsx      # Main today's habits screen
│   │   ├── AddHabitScreen.tsx   # Create new habit screen
│   │   └── HistoryScreen.tsx    # View past days (read-only)
│   ├── services/
│   │   └── habitService.ts      # Business logic for habits
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── App.tsx                       # Root component
├── index.js                      # Expo entry point
├── app.json                      # Expo configuration
└── package.json
```

## Architecture

### Data Layer

**Database (Expo SQLite)**
- Uses `expo-sqlite` for local database storage (Expo Go compatible)
- `habits` table: Stores habit definitions with creation and deletion timestamps
- `habit_records` table: Stores daily status and time logs for each habit

**Key Design Decisions:**
- Habits are soft-deleted (using `deletedAt` timestamp) to preserve history
- Daily records are created on-demand when viewing a date
- Unique constraint on `(habitId, date)` ensures one record per habit per day

### Service Layer

**HabitService** (`src/services/habitService.ts`)
- Handles all business logic for habits
- Manages habit creation, status updates, and deletion
- Ensures daily records exist when needed

### Screen Components

**TodayScreen** (`src/screens/TodayScreen.tsx`)
- Displays today's date and habit list
- Allows marking habits as done/pending with time logging
- Handles habit deletion (today context only)
- Navigation to Add Habit and History screens

**AddHabitScreen** (`src/screens/AddHabitScreen.tsx`)
- Simple form to create new habits
- Creates habit and initializes today's record

**HistoryScreen** (`src/screens/HistoryScreen.tsx`)
- Date navigation (Previous/Next buttons)
- Read-only view of past days' habits
- Shows status and time logs for historical records

### Navigation

Uses React Navigation Stack Navigator with three screens:
- Today (default)
- Add Habit
- History

## Main Logic Locations

### Habit Management
- **Service**: `src/services/habitService.ts`
- **Database Operations**: `src/database/database.ts`
- **Today Screen Logic**: `src/screens/TodayScreen.tsx`

### Data Persistence
- **Database Initialization**: `src/database/database.ts` → `init()`
- **Table Creation**: `src/database/database.ts` → `createTables()`
- **Record Management**: `src/database/database.ts` → `ensureHabitRecordsForDate()`

### Time Logging
- **UI**: `src/screens/TodayScreen.tsx` → Modal with duration input
- **Storage**: `src/database/database.ts` → `updateHabitRecord()`

### Deletion Logic
- **Implementation**: `src/database/database.ts` → `deleteHabit()`
- **UI**: `src/screens/TodayScreen.tsx` → `handleDelete()`
- **History Preservation**: Soft delete with `deletedAt` timestamp ensures past records remain visible

## Data Models

### Habit
```typescript
{
  id: number;
  name: string;
  createdAt: string;      // ISO date string
  deletedAt: string | null; // ISO date string, null if active
}
```

### HabitRecord
```typescript
{
  id: number;
  habitId: number;
  date: string;           // YYYY-MM-DD format
  status: 'pending' | 'done';
  durationMinutes: number | null;
}
```

## Edge Cases Handled

1. **Habit Deletion**: Deleted habits don't appear in future days but remain in history
2. **Missing Records**: History automatically creates pending records for habits that existed on a date but weren't explicitly marked
3. **Future Dates**: History screen prevents navigation to future dates
4. **Invalid Time Input**: Validates numeric input for duration logging

## Dependencies

### Core
- `expo`: ~50.0.0 (Expo SDK 50)
- `react-native`: 0.73.0
- `react`: 18.2.0
- `typescript`: ^5.3.3

### Navigation
- `@react-navigation/native`: ^6.1.9
- `@react-navigation/stack`: ^6.3.20
- `react-native-screens`: ~3.29.0
- `react-native-safe-area-context`: 4.8.2
- `react-native-gesture-handler`: ~2.14.0

### Storage
- `expo-sqlite`: ~13.0.0 (Expo-compatible SQLite)

## Expo Go Compatibility

This app is fully compatible with Expo Go and uses only Expo-compatible libraries:
- ✅ `expo-sqlite` for database (no native modules)
- ✅ React Navigation (works with Expo Go)
- ✅ All dependencies are Expo Go compatible

**Note**: The app uses Expo's managed workflow, meaning no native code compilation is required. You can test it directly with Expo Go on your Android device.

## Notes

- The app uses local SQLite storage only (no cloud sync)
- All data persists across app restarts
- History is immutable - past records cannot be edited or deleted
- Habits are automatically created for each day when viewing that date
- Built with Expo SDK 50 for maximum compatibility with Expo Go

## Troubleshooting

### Expo Go Connection Issues
- Ensure your device and computer are on the same Wi-Fi network
- Try using the tunnel connection: `expo start --tunnel`
- Check that your firewall isn't blocking the connection

### Database Issues
- The database is created automatically on first launch
- If you encounter database errors, try clearing the Expo Go app data and restarting

## License

See LICENSE file for details.
