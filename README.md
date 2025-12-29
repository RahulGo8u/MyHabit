# MyHabit

A React Native (TypeScript) daily habit tracker with time logging and priority management, built with Expo for easy testing with Expo Go.

## 📱 Product Features

### Core Functionality
- **Daily Habit Tracking**: Create habits that automatically repeat every day
- **Today's Checklist**: View and manage all habits for the current day
- **Status Management**: Mark habits as Pending or Done
- **Time Logging**: Record completion time and duration (hours/minutes) when completing habits
- **Planned Time**: Set and edit planned time for each habit (e.g., "Gym at 6:00 AM")
- **Critical Priority**: Mark habits as critical - they appear at the top until completed
- **History View**: Browse past days and view read-only habit records
- **Smart Sorting**: 
  - Critical pending habits appear first
  - Non-critical pending habits sorted by planned time
  - Completed habits moved to bottom, sorted by planned time

### User Experience
- **Visual Indicators**: Critical habits show red badge (!), red border, and red text
- **Confirmation Dialogs**: Confirmation alerts for important actions (delete, mark pending)
- **Read-Only History**: Past days cannot be edited, preserving data integrity
- **Soft Deletion**: Deleting a habit removes it from today and future days, but preserves history

## 🛠 Technical Features

### Architecture
- **React Native with TypeScript**: Type-safe development
- **Expo Managed Workflow**: No native code compilation required
- **Expo Go Compatible**: Test directly on device without building
- **Platform-Aware Storage**: SQLite on native, localStorage on web

### Navigation
- **Stack Navigator**: Three-screen navigation (Today, Add Habit, History)
- **React Navigation**: Industry-standard navigation library

### Data Persistence
- **SQLite Database**: Local storage using `expo-sqlite`
- **Automatic Migration**: Database schema updates handled automatically
- **Error Recovery**: Automatic database reinitialization on connection errors
- **Web Compatibility**: localStorage adapter for web platform

### UI Components
- **Time Picker**: Native time picker for completion and planned times
- **Duration Input**: Hours and minutes input with validation
- **Error Boundary**: Graceful error handling with fallback UI
- **Modal Dialogs**: Professional modals for habit completion and time editing

### Code Quality
- **TypeScript**: Full type safety
- **Error Handling**: Comprehensive error handling and recovery
- **Code Organization**: Clean separation of concerns (database, services, screens, components)

## 📊 Database Schema

### Habits Table
Stores habit definitions and metadata.

```sql
CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL,           -- ISO date string
  deletedAt TEXT,                    -- ISO date string, null if active
  scheduledTime TEXT,                -- HH:MM format (24-hour), e.g., "06:00"
  isCritical INTEGER DEFAULT 0       -- 1 if critical, 0 if not
);
```

**Fields:**
- `id`: Unique identifier
- `name`: Habit name (e.g., "Exercise", "Read")
- `createdAt`: When the habit was created (ISO timestamp)
- `deletedAt`: When the habit was deleted (ISO timestamp, null if active)
- `scheduledTime`: Planned time in 24-hour format (e.g., "06:00" for 6 AM)
- `isCritical`: Boolean flag (0 = false, 1 = true) for priority habits

### Habit Records Table
Stores daily status and completion data for each habit.

```sql
CREATE TABLE habit_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habitId INTEGER NOT NULL,
  date TEXT NOT NULL,                -- YYYY-MM-DD format
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' or 'done'
  durationMinutes INTEGER,           -- Total minutes (null if not logged)
  completionTime TEXT,               -- HH:MM format (24-hour)
  FOREIGN KEY (habitId) REFERENCES habits(id),
  UNIQUE(habitId, date)
);
```

**Fields:**
- `id`: Unique identifier
- `habitId`: Foreign key to habits table
- `date`: Date in YYYY-MM-DD format (e.g., "2025-12-30")
- `status`: Either 'pending' or 'done'
- `durationMinutes`: Total duration in minutes (e.g., 90 for 1 hour 30 minutes)
- `completionTime`: Time when habit was completed in HH:MM format (e.g., "14:30")

**Constraints:**
- Unique constraint on `(habitId, date)` ensures one record per habit per day
- Foreign key ensures referential integrity

### Indexes
```sql
CREATE INDEX idx_habit_records_date ON habit_records(date);
CREATE INDEX idx_habit_records_habitId ON habit_records(habitId);
```

These indexes improve query performance when filtering by date or habit.

## 🚀 Getting Started

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

### Building APK

To create an APK for distribution:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS Build:**
   ```bash
   eas build:configure
   ```

4. **Build APK:**
   ```bash
   eas build --platform android --profile preview
   ```

For production builds:
```bash
eas build --platform android --profile production
```

## 📁 Project Structure

```
MyHabit/
├── src/
│   ├── components/
│   │   ├── DurationInput.tsx      # Duration input (hours/minutes)
│   │   ├── ErrorBoundary.tsx      # Error boundary component
│   │   └── TimePicker.tsx         # Time picker component
│   ├── database/
│   │   ├── database.ts             # SQLite database layer (expo-sqlite)
│   │   └── webStorage.ts          # Web storage adapter (localStorage)
│   ├── navigation/
│   │   └── AppNavigator.tsx       # Navigation setup
│   ├── screens/
│   │   ├── TodayScreen.tsx         # Main today's habits screen
│   │   ├── AddHabitScreen.tsx     # Create new habit screen
│   │   └── HistoryScreen.tsx      # View past days (read-only)
│   ├── services/
│   │   └── habitService.ts        # Business logic for habits
│   └── types/
│       └── index.ts               # TypeScript type definitions
├── App.tsx                         # Root component
├── index.js                        # Expo entry point
├── app.json                        # Expo configuration
└── package.json
```

## 🔧 Dependencies

### Core
- `expo`: ~54.0.0 (Expo SDK 54)
- `react-native`: ^0.81.5
- `react`: 19.1.0
- `typescript`: ^5.6.3

### Navigation
- `@react-navigation/native`: ^6.1.18
- `@react-navigation/stack`: ^6.4.1
- `react-native-screens`: ~4.16.0
- `react-native-safe-area-context`: ~5.6.0
- `react-native-gesture-handler`: ~2.28.0

### Storage
- `expo-sqlite`: ~16.0.10 (Expo-compatible SQLite)

### UI Components
- `@react-native-community/datetimepicker`: ^8.4.4 (Time picker)

## 📝 Notes

- The app uses local SQLite storage only (no cloud sync)
- All data persists across app restarts
- History is immutable - past records cannot be edited or deleted
- Habits are automatically created for each day when viewing that date
- Critical habits remain visually indicated even after completion
- Built with Expo SDK 54 for maximum compatibility with Expo Go

## 🐛 Troubleshooting

### Expo Go Connection Issues
- Ensure your device and computer are on the same Wi-Fi network
- Try using the tunnel connection: `expo start --tunnel`
- Check that your firewall isn't blocking the connection

### Database Issues
- The database is created automatically on first launch
- If you encounter database errors, try clearing the Expo Go app data and restarting
- The app includes automatic database reinitialization on connection errors

## 📄 License

See LICENSE file for details.
