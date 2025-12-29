import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {habitService} from '../services/habitService';
import TimePicker from '../components/TimePicker';

interface AddHabitScreenProps {
  navigation: any;
}

const AddHabitScreen: React.FC<AddHabitScreenProps> = ({navigation}) => {
  const [habitName, setHabitName] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [isCritical, setIsCritical] = useState(false);

  const formatTime24 = (date: Date | null): string | null => {
    if (!date) return null;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleCreate = async () => {
    const trimmedName = habitName.trim();
    if (trimmedName === '') {
      Alert.alert('Invalid Input', 'Please enter a habit name');
      return;
    }

    try {
      const timeString = formatTime24(scheduledTime);
      await habitService.createHabit(trimmedName, timeString, isCritical);
      setHabitName('');
      setScheduledTime(null);
      setIsCritical(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add New Habit</Text>
        <Text style={styles.subtitle}>
          Create a habit that will repeat daily
        </Text>

        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={styles.input}
          value={habitName}
          onChangeText={setHabitName}
          placeholder="e.g., Exercise, Read, Meditate"
          autoFocus
        />

        <TimePicker
          value={scheduledTime}
          onChange={setScheduledTime}
          label="Planned Time (Optional)"
          placeholder="Select planned time"
        />
        <Text style={styles.hint}>
          When do you plan to do this habit? (e.g., 6:00 AM for Gym)
        </Text>

        <View style={styles.priorityContainer}>
          <View style={styles.priorityContent}>
            <View style={styles.priorityTextContainer}>
              <Text style={styles.priorityLabel}>Critical Priority</Text>
              <Text style={styles.priorityHint}>
                Critical habits appear at the top until completed
              </Text>
            </View>
            <Switch
              value={isCritical}
              onValueChange={setIsCritical}
              trackColor={{false: '#e0e0e0', true: '#f44336'}}
              thumbColor={isCritical ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreate}>
            <Text style={[styles.buttonText, styles.createButtonText]}>
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  createButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#333',
  },
  createButtonText: {
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: -16,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  priorityContainer: {
    marginBottom: 24,
  },
  priorityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priorityTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priorityHint: {
    fontSize: 12,
    color: '#666',
  },
});

export default AddHabitScreen;

