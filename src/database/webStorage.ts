// Web storage adapter using localStorage
// This provides the same interface as SQLite but uses localStorage for web compatibility

interface Habit {
  id: number;
  name: string;
  createdAt: string;
  deletedAt: string | null;
  scheduledTime: string | null;
  isCritical: boolean;
}

interface HabitRecord {
  id: number;
  habitId: number;
  date: string;
  status: 'pending' | 'done';
  durationMinutes: number | null;
  completionTime: string | null;
}

const STORAGE_KEY_HABITS = 'myhabit_habits';
const STORAGE_KEY_RECORDS = 'myhabit_records';
const STORAGE_KEY_LAST_ID = 'myhabit_last_habit_id';
const STORAGE_KEY_LAST_RECORD_ID = 'myhabit_last_record_id';

class WebStorage {
  private habits: Habit[] = [];
  private records: HabitRecord[] = [];
  private lastHabitId = 0;
  private lastRecordId = 0;

  async init(): Promise<void> {
    try {
      console.log('📂 Initializing web storage (localStorage)');
      
      // Load from localStorage
      const habitsJson = localStorage.getItem(STORAGE_KEY_HABITS);
      const recordsJson = localStorage.getItem(STORAGE_KEY_RECORDS);
      const lastHabitIdStr = localStorage.getItem(STORAGE_KEY_LAST_ID);
      const lastRecordIdStr = localStorage.getItem(STORAGE_KEY_LAST_RECORD_ID);

      this.habits = habitsJson ? JSON.parse(habitsJson) : [];
      this.records = recordsJson ? JSON.parse(recordsJson) : [];
      this.lastHabitId = lastHabitIdStr ? parseInt(lastHabitIdStr, 10) : 0;
      this.lastRecordId = lastRecordIdStr ? parseInt(lastRecordIdStr, 10) : 0;

      console.log('✅ Web storage initialized');
      console.log(`📊 Loaded ${this.habits.length} habits and ${this.records.length} records`);
    } catch (error) {
      console.error('❌ Web storage initialization error:', error);
      throw error;
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(this.habits));
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(this.records));
      localStorage.setItem(STORAGE_KEY_LAST_ID, this.lastHabitId.toString());
      localStorage.setItem(STORAGE_KEY_LAST_RECORD_ID, this.lastRecordId.toString());
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
      throw error;
    }
  }

  async createHabit(
    name: string,
    scheduledTime: string | null = null,
    isCritical: boolean = false
  ): Promise<number> {
    this.lastHabitId += 1;
    const now = new Date().toISOString();
    const habit: Habit = {
      id: this.lastHabitId,
      name,
      createdAt: now,
      deletedAt: null,
      scheduledTime,
      isCritical,
    };
    this.habits.push(habit);

    // Create today's record for the new habit
    const today = this.getTodayDateString();
    await this.createHabitRecord(this.lastHabitId, today, 'pending', null, null);

    this.save();
    return this.lastHabitId;
  }
  
  async updateHabitScheduledTime(habitId: number, scheduledTime: string | null): Promise<void> {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      habit.scheduledTime = scheduledTime;
      this.save();
    }
  }

  async getAllActiveHabits(): Promise<any[]> {
    return this.habits
      .filter(h => h.deletedAt === null)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async deleteHabit(habitId: number): Promise<void> {
    const today = this.getTodayDateString();
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      habit.deletedAt = today;
      this.save();
    }
  }

  async createHabitRecord(
    habitId: number,
    date: string,
    status: 'pending' | 'done',
    durationMinutes: number | null,
    completionTime: string | null = null
  ): Promise<void> {
    // Remove existing record if any
    this.records = this.records.filter(
      r => !(r.habitId === habitId && r.date === date)
    );

    this.lastRecordId += 1;
    const record: HabitRecord = {
      id: this.lastRecordId,
      habitId,
      date,
      status,
      durationMinutes,
      completionTime,
    };
    this.records.push(record);
    this.save();
  }

  async getHabitRecord(habitId: number, date: string): Promise<any | null> {
    return (
      this.records.find(r => r.habitId === habitId && r.date === date) || null
    );
  }

  async updateHabitRecord(
    habitId: number,
    date: string,
    status: 'pending' | 'done',
    durationMinutes: number | null,
    completionTime: string | null = null
  ): Promise<void> {
    const record = this.records.find(
      r => r.habitId === habitId && r.date === date
    );
    if (record) {
      record.status = status;
      record.durationMinutes = durationMinutes;
      record.completionTime = completionTime;
      this.save();
    } else {
      await this.createHabitRecord(habitId, date, status, durationMinutes, completionTime);
    }
  }

  async getHabitsForDate(date: string): Promise<any[]> {
    // Get all habits that existed on or before this date (not deleted before this date)
    const habitsForDate = this.habits.filter(h => {
      const createdAt = new Date(h.createdAt).toISOString().split('T')[0];
      const deletedAt = h.deletedAt
        ? new Date(h.deletedAt).toISOString().split('T')[0]
        : null;

      return (
        createdAt <= date &&
        (deletedAt === null || deletedAt > date)
      );
    });

    // Sort by creation date
    habitsForDate.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Join with records
    return habitsForDate.map(habit => {
      const record = this.records.find(
        r => r.habitId === habit.id && r.date === date
      );
      return {
        id: habit.id,
        name: habit.name,
        createdAt: habit.createdAt,
        deletedAt: habit.deletedAt,
        scheduledTime: habit.scheduledTime || null,
        isCritical: habit.isCritical || false,
        status: record?.status || 'pending',
        durationMinutes: record?.durationMinutes || null,
        completionTime: record?.completionTime || null,
      };
    });
  }

  async ensureHabitRecordsForDate(date: string): Promise<void> {
    // Get all active habits that should have records for this date
    const habits = this.habits.filter(h => {
      const createdAt = new Date(h.createdAt).toISOString().split('T')[0];
      const deletedAt = h.deletedAt
        ? new Date(h.deletedAt).toISOString().split('T')[0]
        : null;

      return (
        createdAt <= date &&
        (deletedAt === null || deletedAt > date)
      );
    });

    // Create pending records for habits that don't have a record for this date
    for (const habit of habits) {
      const existing = await this.getHabitRecord(habit.id, date);
      if (!existing) {
        await this.createHabitRecord(habit.id, date, 'pending', null, null);
      }
    }
  }

  getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export const webStorage = new WebStorage();

