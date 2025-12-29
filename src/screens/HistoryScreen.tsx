import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {habitService} from '../services/habitService';
import {HabitWithStatus} from '../types';
import {database} from '../database/database';

interface HistoryScreenProps {
  navigation: any;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({navigation}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHabitsForDate = async (date: Date) => {
    try {
      setLoading(true);
      const dateString = database.formatDate(date);
      const dateHabits = await habitService.getHabitsForDate(dateString);
      setHabits(dateHabits);
    } catch (error) {
      console.error('Error loading habits for date:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHabitsForDate(selectedDate);
    }, [selectedDate])
  );

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  const formatDuration = (minutes: number | null): string => {
    if (minutes === null) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatTimeDisplay = (time24: string | null): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const renderHabitItem = ({item}: {item: HabitWithStatus}) => (
    <View style={[
      styles.habitItem,
      item.isCritical && styles.criticalHabitItem
    ]}>
      <View style={styles.habitNameContainer}>
        {item.isCritical && (
          <View style={styles.criticalBadge}>
            <Text style={styles.criticalBadgeText}>!</Text>
          </View>
        )}
        <Text style={[
          styles.habitName,
          item.isCritical && styles.criticalHabitName
        ]}>
          {item.name}
        </Text>
      </View>
      {item.scheduledTime && (
        <Text style={styles.scheduledTimeText}>
          Planned: {formatTimeDisplay(item.scheduledTime)}
        </Text>
      )}
      <View style={styles.habitInfo}>
        <View
          style={[
            styles.statusBadge,
            item.status === 'done' ? styles.statusDone : styles.statusPending,
          ]}>
          <Text style={styles.statusText}>
            {item.status === 'done' ? 'Done' : 'Pending'}
          </Text>
        </View>
        {item.status === 'done' && (
          <View style={styles.completionInfo}>
            {item.completionTime && (
              <Text style={styles.completionTimeText}>
                Completed: {formatTimeDisplay(item.completionTime)}
              </Text>
            )}
            {item.durationMinutes !== null && (
              <Text style={styles.durationText}>
                {formatDuration(item.durationMinutes)}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const dateString = formatDate(selectedDate);
  const futureDate = isFutureDate(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>View past days (read-only)</Text>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Today')}>
            <Text style={styles.backButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateSelector}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => changeDate(-1)}>
          <Text style={styles.dateButtonText}>← Previous</Text>
        </TouchableOpacity>

        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>{dateString}</Text>
          {isToday(selectedDate) && (
            <Text style={styles.todayLabel}>(Today)</Text>
          )}
          {futureDate && (
            <Text style={styles.futureLabel}>(Future)</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.dateButton, futureDate && styles.dateButtonDisabled]}
          onPress={() => changeDate(1)}
          disabled={futureDate}>
          <Text
            style={[
              styles.dateButtonText,
              futureDate && styles.dateButtonTextDisabled,
            ]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading...</Text>
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No habits for this date</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabitItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateButton: {
    padding: 8,
    minWidth: 100,
  },
  dateButtonDisabled: {
    opacity: 0.5,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '600',
    textAlign: 'center',
  },
  dateButtonTextDisabled: {
    color: '#999',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  todayLabel: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 2,
  },
  futureLabel: {
    fontSize: 12,
    color: '#ff9800',
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  habitItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#ffeb3b',
  },
  statusDone: {
    backgroundColor: '#4caf50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completionTimeText: {
    fontSize: 13,
    color: '#2196f3',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HistoryScreen;

