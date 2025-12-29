import {Platform} from 'react-native';
import {webStorage} from './webStorage';

const DATABASE_NAME = 'MyHabit.db';

// Database interface that works on both native and web
class Database {
  private db: any = null;
  private isWeb = Platform.OS === 'web';
  private SQLite: any = null;

  async init(): Promise<void> {
    try {
      if (this.isWeb) {
        console.log('🌐 Using web storage (localStorage)');
        await webStorage.init();
        return;
      }

      // Dynamically import SQLite only on native platforms
      if (!this.SQLite) {
        this.SQLite = require('expo-sqlite');
      }

      console.log('📂 Opening database:', DATABASE_NAME);
      
      // Ensure we close any existing connection first
      if (this.db) {
        try {
          await this.db.closeAsync();
        } catch (e) {
          // Ignore errors when closing
        }
      }
      
      this.db = await this.SQLite.openDatabaseAsync(DATABASE_NAME);
      
      if (!this.db) {
        throw new Error('Failed to open database - database object is null');
      }
      
      console.log('✅ Database opened successfully');
      await this.createTables();
      console.log('✅ Database tables created/verified');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Reset db to null on error
      this.db = null;
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    // Habits table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        deletedAt TEXT,
        scheduledTime TEXT,
        isCritical INTEGER DEFAULT 0
      );
    `);
    
    // Add scheduledTime column if it doesn't exist (for existing databases)
    try {
      await this.db.execAsync(`
        ALTER TABLE habits ADD COLUMN scheduledTime TEXT;
      `);
    } catch (error) {
      // Column already exists, ignore
    }
    
    // Add isCritical column if it doesn't exist (for existing databases)
    try {
      await this.db.execAsync(`
        ALTER TABLE habits ADD COLUMN isCritical INTEGER DEFAULT 0;
      `);
    } catch (error) {
      // Column already exists, ignore
    }

    // Habit records table (daily status)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habitId INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        durationMinutes INTEGER,
        completionTime TEXT,
        FOREIGN KEY (habitId) REFERENCES habits(id),
        UNIQUE(habitId, date)
      );
    `);
    
    // Add completionTime column if it doesn't exist (for existing databases)
    try {
      await this.db.execAsync(`
        ALTER TABLE habit_records ADD COLUMN completionTime TEXT;
      `);
    } catch (error) {
      // Column already exists, ignore
    }

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_habit_records_date ON habit_records(date);
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_habit_records_habitId ON habit_records(habitId);
    `);
  }

  // Habit operations
  async createHabit(
    name: string,
    scheduledTime: string | null = null,
    isCritical: boolean = false
  ): Promise<number> {
    if (this.isWeb) {
      return await webStorage.createHabit(name, scheduledTime, isCritical);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    try {
      const now = new Date().toISOString();
      const result = await this.db.runAsync(
        'INSERT INTO habits (name, createdAt, deletedAt, scheduledTime, isCritical) VALUES (?, ?, ?, ?, ?)',
        [name, now, null, scheduledTime, isCritical ? 1 : 0]
      );

      const habitId = result.lastInsertRowId;
      
      // Create today's record for the new habit
      const today = this.getTodayDateString();
      await this.createHabitRecord(habitId, today, 'pending', null, null);

      return habitId;
    } catch (error: any) {
      console.error('❌ Error creating habit:', error);
      // If database connection is lost, try to reinitialize
      if (error && typeof error === 'object' && 'message' in error && 
          (error.message.includes('NullPointerException') || error.message.includes('prepareAsync'))) {
        console.log('🔄 Attempting to reinitialize database...');
        this.db = null;
        await this.init();
        if (!this.db) {
          throw new Error('Database reinitialization failed');
        }
        // Retry once
        const now = new Date().toISOString();
        const result = await this.db.runAsync(
          'INSERT INTO habits (name, createdAt, deletedAt, scheduledTime, isCritical) VALUES (?, ?, ?, ?, ?)',
          [name, now, null, scheduledTime, isCritical ? 1 : 0]
        );
        const habitId = result.lastInsertRowId;
        const today = this.getTodayDateString();
        await this.createHabitRecord(habitId, today, 'pending', null, null);
        return habitId;
      }
      throw error;
    }
  }
  
  async updateHabitScheduledTime(habitId: number, scheduledTime: string | null): Promise<void> {
    if (this.isWeb) {
      return await webStorage.updateHabitScheduledTime(habitId, scheduledTime);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    await this.db.runAsync(
      'UPDATE habits SET scheduledTime = ? WHERE id = ?',
      [scheduledTime, habitId]
    );
  }

  async getAllActiveHabits(): Promise<any[]> {
    if (this.isWeb) {
      return await webStorage.getAllActiveHabits();
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    const result = await this.db.getAllAsync(
      'SELECT * FROM habits WHERE deletedAt IS NULL ORDER BY createdAt ASC'
    );
    return result;
  }

  async deleteHabit(habitId: number): Promise<void> {
    if (this.isWeb) {
      return await webStorage.deleteHabit(habitId);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    const today = this.getTodayDateString();
    await this.db.runAsync(
      'UPDATE habits SET deletedAt = ? WHERE id = ?',
      [today, habitId]
    );
  }

  // Habit record operations
  async createHabitRecord(
    habitId: number,
    date: string,
    status: 'pending' | 'done',
    durationMinutes: number | null,
    completionTime: string | null = null
  ): Promise<void> {
    if (this.isWeb) {
      return await webStorage.createHabitRecord(habitId, date, status, durationMinutes, completionTime);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    await this.db.runAsync(
      `INSERT OR REPLACE INTO habit_records (habitId, date, status, durationMinutes, completionTime)
       VALUES (?, ?, ?, ?, ?)`,
      [habitId, date, status, durationMinutes, completionTime]
    );
  }

  async getHabitRecord(habitId: number, date: string): Promise<any | null> {
    if (this.isWeb) {
      return await webStorage.getHabitRecord(habitId, date);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    const result = await this.db.getFirstAsync(
      'SELECT * FROM habit_records WHERE habitId = ? AND date = ?',
      [habitId, date]
    );

    return result || null;
  }

  async updateHabitRecord(
    habitId: number,
    date: string,
    status: 'pending' | 'done',
    durationMinutes: number | null,
    completionTime: string | null = null
  ): Promise<void> {
    if (this.isWeb) {
      return await webStorage.updateHabitRecord(habitId, date, status, durationMinutes, completionTime);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    await this.db.runAsync(
      `UPDATE habit_records 
       SET status = ?, durationMinutes = ?, completionTime = ? 
       WHERE habitId = ? AND date = ?`,
      [status, durationMinutes, completionTime, habitId, date]
    );
  }

  async getHabitsForDate(date: string): Promise<any[]> {
    if (this.isWeb) {
      return await webStorage.getHabitsForDate(date);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    // Get all habits that existed on or before this date (not deleted before this date)
    // Use DATE() function to extract date part from ISO timestamp for comparison
    const result = await this.db.getAllAsync(
      `SELECT h.*, 
              COALESCE(hr.status, 'pending') as status,
              hr.durationMinutes,
              hr.completionTime
       FROM habits h
       LEFT JOIN habit_records hr ON h.id = hr.habitId AND hr.date = ?
       WHERE DATE(h.createdAt) <= ? 
         AND (h.deletedAt IS NULL OR DATE(h.deletedAt) > ?)
       ORDER BY h.createdAt ASC`,
      [date, date, date]
    );
    
    // Ensure scheduledTime is included (for backward compatibility)
    return result.map((row: any) => ({
      ...row,
      scheduledTime: row.scheduledTime || null,
    }));

    return result;
  }

  async ensureHabitRecordsForDate(date: string): Promise<void> {
    if (this.isWeb) {
      return await webStorage.ensureHabitRecordsForDate(date);
    }

    if (!this.db) {
      console.error('❌ Database not initialized, attempting to reinitialize...');
      await this.init();
      if (!this.db) {
        throw new Error('Database initialization failed');
      }
    }

    // Get all active habits that should have records for this date
    // Use DATE() function to extract date part from ISO timestamp for comparison
    const habits = await this.db.getAllAsync(
      `SELECT id FROM habits 
       WHERE DATE(createdAt) <= ? 
         AND (deletedAt IS NULL OR DATE(deletedAt) > ?)`,
      [date, date]
    );

    // Create pending records for habits that don't have a record for this date
    for (const habit of habits) {
      const habitId = (habit as any).id;
      const existing = await this.getHabitRecord(habitId, date);
      if (!existing) {
        await this.createHabitRecord(habitId, date, 'pending', null, null);
      }
    }
  }

  getTodayDateString(): string {
    if (this.isWeb) {
      return webStorage.getTodayDateString();
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatDate(date: Date): string {
    if (this.isWeb) {
      return webStorage.formatDate(date);
    }
    return date.toISOString().split('T')[0];
  }

  // Debug method: Get all habits (including deleted)
  async getAllHabitsForDebug(): Promise<any[]> {
    if (this.isWeb) {
      // For web, we need to access webStorage directly
      const habitsJson = localStorage.getItem('myhabit_habits');
      return habitsJson ? JSON.parse(habitsJson) : [];
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM habits ORDER BY createdAt ASC'
    );
    return result;
  }

  // Debug method: Get all records
  async getAllRecordsForDebug(): Promise<any[]> {
    if (this.isWeb) {
      const recordsJson = localStorage.getItem('myhabit_records');
      return recordsJson ? JSON.parse(recordsJson) : [];
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(
      'SELECT * FROM habit_records ORDER BY date DESC, habitId ASC'
    );
    return result;
  }

  // Debug method: Run custom SQL query
  async runQuery(sql: string, params: any[] = []): Promise<any[]> {
    if (this.isWeb) {
      console.warn('⚠️ Custom SQL queries not supported on web');
      return [];
    }

    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
  }

  // Debug method: Show all database data
  async debug(): Promise<void> {
    try {
      console.log('🔍 ===== DATABASE DEBUG INFO =====');
      
      const allHabitsRaw = await this.getAllHabitsForDebug();
      console.log('📋 All Habits (Raw):', JSON.stringify(allHabitsRaw, null, 2));
      
      const allHabits = await this.getAllActiveHabits();
      console.log('📋 All Active Habits:', JSON.stringify(allHabits, null, 2));
      
      const allRecords = await this.getAllRecordsForDebug();
      console.log('📊 All Records:', JSON.stringify(allRecords, null, 2));
      
      const today = this.getTodayDateString();
      const todayHabits = await this.getHabitsForDate(today);
      console.log('📅 Today\'s Habits:', JSON.stringify(todayHabits, null, 2));
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = this.formatDate(yesterday);
      const yesterdayHabits = await this.getHabitsForDate(yesterdayStr);
      console.log('📆 Yesterday\'s Habits:', JSON.stringify(yesterdayHabits, null, 2));
      
      console.log('🔍 ===== END DATABASE DEBUG =====');
    } catch (error) {
      console.error('❌ Error debugging database:', error);
      throw error;
    }
  }
}

export const database = new Database();

// Expose database to global for easy console access
if (__DEV__) {
  (global as any).db = database;
  console.log('🔧 Database available! Use db.debug() in console to see all data');
}
