# Breakpoint Debugging Guide

## Method 1: Chrome DevTools (Easiest - Recommended) ⭐

### Step-by-Step:

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Open app in Expo Go** on your device/emulator

3. **Enable Remote Debugging:**
   - Shake your device (or press `Cmd+M` on Android emulator)
   - Select **"Debug Remote JS"**
   - Chrome will automatically open at `http://localhost:19000/debugger-ui/`

4. **Set Breakpoints:**
   - In Chrome DevTools, go to **Sources** tab
   - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows) to open file search
   - Type the file name (e.g., `TodayScreen.tsx`)
   - Click on the line number to set a breakpoint
   - Breakpoints will hit when that code executes

5. **Debug:**
   - Use the debugger controls (play, step over, step into, etc.)
   - Inspect variables in the right panel
   - View call stack
   - Watch expressions

### Tips:
- Breakpoints work in `.tsx`, `.ts`, and `.js` files
- You can set multiple breakpoints
- Breakpoints persist across reloads
- Use `debugger;` statement in code as an alternative

---

## Method 2: VS Code / Cursor (If using VS Code)

### Setup:

1. **Install Extension:**
   - Open VS Code/Cursor
   - Install "React Native Tools" extension
   - (Extension ID: `msjsdiag.vscode-react-native`)

2. **Start the app:**
   ```bash
   npm start
   ```

3. **Enable Remote Debugging:**
   - Shake device → "Debug Remote JS"

4. **Set Breakpoints:**
   - Open any `.tsx` or `.ts` file
   - Click in the gutter (left of line numbers) to set breakpoint
   - Red dot appears

5. **Start Debugging:**
   - Press `F5` or go to Run → Start Debugging
   - Select "Debug React Native" configuration
   - Breakpoints will hit when code executes

### VS Code Debug Configuration:
Already created in `.vscode/launch.json`:
```json
{
  "name": "Debug React Native",
  "type": "reactnative",
  "request": "launch",
  "cwd": "${workspaceFolder}",
  "platform": "android"
}
```

---

## Quick Test:

1. Set a breakpoint in `App.tsx` line 15 (inside `initializeApp`)
2. Shake device → "Debug Remote JS"
3. Reload app (shake → "Reload")
4. Breakpoint should hit!

---

## Using `debugger;` Statement:

You can also add `debugger;` directly in your code:

```typescript
const handleMarkDone = (habit: HabitWithStatus) => {
  debugger; // Execution will pause here
  setSelectedHabit(habit);
  // ...
};
```

When remote debugging is enabled, execution will pause at `debugger;` statements.

---

## Troubleshooting:

**Breakpoints not hitting?**
- Make sure "Debug Remote JS" is enabled
- Check that Chrome DevTools is open
- Try reloading the app (shake → "Reload")
- Verify the file path matches exactly

**Can't find files in Sources?**
- Press `Cmd+P` in Chrome DevTools
- Type part of the filename
- Files are under `localhost:8081` or similar

**VS Code breakpoints not working?**
- Ensure "React Native Tools" extension is installed
- Make sure "Debug Remote JS" is enabled on device
- Check that the debugger is attached (should see "Debugger attached" in terminal)

