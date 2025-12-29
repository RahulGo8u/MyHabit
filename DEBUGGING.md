# Debugging Guide for MyHabit

## Quick Start (Native Debugging - No Web Required)

### Method 1: Chrome DevTools (Easiest - Recommended)
1. Run `npm start`
2. Open Expo Go on your device
3. Shake device (or press `Cmd+M` on emulator)
4. Select **"Debug Remote JS"**
5. Chrome automatically opens at `http://localhost:19000/debugger-ui/`
6. Use Console tab for logs, Sources for breakpoints

### Method 2: Terminal Logs (Simplest)
- All `console.log()` statements appear in the terminal where you ran `npm start`
- Filter logs: `npm start | grep -i "🔍\|❌\|✅"`

### Method 3: React Native Debugger (Best Features)
```bash
brew install --cask react-native-debugger
```
Then shake device → "Debug Remote JS"
- React DevTools built-in
- Redux DevTools support
- Network inspector
- Better performance

### Method 4: React DevTools Standalone
```bash
npm install -g react-devtools
react-devtools
```
Then shake device → "Debug Remote JS"
- Inspect component tree
- View props and state
- Performance profiling

### Method 5: Expo DevTools
- Automatically opens at `http://localhost:19002` when running `npm start`
- Shows logs, device info, network requests
- No device interaction needed

### Method 6: VS Code Debugging
- Install "React Native Tools" extension
- Use `.vscode/launch.json` (already created)
- Set breakpoints in code
- Press F5 to start debugging

## Native Debugging Methods (No Web Required)

### 1. Chrome DevTools (Remote Debugging) ⭐ Easiest
**Steps:**
1. Run `npm start`
2. Open app in Expo Go
3. Shake device → "Debug Remote JS"
4. Chrome opens automatically
5. Full debugging: Console, Sources, Network, Performance

**Features:**
- Set breakpoints
- Inspect variables
- View network requests
- Performance profiling
- Console logs

### 2. Terminal Console Logs ⭐ Simplest
**Just watch your terminal:**
```bash
npm start
```
All `console.log()` appears here. Use emojis to filter:
- 🚀 App events
- ❌ Errors
- 📊 Data
- ✅ Success

### 3. React Native Debugger ⭐ Best Features
**Install:**
```bash
brew install --cask react-native-debugger
```

**Use:**
- Shake device → "Debug Remote JS"
- React DevTools built-in
- Redux DevTools
- Network inspector
- Better than Chrome for React Native

### 4. React DevTools Standalone
**Install:**
```bash
npm install -g react-devtools
react-devtools
```

**Use:**
- Shake device → "Debug Remote JS"
- Inspect component tree
- View props/state
- Performance profiling

### 5. Expo DevTools
- Auto-opens at `http://localhost:19002`
- View logs, device info
- No device interaction needed

### 6. VS Code Debugging
- Extension: "React Native Tools"
- Set breakpoints in code
- Press F5 to debug
- `.vscode/launch.json` already configured

## Common Debugging Commands

```bash
# Start with clear cache
npx expo start --clear

# View logs in terminal (filter errors)
npm start | grep -i error

# View logs with emojis (filter important)
npm start | grep -E "🚀|❌|✅|📊"

# Android logcat (native logs)
adb logcat | grep -i react

# Check Expo DevTools
# Auto-opens at http://localhost:19002
```

## Logging in Code

The app uses console.log with emojis for easy identification:
- 🚀 App initialization
- 📦 Database operations
- ✅ Success messages
- ❌ Error messages
- 📝 Data operations

## Error Boundary

The app has an ErrorBoundary component that catches React errors and displays them on screen. If you see an error screen, check:
1. The error message displayed
2. The console for full stack trace
3. The component stack trace

## Database Debugging

To check database state, add temporary logging:

```typescript
// In database.ts, add logging to any method
console.log('📊 Query result:', result);
```

## Network Debugging

If using fetch/API calls:
- Check Network tab in Chrome DevTools
- Use React Native Debugger's Network inspector

## Performance Debugging

```bash
# Enable performance monitoring
npx expo start --dev-client

# Use React DevTools Profiler
npm install -g react-devtools
react-devtools
```

## Common Issues

### App stuck on "Initializing..."
- Check console for database errors
- Verify expo-sqlite is installed correctly
- Check if database file permissions are correct

### Blank screen
- Check ErrorBoundary for caught errors
- Look for JavaScript errors in console
- Verify all imports are correct

### Database errors
- Check console for SQL errors
- Verify table structure
- Check database file exists

## Tips

1. **Always check the terminal** - Most errors appear there first
2. **Use console.log strategically** - Add logs at key points
3. **Check ErrorBoundary** - Catches React component errors
4. **Use React DevTools** - Inspect component state and props
5. **Enable remote debugging** - For better error messages

