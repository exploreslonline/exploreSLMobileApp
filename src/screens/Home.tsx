import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Linking, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  Animated,
  Platform
} from 'react-native';
import colors from '../styles/colors';
import Navbar from '../components/Navbar';
import Search from '../components/Search';
import GridView from '../components/GridView';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import apiService from '../Services/apiService';

const { width, height } = Dimensions.get('window');

const Home: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // State for offers popup system
  const [offers, setOffers] = useState<any[]>([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMinimized, setPopupMinimized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatingButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      selector: '.offer-info' 
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

  // Fetch offers on mount
  useEffect(() => {
    fetchOffers();
  }, []);

  // Hide popup when navigating away from Home screen
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused - show popup if it was minimized
      return () => {
        // Screen is unfocused - hide everything
        setShowPopup(false);
        setPopupMinimized(false);
        slideAnim.setValue(height);
        fadeAnim.setValue(0);
        floatingButtonAnim.setValue(0);
      };
    }, [])
  );

  // Auto-shuffle timer (5 seconds per offer)
  useEffect(() => {
    if (!showPopup || popupMinimized || offers.length === 0) return;

    const timer = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [showPopup, popupMinimized, offers.length]);

  // Floating button pulse animation
  useEffect(() => {
    if (popupMinimized) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [popupMinimized]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      
      // Fetch offers from your API
      const params = { page: 1, limit: 10 };
      const data = await apiService.fetchOffers(params);
      
      console.log('📥 Fetched offers for popup:', data?.offers?.length || 0);
      
      const fetchedOffers = data?.offers || [];
      setOffers(fetchedOffers);
      
      // Auto-show popup after loading if offers exist
      if (fetchedOffers.length > 0) {
        setTimeout(() => showOfferPopup(), 2000);
      }
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const showOfferPopup = () => {
    setShowPopup(true);
    setPopupMinimized(false);
    
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideOfferPopup = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPopup(false);
      setPopupMinimized(true);
      showFloatingButton();
    });
  };

  const showFloatingButton = () => {
    Animated.spring(floatingButtonAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handleFloatingButtonPress = () => {
    Animated.timing(floatingButtonAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      showOfferPopup();
    });
  };

  const handleOfferClick = () => {
    // Hide popup and navigate to AllOffers screen
    hideOfferPopup();
    setTimeout(() => {
      navigation.navigate('AllOffers');
    }, 300);
  };

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

  const currentOffer = offers[currentOfferIndex];

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

      {/* Offer Popup Modal - ONLY NEW CODE */}
      {showPopup && currentOffer && (
        <Modal
          visible={showPopup}
          transparent
          animationType="none"
          onRequestClose={hideOfferPopup}
        >
          <Animated.View 
            style={[
              styles.popupOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              style={styles.popupBackdrop}
              activeOpacity={1}
              onPress={hideOfferPopup}
            />

            <Animated.View 
              style={[
                styles.popupContainer,
                {
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hideOfferPopup}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Offer Content */}
              <TouchableOpacity 
                style={styles.offerContent}
                activeOpacity={0.9}
                onPress={handleOfferClick}
              >
                {/* Image Section */}
                {currentOffer.hasImage && currentOffer.imageUrl ? (
                  <View style={styles.imageSection}>
                    <Image
                      source={{ uri: currentOffer.imageUrl }}
                      style={styles.offerImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay} />
                  </View>
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: '#667eea' }]}>
                    <Text style={styles.placeholderIcon}>🎁</Text>
                    <Text style={styles.placeholderCategory}>{currentOffer.category}</Text>
                  </View>
                )}

                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{currentOffer.discount}</Text>
                  <Text style={styles.discountLabel}>SPECIAL OFFER</Text>
                </View>

                {/* Tap to View More */}
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>👆 Tap to view all offers</Text>
                </View>
              </TouchableOpacity>

              {/* Progress Indicators */}
              <View style={styles.progressContainer}>
                {offers.map((_, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.progressDot,
                      index === currentOfferIndex && styles.progressDotActive
                    ]}
                  />
                ))}
              </View>

              {/* Counter */}
              <Text style={styles.counterText}>
                {currentOfferIndex + 1} / {offers.length} offers
              </Text>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      {/* Floating Button (when minimized) - ONLY NEW CODE */}
      {popupMinimized && (
        <Animated.View
          style={[
            styles.floatingButton,
            {
              transform: [
                { scale: floatingButtonAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.floatingButtonInner}
            onPress={handleFloatingButtonPress}
            activeOpacity={0.8}
          >
            <Text style={styles.floatingButtonIcon}>🎁</Text>
            {offers.length > 0 && (
              <View style={styles.floatingBadge}>
                <Text style={styles.floatingBadgeText}>{offers.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ORIGINAL STYLES - UNCHANGED
  container: {
    flex: 1,
    backgroundColor: colors.beachBlue,
  },
  scrollContainer: {
    flex: 1,
  },
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
  searchContainer: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 200,
  },
  contentWrapper: {
    minHeight: 400,
    position: 'relative',
    marginTop: -25,
    marginBottom: 30,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
  },
  bottomSpacing: {
    height: 10,
  },
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

  // NEW STYLES FOR POPUP - ONLY ADDITIONS
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  popupBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  offerContent: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  imageSection: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    width: '100%',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
    marginBottom: 12,
  },
  placeholderCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  discountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  discountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
  },
  tapHint: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tapHintText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#667eea',
    width: 24,
  },
  counterText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  floatingButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingButtonIcon: {
    fontSize: 32,
  },
  floatingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  floatingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Home;