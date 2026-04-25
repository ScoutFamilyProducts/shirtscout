import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from '@/screens/SplashScreen';
import HomeScreen from '@/screens/HomeScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import { colors } from '@/theme';

type Screen = 'splash' | 'home' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(query: string) {
    setSearchQuery(query);
    setScreen('results');
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {screen === 'splash' && (
          <SplashScreen onDismiss={() => setScreen('home')} />
        )}
        {screen === 'home' && (
          <HomeScreen onSearch={handleSearch} />
        )}
        {screen === 'results' && (
          <ResultsScreen query={searchQuery} onBack={() => setScreen('home')} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
});
