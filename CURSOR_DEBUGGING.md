# Debugging in Cursor - Step by Step Guide

## Method 1: Using Cursor's Built-in Debugger (Recommended for Cursor)

### Prerequisites:
1. Install "React Native Tools" extension in Cursor:
   - Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows)
   - Search for "React Native Tools"
   - Install by Microsoft

### Step-by-Step:

1. **Start Expo in Terminal:**
   ```bash
   npm start
   ```
   Keep this terminal running.

2. **Open App in Expo Go:**
   - Open Expo Go on your device/emulator
   - Connect to the app

3. **Enable Remote Debugging:**
   - Shake device (or `Cmd+M` on emulator)
   - Select **"Debug Remote JS"**
   - This connects the debugger

4. **Set Breakpoints in Cursor:**
   - Open any file (e.g., `src/services/habitService.ts`)
   - Click in the **gutter** (left of line numbers) on line 10
   - A red dot appears = breakpoint set

5. **Start Debugging in Cursor:**
   - Press `F5` OR
   - Go to **Run and Debug** panel (sidebar icon or `Cmd+Shift+D`)
   - Select **"Debug React Native (Attach)"** from dropdown
   - Click the green play button
   - Cursor will attach to the running app

6. **Trigger the Breakpoint:**
   - Perform the action that triggers your code
   - Execution will pause at the breakpoint
   - You'll see variables, call stack, etc. in the Debug panel

### Debug Controls (when paused):
- **F10** = Step Over (execute current line)
- **F11** = Step Into (go into function)
- **Shift+F11** = Step Out (exit function)
- **F5** = Continue (resume execution)
- **Shift+F5** = Stop debugging

---

## Method 2: Chrome DevTools (Easier, More Reliable)

This is actually the **most reliable** method for Expo Go:

1. **Start app:**
   ```bash
   npm start
   ```

2. **Open in Expo Go**

3. **Enable Remote Debugging:**
   - Shake device → "Debug Remote JS"
   - Chrome opens automatically

4. **Set Breakpoints in Chrome:**
   - In Chrome DevTools, go to **Sources** tab
   - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
   - Type file name (e.g., `habitService.ts`)
   - Click line number to set breakpoint

5. **Debug:**
   - Use Chrome's debugger controls
   - All breakpoints work perfectly

---

## Method 3: Using `debugger;` Statement (Quickest)

Add `debugger;` directly in your code:

```typescript
// In src/services/habitService.ts
async createHabit(name: string): Promise<number> {
  debugger; // Execution pauses here
  return await database.createHabit(name);
}
```

**Steps:**
1. Add `debugger;` where you want to pause
2. Shake device → "Debug Remote JS"
3. Trigger the code
4. Execution pauses at `debugger;`
5. Use Chrome DevTools to inspect variables

---

## Quick Test:

1. **Add breakpoint in `habitService.ts` line 10:**
   ```typescript
   async createHabit(name: string): Promise<number> {
     return await database.createHabit(name); // Set breakpoint here
   }
   ```

2. **Start debugging:**
   - `npm start`
   - Shake device → "Debug Remote JS"
   - Press `F5` in Cursor (or use Chrome)

3. **Trigger it:**
   - Try creating a new habit in the app
   - Breakpoint should hit!

---

## Troubleshooting:

**Breakpoints not hitting in Cursor?**
- Make sure "React Native Tools" extension is installed
- Ensure "Debug Remote JS" is enabled on device
- Try Chrome DevTools instead (more reliable for Expo Go)

**Can't attach debugger?**
- Make sure Expo is running (`npm start`)
- Verify device is connected
- Try restarting the debugger

**VS Code/Cursor debugger not working?**
- Use Chrome DevTools (Method 2) - it's more reliable
- Or use `debugger;` statements (Method 3)

---

## Best Practice:

For **Expo Go**, Chrome DevTools (Method 2) is the most reliable. Cursor's debugger works, but Chrome is simpler and more stable.

For **production builds** or **dev clients**, Cursor's debugger works great.

