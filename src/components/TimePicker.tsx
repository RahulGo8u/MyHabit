import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  value: Date | null;
  onChange: (time: Date | null) => void;
  label: string;
  placeholder?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatTime24 = (date: Date | null): string => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedTime) {
      onChange(selectedTime);
    }
  };

  const clearTime = () => {
    onChange(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.timePickerContainer}>
        <TouchableOpacity
          style={[styles.timeButton, !value && styles.timeButtonPlaceholder]}
          onPress={() => setShowPicker(true)}>
          <Text style={[styles.timeText, !value && styles.timeTextPlaceholder]}>
            {value ? formatTime(value) : placeholder}
          </Text>
        </TouchableOpacity>
        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={clearTime}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.iosPickerActions}>
          <TouchableOpacity
            style={styles.iosPickerButton}
            onPress={() => setShowPicker(false)}>
            <Text style={styles.iosPickerButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  timeButtonPlaceholder: {
    borderColor: '#d0d0d0',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeTextPlaceholder: {
    color: '#999',
    fontWeight: '400',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
  iosPickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iosPickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iosPickerButtonText: {
    color: '#2196f3',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimePicker;

