import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// Expose debug functions to global scope for debugging
if (__DEV__) {
  // Import and expose immediately (synchronous)
  const setupDebugUtils = async () => {
    try {
      const {debugDatabase} = await import('./src/utils/debugDatabase');
      const {querySQL, queryAllHabits, queryAllRecords, queryHabitsForDate, queryHabitById, queryRecordsByHabitId} = await import('./src/utils/queryDatabase');
      
      // Expose to global
      global.debugDatabase = debugDatabase;
      global.querySQL = querySQL;
      global.queryAllHabits = queryAllHabits;
      global.queryAllRecords = queryAllRecords;
      global.queryHabitsForDate = queryHabitsForDate;
      global.queryHabitById = queryHabitById;
      global.queryRecordsByHabitId = queryRecordsByHabitId;
      
      console.log('🔧 Debug functions loaded! Available in console:');
      console.log('  - debugDatabase()');
      console.log('  - querySQL(sql, params)');
      console.log('  - queryAllHabits()');
      console.log('  - queryAllRecords()');
    } catch (error) {
      console.error('Failed to load debug utils:', error);
    }
  };
  
  setupDebugUtils();
}

registerRootComponent(App);
