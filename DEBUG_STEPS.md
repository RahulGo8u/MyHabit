# Debugging Steps - Physical Android Device

## Step-by-Step:

1. **App is running on your phone via Expo Go** ✅

2. **Open the debug menu:**
   - Shake your phone (or long-press the Expo Go app icon → "Shake Device")
   - OR tap the menu button in Expo Go

3. **Select "Open JS Debugger":**
   - This is the same as "Debug Remote JS" (just different wording)
   - Chrome will automatically open on your computer at `http://localhost:19000/debugger-ui/`

4. **If Chrome doesn't open automatically:**
   - Open Chrome manually
   - Go to: `http://localhost:19000/debugger-ui/`
   - You should see "Debugger" interface

5. **Set breakpoints:**
   - In Chrome DevTools, click the **Sources** tab
   - Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
   - Type your file name (e.g., `habitService.ts`)
   - Click on the line number to set a breakpoint (blue dot appears)

6. **Debug:**
   - Use your phone to trigger the code (e.g., create a habit)
   - Execution will pause at your breakpoint
   - Inspect variables in the right panel
   - Use debug controls: Continue (F8), Step Over (F10), etc.

## Alternative: Using `debugger;` Statement

If Chrome DevTools doesn't work, add `debugger;` directly in your code:

```typescript
// In src/services/habitService.ts
async createHabit(name: string): Promise<number> {
  debugger; // Execution pauses here when "Open JS Debugger" is active
  return await database.createHabit(name);
}
```

Then:
1. Shake phone → "Open JS Debugger"
2. Trigger the code on your phone
3. Execution pauses at `debugger;`
4. Use Chrome DevTools to inspect

## Troubleshooting:

**"Open JS Debugger" not working?**
- Make sure your phone and computer are on the same Wi-Fi network
- Try closing and reopening Expo Go
- Restart `npm start` in terminal

**Chrome doesn't open?**
- Manually go to: `http://localhost:19000/debugger-ui/`
- Or try: `http://localhost:8081/debugger-ui/`

**Breakpoints not hitting?**
- Make sure "Open JS Debugger" is active (you'll see "Debugger" in Chrome)
- Try using `debugger;` statement instead
- Reload the app on your phone

