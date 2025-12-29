# How to View and Query SQLite Data

## Method 1: Using debugDatabase() Function ⭐ Easiest

1. **Shake phone → "Open JS Debugger"**
2. **In Chrome Console, type:**
   ```javascript
   debugDatabase()
   ```
3. **Press Enter** - See all data formatted nicely

---

## Method 2: Using Query Functions (Custom SQL)

### Available Functions (in Chrome Console):

```javascript
// Get all habits
queryAllHabits()

// Get all records
queryAllRecords()

// Get habits for specific date
queryHabitsForDate("2024-12-30")

// Get habit by ID
queryHabitById(1)

// Get all records for a habit
queryRecordsByHabitId(1)

// Run custom SQL query
querySQL("SELECT * FROM habits WHERE deletedAt IS NULL")
querySQL("SELECT * FROM habit_records WHERE date = ?", ["2024-12-30"])
```

### Example Queries:

```javascript
// See all active habits
queryAllHabits()

// See all daily records
queryAllRecords()

// See today's data
const today = new Date().toISOString().split('T')[0];
queryHabitsForDate(today)

// Count habits
querySQL("SELECT COUNT(*) as count FROM habits WHERE deletedAt IS NULL")

// See completion rate
querySQL(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed
  FROM habit_records 
  WHERE date = ?
`, [today])
```

---

## Method 3: Add Logging to Code

Add `console.log` in your code:

```typescript
// In src/services/habitService.ts
async getTodayHabits(): Promise<HabitWithStatus[]> {
  const today = database.getTodayDateString();
  await database.ensureHabitRecordsForDate(today);
  const habits = await database.getHabitsForDate(today);
  
  // Add this to see data
  console.log('📊 Today\'s habits:', JSON.stringify(habits, null, 2));
  
  return habits.map(this.mapToHabitWithStatus);
}
```

Then check Chrome Console tab.

---

## Method 4: Inspect Variables at Breakpoints

1. **Set breakpoint** in your code
2. **Shake phone → "Open JS Debugger"**
3. **When paused**, in Chrome DevTools:
   - **Variables panel**: Expand variables to see data
   - **Console**: Type variable name to see value
   - **Watch**: Add variable to monitor

---

## Method 5: Using Android Studio (If Available)

1. Open Android Studio
2. Tools → Device File Explorer
3. Navigate to: `/data/data/com.myhabit.app/databases/`
4. Download `MyHabit.db`
5. Open with SQLite browser (DB Browser for SQLite)

---

## Method 6: Using ADB (Command Line)

```bash
# Pull database from device
adb shell run-as com.myhabit.app
cd databases
cat MyHabit.db > /sdcard/MyHabit.db
exit

# Download to computer
adb pull /sdcard/MyHabit.db ./

# Open with SQLite
sqlite3 MyHabit.db
.tables
SELECT * FROM habits;
```

---

## Quick Reference: Common Queries

### View All Data
```javascript
debugDatabase()  // Shows everything formatted
```

### Custom Queries
```javascript
// All habits
queryAllHabits()

// All records
queryAllRecords()

// Today's data
queryHabitsForDate(new Date().toISOString().split('T')[0])

// Specific habit's history
queryRecordsByHabitId(1)

// Custom SQL
querySQL("SELECT * FROM habits WHERE name LIKE '%Exercise%'")
```

---

## Tips:

- **Use `debugDatabase()`** for quick overview
- **Use `querySQL()`** for custom queries
- **Check Chrome Console** for all output
- **Add breakpoints** to inspect variables
- **Use JSON.stringify()** in console to format objects nicely

---

## Example: Debugging a Specific Issue

```javascript
// 1. See all data
debugDatabase()

// 2. Check specific habit
queryHabitById(1)

// 3. Check its records
queryRecordsByHabitId(1)

// 4. Check today's status
const today = new Date().toISOString().split('T')[0];
querySQL("SELECT * FROM habit_records WHERE habitId = 1 AND date = ?", [today])
```

