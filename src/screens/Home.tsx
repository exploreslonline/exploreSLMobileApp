import React from 'react';
import { View, Text, StyleSheet, Image, Linking, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import colors from '../styles/colors';
import Navbar from '../components/Navbar';
import Search from '../components/Search';
import GridView from '../components/GridView';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');


const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Keep the original items array with enhanced styling info
  const items = [
    { 
      title: 'Top destination', 
      subtitle: 'Explore amazing places',
      icon: '🏝️',
      selector: '.destinations-info' 
    },
    { 
      title: 'Visa information', 
      subtitle: 'Process & requirements',
      icon: '📋',
      selector: '.visa-info' 
    },
    { 
      title: 'Offers', 
      subtitle: 'New Offers',
      icon: '📅',
      selector: '.weather-info' 
    },
    { 
      title: 'Public transport', 
      subtitle: 'Bus and train info',
      icon: '🚌',
      selector: '.transport-info' 
    },
    { 
      title: 'Hotels and resorts', 
      subtitle: 'Accommodation options',
      icon: '🏨',
      selector: '.bookings-info' 
    },
    { 
      title: 'Rent tuk tuk or bike', 
      subtitle: 'Find rentals near you',
      icon: '🛺',
      selector: '.transportation-info' 
    },
  ];

 
  

  // Keep original function logic
  const handleGridItemPress = (item: { title: string; selector: string }) => {
    if (item.selector === '.transportation-info') {
      Linking.openURL('https://tuktukrental.com/');
    } else {
      navigation.navigate('Details', {
        title: item.title,
        selector: item.selector,
      });
    }
  };

  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section - New design with original Navbar */}
        <View style={styles.header}>
         
          
          {/* Use original Navbar component instead of menu button */}
          <View style={styles.navbarContainer}>
            <Navbar />
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.mainTitle}>
              Explore 
              <Text style={styles.highlight}> Sri Lanka</Text>
            </Text>
            <Text style={styles.subText}>
              The tropical gem in the Indian Ocean{"\n"}
              and South Asia's <Text style={styles.bold}>No1</Text> destination in 2025
            </Text>
          </View>
        </View>

        {/* Content Container with fixed position for GridView */}
        <View style={styles.contentWrapper}>
          {/* Search Section - Positioned absolutely to overlay */}
          <View style={styles.searchContainer}>
            <Search />
          </View>
          
          <View style={styles.contentContainer}>
            {/* Keep original GridView component but pass enhanced items */}
            <GridView items={items} onItemPress={handleGridItemPress} />
          </View>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beachBlue,
  },
  scrollContainer: {
    flex: 1,
  },
  // New header styles from second code
  header: {
    width: '100%',
    backgroundColor: colors.beachBlue,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    minHeight: 'auto',
  },
  elephantText: {
    fontSize: 24,
    color: '#fff',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom:40,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  highlight: {
    color: '#fff',
  },
  subText: {
    fontSize: 16,
    color: '#f2f2f2',
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  navbarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  // Search container positioned absolutely within contentWrapper
  searchContainer: {
    position: 'absolute',
    top: -50, // Position it to overlap header bottom
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 200, // High z-index to appear above GridView
  },
  // Wrapper to control GridView positioning
  contentWrapper: {
    minHeight: 400, // Fixed minimum height to prevent GridView from moving
    position: 'relative', // Important for absolute positioning of search
    marginTop: -25, // Maintain original spacing
    marginBottom: 30,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 45, // Space for search bar
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  // Remove old image and text styles, keep original spacing
  bottomSpacing: {
    height: 10,
  },
  // Bottom navigation styles from second code
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingBottom: 20,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomNavIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  bottomNavText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bottomNavTextActive: {
    color: colors.beachBlue,
    fontWeight: 'bold',
  },
});

export default Home;