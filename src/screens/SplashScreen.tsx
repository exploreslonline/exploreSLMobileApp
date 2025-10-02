import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import styles from '../styles/splashScreenStyles';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Home');
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/Logo.png')}
        style={styles.image}
      />
      <Text style={styles.text}>Explore </Text>
      <Text style={styles.boldText}>Sri Lanka</Text>
    </View>
  );
};

export default SplashScreen;