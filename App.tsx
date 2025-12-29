import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import {habitService} from './src/services/habitService';

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

        useEffect(() => {
          // Delay initialization slightly to ensure React Native is fully ready
          const initializeApp = async () => {
            try {
              console.log('🚀 Initializing MyHabit app...');
              // Longer delay to ensure native modules are fully ready
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('📦 Initializing database...');
              await habitService.initialize();
              console.log('✅ App initialized successfully');
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.error('❌ Failed to initialize app:', error);
              console.error('Error details:', error);
              setInitError(errorMessage);
            } finally {
              setInitializing(false);
            }
          };

          initializeApp();
        }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
        <Text style={styles.errorHint}>
          Check the console/logs for more details
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
});

export default App;

