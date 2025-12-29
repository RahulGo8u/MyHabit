import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {habitService} from '../services/habitService';
import {HabitWithStatus} from '../types';
import TimePicker from '../components/TimePicker';
import DurationInput from '../components/DurationInput';

interface TodayScreenProps {
  navigation: any;
}

const TodayScreen: React.FC<TodayScreenProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTimeModalVisible, setEditTimeModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitWithStatus | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState<Date | null>(null);
  const [editScheduledTime, setEditScheduledTime] = useState<Date | null>(null);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const todayHabits = await habitService.getTodayHabits();
      setHabits(todayHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
      Alert.alert('Error', 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const handleMarkDone = (habit: HabitWithStatus) => {
    setSelectedHabit(habit);
    setDurationMinutes(null);
    setCompletionTime(null);
    setModalVisible(true);
  };
  
  const handleEditScheduledTime = (habit: HabitWithStatus) => {
    setSelectedHabit(habit);
    // Parse scheduled time if it exists
    if (habit.scheduledTime) {
      const [hours, mins] = habit.scheduledTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, mins, 0, 0);
      setEditScheduledTime(date);
    } else {
      setEditScheduledTime(null);
    }
    setEditTimeModalVisible(true);
  };
  
  const handleSaveScheduledTime = async () => {
    if (!selectedHabit) return;
    
    const formatTime24 = (date: Date | null): string | null => {
      if (!date) return null;
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    try {
      const timeString = formatTime24(editScheduledTime);
      await habitService.updateHabitScheduledTime(selectedHabit.id, timeString);
      setEditTimeModalVisible(false);
      setSelectedHabit(null);
      setEditScheduledTime(null);
      await loadHabits();
    } catch (error) {
      console.error('Error updating scheduled time:', error);
      Alert.alert('Error', 'Failed to update scheduled time');
    }
  };

  const handleConfirmDone = async () => {
    if (!selectedHabit) return;

    const formatTime24 = (date: Date | null): string | null => {
      if (!date) return null;
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const completionTimeString = formatTime24(completionTime);

    try {
      await habitService.markHabitDone(selectedHabit.id, durationMinutes, completionTimeString);
      setModalVisible(false);
      setSelectedHabit(null);
      setDurationMinutes(null);
      setCompletionTime(null);
      await loadHabits();
    } catch (error) {
      console.error('Error marking habit done:', error);
      Alert.alert('Error', 'Failed to mark habit as done');
    }
  };

  const handleMarkPending = (habit: HabitWithStatus) => {
    Alert.alert(
      'Mark as Pending',
      `Are you sure you want to mark "${habit.name}" as pending? This will reset its completion status.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Mark Pending',
          style: 'default',
          onPress: async () => {
            try {
              await habitService.markHabitPending(habit.id);
              await loadHabits();
            } catch (error) {
              console.error('Error marking habit pending:', error);
              Alert.alert('Error', 'Failed to update habit status');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (habit: HabitWithStatus) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This will remove it from today and all future days.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await habitService.deleteHabit(habit.id);
              await loadHabits();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
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

  const renderHabitItem = ({item}: {item: HabitWithStatus}) => {
    const isDone = item.status === 'done';
    return (
    <View style={[
      styles.habitItem,
      item.isCritical && styles.criticalHabitItem,
      item.isCritical && isDone && styles.criticalHabitItemDone
    ]}>
      <View style={styles.habitContent}>
        <View style={styles.habitHeader}>
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
          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.editTimeButton}
              onPress={() => handleEditScheduledTime(item)}>
              <Text style={styles.editTimeButtonText}>
                {item.scheduledTime ? 'Edit Time' : 'Set Time'}
              </Text>
            </TouchableOpacity>
          )}
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
      <View style={styles.habitActions}>
              {item.status === 'pending' ? (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleMarkDone(item)}>
                  <Text style={styles.actionButtonText}>Mark Done</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.markPendingButton]}
                  onPress={() => handleMarkPending(item)}>
                  <Text style={[styles.actionButtonText, styles.markPendingButtonText]}>Mark Pending</Text>
                </TouchableOpacity>
              )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}>
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const today = new Date();
  const todayString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 20)}]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.date}>{todayString}</Text>
          </View>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('History')}>
            <Text style={styles.historyButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading...</Text>
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No habits yet. Add one to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabitItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddHabit')}>
        <Text style={styles.addButtonText}>+ Add Habit</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Habit</Text>
              <Text style={styles.modalSubtitle}>{selectedHabit?.name}</Text>
            </View>

            <View style={styles.modalForm}>
              <TimePicker
                value={completionTime}
                onChange={setCompletionTime}
                label="Completion Time (Optional)"
                placeholder="Select completion time"
              />

              <DurationInput
                value={durationMinutes}
                onChange={setDurationMinutes}
                label="Duration (Optional)"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedHabit(null);
                  setDurationMinutes(null);
                  setCompletionTime(null);
                }}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmDone}>
                <Text style={styles.modalConfirmButtonText}>Mark Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Scheduled Time Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editTimeModalVisible}
        onRequestClose={() => setEditTimeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Planned Time</Text>
              <Text style={styles.modalSubtitle}>{selectedHabit?.name}</Text>
            </View>

            <View style={styles.modalForm}>
              <TimePicker
                value={editScheduledTime}
                onChange={setEditScheduledTime}
                label="Planned Time"
                placeholder="Select planned time"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setEditTimeModalVisible(false);
                  setSelectedHabit(null);
                  setEditScheduledTime(null);
                }}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleSaveScheduledTime}>
                <Text style={styles.modalConfirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  historyButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  historyButtonText: {
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
  date: {
    fontSize: 16,
    color: '#666',
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
  habitContent: {
    marginBottom: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  criticalHabitName: {
    color: '#f44336',
  },
  criticalHabitItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    backgroundColor: '#fff5f5',
  },
  criticalHabitItemDone: {
    backgroundColor: '#f5f5f5',
    opacity: 0.9,
  },
  criticalBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  criticalBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  editTimeButtonText: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '600',
  },
  scheduledTimeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
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
    gap: 8,
  },
  completionTimeText: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  markPendingButton: {
    backgroundColor: '#757575',
  },
  markPendingButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  deleteButtonText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#2196f3',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalForm: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalConfirmButton: {
    backgroundColor: '#2196f3',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});

export default TodayScreen;

