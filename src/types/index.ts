export interface Habit {
  id: number;
  name: string;
  createdAt: string; // ISO date string
  deletedAt: string | null; // ISO date string, null if not deleted
  scheduledTime: string | null; // HH:MM format (24-hour), e.g., "06:00" or "18:30"
  isCritical: boolean; // Whether this habit is critical/priority
}

export interface HabitRecord {
  id: number;
  habitId: number;
  date: string; // YYYY-MM-DD format
  status: 'pending' | 'done';
  durationMinutes: number | null;
  completionTime: string | null; // HH:MM format (24-hour) or HH:MM AM/PM
}

export type HabitWithStatus = Habit & {
  status: 'pending' | 'done';
  durationMinutes: number | null;
  completionTime: string | null;
};

