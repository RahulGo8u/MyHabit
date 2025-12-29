# How to View SQLite Data While Debugging

## Method 1: Using Console Logs (Easiest) ⭐

### Step 1: Add Debug Function Call

Add this to any function you're debugging:

```typescript
// In src/services/habitService.ts or any file
import {debugDatabase} from '../utils/debugDatabase';

async getTodayHabits(): Promise<HabitWithStatus[]> {
  // Add this line to see all database data
  await debugDatabase(); // 👈 Add this
  
  const today = database.getTodayDateString();
  // ... rest of code
}
```

### Step 2: Debug

1. Set a breakpoint at the `debugDatabase()` line
2. Shake phone → "Open JS Debugger"
3. Trigger the code
4. Check Chrome DevTools **Console** tab
5. You'll see all database data formatted nicely

---

## Method 2: Use Global Debug Function (No Code Changes)

### Step 1: Enable Remote Debugging
- Shake phone → "Open JS Debugger"
- Chrome DevTools opens

### Step 2: Use Console
- In Chrome DevTools, go to **Console** tab
- Type: `debugDatabase()`
- Press Enter
- All database data will be logged!

**Note:** The `debugDatabase` function is automatically available in the console when debugging.

---

## Method 3: Inspect Variables in Debugger

### While at a Breakpoint:

1. Set breakpoint in your code (e.g., `habitService.ts` line 16)
2. When paused, look at the **Variables** panel in Chrome DevTools
3. Expand variables to see their values
4. For database results, expand the array/object to see all data

### Example:
```typescript
async getTodayHabits(): Promise<HabitWithStatus[]> {
  const today = database.getTodayDateString();
  await database.ensureHabitRecordsForDate(today);
  const habits = await database.getHabitsForDate(today); // 👈 Set breakpoint here
  return habits.map(this.mapToHabitWithStatus);
}
```

When paused at this line:
- Look at `habits` variable in Variables panel
- Expand it to see all habit data
- See `today` variable value

---

## Method 4: Add Temporary Logging

Add `console.log` statements:

```typescript
async getTodayHabits(): Promise<HabitWithStatus[]> {
  const today = database.getTodayDateString();
  await database.ensureHabitRecordsForDate(today);
  const habits = await database.getHabitsForDate(today);
  
  // Add this to see data
  console.log('🔍 DEBUG - Today:', today);
  console.log('🔍 DEBUG - Habits:', JSON.stringify(habits, null, 2));
  
  return habits.map(this.mapToHabitWithStatus);
}
```

Then check Chrome DevTools **Console** tab.

---

## Method 5: Use Watch Expressions

In Chrome DevTools while debugging:

1. Go to **Sources** tab
2. Set a breakpoint
3. In the right panel, find **Watch** section
4. Click `+` and add: `habits` (or any variable name)
5. You'll see the value update as you step through code

---

## Quick Test:

1. **Add breakpoint** in `habitService.ts` line 16
2. **Shake phone** → "Open JS Debugger"
3. **Trigger code** (e.g., open Today screen)
4. **When paused**, in Chrome DevTools Console, type: `debugDatabase()`
5. **Press Enter** → See all database data!

---

## What Data You'll See:

- ✅ All active habits (with IDs, names, creation dates)
- ✅ Today's habits with status and duration
- ✅ Yesterday's habits (for comparison)
- ✅ All formatted as JSON for easy reading

---

## For Web (localStorage):

If debugging on web, data is stored in localStorage:
1. Chrome DevTools → **Application** tab
2. **Local Storage** → `http://localhost:8081` (or your web URL)
3. Look for keys: `myhabit_habits`, `myhabit_records`
4. Click to see the JSON data

---

## Tips:

- **Console logs** appear in Chrome DevTools Console tab
- **Variables** can be inspected in the Variables panel when paused
- **Watch expressions** let you monitor specific variables
- **Global debug function** (`debugDatabase()`) works from console anytime

