// AllOffersScreen.tsx - Vanilla React Native (No Expo)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import apiService from '../Services/apiService';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const IMAGE_HEIGHT = 240;

type Business = {
  id: string;
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
};

type User = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
};

type ImageInfo = {
  contentType: string;
  size: number;
  originalName: string;
  uploadedAt?: string;
};

type Offer = {
  id: string;
  offerId?: number;
  title: string;
  discount: string;
  category: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  adminStatus?: string;
  offerStatus?: string;
  imageUrl?: string;
  hasImage?: boolean;
  imageInfo?: ImageInfo;
  business?: Business;
  user?: User;
  daysUntilExpiry?: number;
  isExpiringSoon?: boolean;
  isCurrentlyActive?: boolean;
  createdAt?: string;
};

interface AllOffersScreenProps {
  navigation?: any;
}

const AllOffersScreen: React.FC<AllOffersScreenProps> = ({ navigation }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());

  const loadOffers = async (pageNumber: number = 1, isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      const params = { page: pageNumber, limit: 20 };
      const data: any = await apiService.fetchOffers(params);

      console.log('📥 API Response:', {
        totalOffers: data?.offers?.length || 0,
        withImages: data?.statistics?.offersWithImages || 0
      });

      const rawOffers = data?.offers || [];

      const normalizedOffers: Offer[] = rawOffers.map((o: any) => ({
        id: o.id || String(Math.random()),
        offerId: o.offerId,
        title: o.title || 'No Title',
        discount: o.discount || 'Special Offer',
        category: o.category || 'General',
        description: o.description || '',
        startDate: o.startDate,
        endDate: o.endDate,
        isActive: o.isActive ?? true,
        adminStatus: o.adminStatus || 'approved',
        offerStatus: o.offerStatus || 'active',
        imageUrl: o.imageUrl,
        hasImage: o.hasImage ?? false,
        imageInfo: o.imageInfo,
        business: o.business,
        user: o.user,
        daysUntilExpiry: o.daysUntilExpiry,
        isExpiringSoon: o.isExpiringSoon ?? false,
        isCurrentlyActive: o.isCurrentlyActive ?? true,
        createdAt: o.createdAt
      }));

      console.log('✅ Loaded offers:', {
        total: normalizedOffers.length,
        withImages: normalizedOffers.filter(o => o.hasImage).length
      });

      setOffers(prev =>
        pageNumber === 1 ? normalizedOffers : [...prev, ...normalizedOffers]
      );

      const pagination = data?.pagination || {};
      setHasNext(pagination.hasNext ?? false);
      setPage(pageNumber);

    } catch (error) {
      console.error('❌ Error loading offers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOffers();
    
    // Optional: Run diagnostics on first load
    // apiService.runDiagnostics();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setImageErrors(new Set());
    setImageLoading(new Set());
    loadOffers(1, true);
  }, []);

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      loadOffers(page + 1);
    }
  };

  const handleImageError = (offerId: string) => {
    setImageErrors(prev => new Set(prev).add(offerId));
    setImageLoading(prev => {
      const next = new Set(prev);
      next.delete(offerId);
      return next;
    });
    console.log('❌ Image failed for offer:', offerId);
  };

  const handleImageLoadStart = (offerId: string) => {
    setImageLoading(prev => new Set(prev).add(offerId));
  };

  const handleImageLoadEnd = (offerId: string) => {
    setImageLoading(prev => {
      const next = new Set(prev);
      next.delete(offerId);
      return next;
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const handleViewDetails = (offer: Offer) => {
    if (navigation) {
      navigation.navigate('OfferDetails', { offerId: offer.id });
    } else {
      console.log('View offer:', offer.id);
      // If no navigation, you can show an alert or modal
    }
  };

  const renderOfferImage = (item: Offer) => {
    const hasValidImage = item.hasImage && item.imageUrl && !imageErrors.has(item.id);
    const isLoading = imageLoading.has(item.id);

    if (hasValidImage) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.offerImage}
            resizeMode="cover"
            onLoadStart={() => handleImageLoadStart(item.id)}
            onLoadEnd={() => handleImageLoadEnd(item.id)}
            onError={() => handleImageError(item.id)}
          />
          {isLoading && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          {/* Bottom gradient overlay */}
          <View style={styles.imageGradient} />
        </View>
      );
    }

    return (
      <View style={[styles.imagePlaceholder, { backgroundColor: getCategoryColor(item.category) }]}>
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderIcon}>{getCategoryIcon(item.category)}</Text>
          <Text style={styles.placeholderText}>{item.category}</Text>
        </View>
      </View>
    );
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Food': '#FF6B6B',
      'Shopping': '#4ECDC4',
      'Travel': '#45B7D1',
      'Entertainment': '#96CEB4',
      'Health': '#FFEAA7',
      'Beauty': '#FD79A8',
      'Sports': '#74B9FF',
      'Education': '#A29BFE',
    };
    return colors[category] || '#667eea';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      'Food': '🍽️',
      'Shopping': '🛍️',
      'Travel': '✈️',
      'Entertainment': '🎬',
      'Health': '💊',
      'Beauty': '💄',
      'Sports': '⚽',
      'Education': '📚',
    };
    return icons[category] || '🎁';
  };

  const renderOffer = ({ item }: { item: Offer }) => {
    return (
      <TouchableOpacity
        style={styles.offerCard}
        activeOpacity={0.95}
        onPress={() => handleViewDetails(item)}
      >
        {/* Image Section */}
        {renderOfferImage(item)}

        {/* Status Badges */}
        <View style={styles.badgeContainer}>
          {item.isExpiringSoon && (
            <View style={[styles.badge, styles.expiringBadge]}>
              <Text style={styles.badgeText}>⏰ Expiring Soon</Text>
            </View>
          )}
          {item.hasImage && (
            <View style={[styles.badge, styles.imageBadge]}>
              <Text style={styles.badgeText}>📷</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Discount */}
          <View style={styles.discountContainer}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}</Text>
            </View>
          </View>

          {/* Business Info */}
          {item.business && (
            <View style={styles.businessCard}>
              <View style={styles.businessIcon}>
                <Text style={styles.businessIconText}>🏢</Text>
              </View>
              <View style={styles.businessInfo}>
                <Text style={styles.businessName} numberOfLines={1}>
                  {item.business.name}
                </Text>
                {item.business.address && (
                  <Text style={styles.businessAddress} numberOfLines={1}>
                    📍 {item.business.address}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          {item.description && (
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          )}

          {/* Date Info */}
          {(item.startDate || item.endDate) && (
            <View style={styles.dateCard}>
              {item.startDate && (
                <View style={styles.dateRow}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <Text style={styles.dateLabel}>From:</Text>
                  <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
                </View>
              )}
              {item.endDate && (
                <View style={styles.dateRow}>
                  <Text style={styles.dateIcon}>⏰</Text>
                  <Text style={styles.dateLabel}>Until:</Text>
                  <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Days Remaining */}
          {item.daysUntilExpiry !== undefined && item.daysUntilExpiry !== null && (
            <View style={[
              styles.daysCard,
              item.isExpiringSoon && styles.daysCardWarning
            ]}>
              <Text style={styles.daysIcon}>
                {item.daysUntilExpiry > 7 ? '✨' : '⚡'}
              </Text>
              <Text style={[
                styles.daysText,
                item.isExpiringSoon && styles.daysTextWarning
              ]}>
                {item.daysUntilExpiry > 0 
                  ? `${item.daysUntilExpiry} days remaining`
                  : 'Last day! Hurry up!'}
              </Text>
            </View>
          )}

        
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.screenHeader}>
      <View style={styles.headerGradient}>
        <Text style={styles.headerTitle}>✨ Special Offers</Text>
        <Text style={styles.headerSubtitle}>
          {offers.length} exclusive deals just for you
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{offers.length}</Text>
            <Text style={styles.statLabel}>Total Offers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {offers.filter(o => o.hasImage).length}
            </Text>
            <Text style={styles.statLabel}>With Photos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {offers.filter(o => o.isExpiringSoon).length}
            </Text>
            <Text style={styles.statLabel}>Ending Soon</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loading && offers.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.footerLoaderText}>Loading more offers...</Text>
        </View>
      );
    }

    if (hasNext) {
      return (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={styles.loadMoreText}>Load More Offers</Text>
          <Text style={styles.loadMoreIcon}>↓</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.endMessage}>
        <Text style={styles.endIcon}>🎉</Text>
        <Text style={styles.endText}>You've seen all our amazing offers!</Text>
        <Text style={styles.endSubtext}>Check back soon for new deals</Text>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No Offers Available</Text>
        <Text style={styles.emptySubtitle}>
          We're currently updating our offers.{'\n'}
          Pull down to refresh or check back later.
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => loadOffers(1, true)}
        >
          <Text style={styles.emptyButtonText}>🔄 Refresh Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && offers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading Amazing Offers...</Text>
          <Text style={styles.loadingSubtext}>
            Fetching the best deals for you ✨
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <FlatList
        data={offers}
        keyExtractor={(item: Offer) => item.id}
        renderItem={renderOffer}
        
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#667eea', '#764ba2']}
            tintColor="#667eea"
            progressBackgroundColor="#fff"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={offers.length === 0 ? styles.emptyListContainer : styles.listContainer}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
};

export default AllOffersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  screenHeader: {
    marginBottom: 16,
  },
  headerGradient: {
    backgroundColor: '#667eea',
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  offerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    // Simulating gradient with opacity
    opacity: 0.3,
  },
  imagePlaceholder: {
    width: '100%',
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeholderContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiringBadge: {
    backgroundColor: '#FF6B6B',
  },
  imageBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 30,
  },
  discountContainer: {
    marginBottom: 16,
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessIconText: {
    fontSize: 24,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 13,
    color: '#666',
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  dateCard: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginRight: 6,
    minWidth: 45,
  },
  dateValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  daysCard: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  daysCardWarning: {
    backgroundColor: '#FFEBEE',
  },
  daysIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  daysText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
  daysTextWarning: {
    color: '#C62828',
  },
  actionButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  actionButtonIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerLoader: {
    padding: 30,
    alignItems: 'center',
  },
  footerLoaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadMoreButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loadMoreIcon: {
    color: '#fff',
    fontSize: 20,
  },
  endMessage: {
    padding: 40,
    alignItems: 'center',
  },
  endIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  endText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  endSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
});