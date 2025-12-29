import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

interface DurationInputProps {
  value: number | null; // total minutes
  onChange: (minutes: number | null) => void;
  label: string;
}

const DurationInput: React.FC<DurationInputProps> = ({value, onChange, label}) => {
  const [hours, setHours] = useState<string>(
    value !== null ? Math.floor(value / 60).toString() : ''
  );
  const [minutes, setMinutes] = useState<string>(
    value !== null ? (value % 60).toString() : ''
  );

  const handleHoursChange = (text: string) => {
    const num = text === '' ? '' : parseInt(text, 10);
    if (text === '' || (!isNaN(num) && num >= 0 && num <= 23)) {
      setHours(text);
      updateTotalMinutes(text, minutes);
    }
  };

  const handleMinutesChange = (text: string) => {
    const num = text === '' ? '' : parseInt(text, 10);
    if (text === '' || (!isNaN(num) && num >= 0 && num < 60)) {
      setMinutes(text);
      updateTotalMinutes(hours, text);
    }
  };

  const updateTotalMinutes = (hrs: string, mins: string) => {
    if (hrs === '' && mins === '') {
      onChange(null);
      return;
    }
    const h = hrs === '' ? 0 : parseInt(hrs, 10);
    const m = mins === '' ? 0 : parseInt(mins, 10);
    if (!isNaN(h) && !isNaN(m)) {
      const total = h * 60 + m;
      onChange(total > 0 ? total : null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={hours}
            onChangeText={handleHoursChange}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <Text style={styles.unitText}>hours</Text>
        </View>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={minutes}
            onChangeText={handleMinutesChange}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <Text style={styles.unitText}>mins</Text>
        </View>
      </View>
      <Text style={styles.hint}>
        How long did this take? (e.g., 1 hour 30 mins)
      </Text>
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
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
    textAlign: 'center',
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default DurationInput;

