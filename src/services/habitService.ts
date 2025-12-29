import {database} from '../database/database';
import {Habit, HabitWithStatus, HabitRecord} from '../types';

export class HabitService {
  async initialize(): Promise<void> {
    await database.init();
  }

  async createHabit(
    name: string,
    scheduledTime: string | null = null,
    isCritical: boolean = false
  ): Promise<number> {
    return await database.createHabit(name, scheduledTime, isCritical);
  }
  
  async updateHabitScheduledTime(habitId: number, scheduledTime: string | null): Promise<void> {
    return await database.updateHabitScheduledTime(habitId, scheduledTime);
  }

  async getTodayHabits(): Promise<HabitWithStatus[]> {
    const today = database.getTodayDateString();
    await database.ensureHabitRecordsForDate(today);
    const habits = await database.getHabitsForDate(today);
    
    // Auto-log database data (always visible in terminal)
    console.log('📊 ===== DATABASE DATA =====');
    console.log('All Habits:', JSON.stringify(await database.getAllHabitsForDebug(), null, 2));
    console.log('All Records:', JSON.stringify(await database.getAllRecordsForDebug(), null, 2));
    console.log("Today's Habits:", JSON.stringify(habits, null, 2));
    console.log('📊 ===== END =====');
    
    const mappedHabits = habits.map(this.mapToHabitWithStatus);
    return this.sortHabits(mappedHabits);
  }

  async getHabitsForDate(date: string): Promise<HabitWithStatus[]> {
    await database.ensureHabitRecordsForDate(date);
    const habits = await database.getHabitsForDate(date);
    return habits.map(this.mapToHabitWithStatus);
  }

  async markHabitDone(
    habitId: number,
    durationMinutes: number | null,
    completionTime: string | null = null
  ): Promise<void> {
    const today = database.getTodayDateString();
    await database.updateHabitRecord(habitId, today, 'done', durationMinutes, completionTime);
  }

  async markHabitPending(habitId: number): Promise<void> {
    const today = database.getTodayDateString();
    await database.updateHabitRecord(habitId, today, 'pending', null, null);
  }

  async deleteHabit(habitId: number): Promise<void> {
    await database.deleteHabit(habitId);
  }

  private mapToHabitWithStatus(row: any): HabitWithStatus {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      deletedAt: row.deletedAt,
      scheduledTime: row.scheduledTime || null,
      isCritical: row.isCritical === 1 || row.isCritical === true,
      status: row.status || 'pending',
      durationMinutes: row.durationMinutes || null,
      completionTime: row.completionTime || null,
    };
  }
  
  // Sort habits: critical pending > non-critical pending > completed (by planned time)
  sortHabits(habits: HabitWithStatus[]): HabitWithStatus[] {
    return habits.sort((a, b) => {
      // First: Separate pending and done
      if (a.status === 'pending' && b.status === 'done') return -1;
      if (a.status === 'done' && b.status === 'pending') return 1;
      
      // Both pending: critical first, then by scheduled time
      if (a.status === 'pending' && b.status === 'pending') {
        if (a.isCritical && !b.isCritical) return -1;
        if (!a.isCritical && b.isCritical) return 1;
        // Both same criticality, sort by scheduled time
        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        if (a.scheduledTime) return -1;
        if (b.scheduledTime) return 1;
        return 0;
      }
      
      // Both done: sort by scheduled time
      if (a.status === 'done' && b.status === 'done') {
        if (a.scheduledTime && b.scheduledTime) {
          return a.scheduledTime.localeCompare(b.scheduledTime);
        }
        if (a.scheduledTime) return -1;
        if (b.scheduledTime) return 1;
        return 0;
      }
      
      return 0;
    });
  }
}

export const habitService = new HabitService();

