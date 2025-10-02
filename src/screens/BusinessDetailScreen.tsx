// screens/BusinessDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import colors from '../styles/colors';

type BusinessDetailRouteProp = RouteProp<RootStackParamList, 'BusinessDetail'>;
type BusinessDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BusinessDetail'>;

interface Business {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface BusinessOffer {
  id: string;
  title: string;
  discount: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

interface ApiResponse {
  success: boolean;
  business?: Business;
  offers?: BusinessOffer[];
  message?: string;
}

const BusinessDetailScreen: React.FC = () => {
  const navigation = useNavigation<BusinessDetailNavigationProp>();
  const route = useRoute<BusinessDetailRouteProp>();
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { businessId, businessName } = route.params;
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    loadBusinessDetails();
  }, [businessId]);

  const loadBusinessDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/api/mobile/businesses/${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch business details');
      }

      setBusiness(data.business || null);
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error loading business details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', 'Failed to load business details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (type: 'phone' | 'email' | 'website'): void => {
    if (!business) return;

    switch (type) {
      case 'phone':
        if (business.phone) {
          Linking.openURL(`tel:${business.phone}`).catch(() => {
            Alert.alert('Error', 'Unable to make phone call');
          });
        }
        break;
      case 'email':
        if (business.email) {
          Linking.openURL(`mailto:${business.email}`).catch(() => {
            Alert.alert('Error', 'Unable to open email app');
          });
        }
        break;
      case 'website':
        if (business.website) {
          const url = business.website.startsWith('http') 
            ? business.website
            : `https://${business.website}`;
          Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to open website');
          });
        }
        break;
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No expiry';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.beachBlue} />
        <Text style={styles.loadingText}>Loading business details...</Text>
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Details</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Load Business</Text>
          <Text style={styles.errorSubtitle}>
            {error || 'Business information not available'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadBusinessDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {business.name}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Business Info Card */}
        <View style={styles.businessCard}>
          <Text style={styles.businessName}>{business.name}</Text>
          
          {business.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{business.category}</Text>
            </View>
          )}

          {business.description && (
            <Text style={styles.businessDescription}>{business.description}</Text>
          )}

          {business.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Address:</Text>
              <Text style={styles.infoValue}>{business.address}</Text>
            </View>
          )}
        </View>

        {/* Contact Buttons */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Business</Text>
          <View style={styles.contactButtons}>
            {business.phone && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('phone')}
              >
                <Text style={styles.contactButtonText}>📞 Call</Text>
              </TouchableOpacity>
            )}
            
            {business.email && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('email')}
              >
                <Text style={styles.contactButtonText}>✉️ Email</Text>
              </TouchableOpacity>
            )}
            
            {business.website && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('website')}
              >
                <Text style={styles.contactButtonText}>🌐 Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Business Offers */}
        {offers.length > 0 && (
          <View style={styles.offersSection}>
            <Text style={styles.sectionTitle}>Current Offers</Text>
            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerDiscount}>{offer.discount} OFF</Text>
                </View>
                
                {offer.description && (
                  <Text style={styles.offerDescription}>{offer.description}</Text>
                )}
                
                <View style={styles.offerDates}>
                  <Text style={styles.dateText}>
                    Valid until: {formatDate(offer.end_date)}
                  </Text>
                  {offer.is_active && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: colors.beachBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoryContainer: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  categoryText: {
    fontSize: 14,
    color: colors.beachBlue,
    fontWeight: '600',
  },
  businessDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  contactSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  contactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactButton: {
    backgroundColor: colors.beachBlue,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  offersSection: {
    marginBottom: 20,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  offerDiscount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    backgroundColor: '#ffeaea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offerDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    marginBottom: 8,
  },
  offerDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  activeBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 10,
    color: '#155724',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.beachBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BusinessDetailScreen;