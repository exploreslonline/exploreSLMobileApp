import React, {useState} from 'react';
import {View, Image, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import colors from '../styles/colors';
import {RootStackParamList} from '../types/navigation';
import Menu from './Menu';

const Navbar: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHomeScreen = route.name === 'Home';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <View
        style={[
          styles.container,
          isHomeScreen ? styles.homeContainer : styles.otherContainer,
        ]}>
        {isHomeScreen ? (
          <Image
            source={require('../assets/Logo.png')}
            style={styles.logo}
          />
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}>
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={isHomeScreen ? styles.menuButtonText : styles.menuText}>
            Menu
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Always render the Menu component */}
      <Menu isOpen={isMenuOpen} toggleDropdown={toggleMenu} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    width: '100%',
  },
  homeContainer: {
    backgroundColor: colors.beachBlue,
  },
  otherContainer: {
    backgroundColor: colors.beachBlue,
  },
  logo: {
    width: 50,
    height: 50,
  },
  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderWidth: 2,
    borderColor: colors.white,
    width: 100,
    borderRadius: 50,
  },
  menuButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: colors.white,
    fontSize: 16,
  },
});

export default Navbar;
