// AllOffersScreen.tsx
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
} from 'react-native';
import apiService from '../Services/apiService';

type Offer = {
  id: string;
  title: string;
  discount: string;
  category: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  adminStatus?: string;
};

const AllOffersScreen: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);

  const loadOffers = async (pageNumber: number = 1, refreshing = false) => {
    try {
      if (!refreshing) setLoading(true);

      const params = { page: pageNumber, limit: 20 };
      const data: any = await apiService.fetchOffers(params);

      console.log('API Response:', JSON.stringify(data, null, 2)); // Debug log

      // Normalize backend response
      const rawOffers = data?.offers || data?.data || data?.results || [];

      console.log('Raw offers:', JSON.stringify(rawOffers.slice(0, 2), null, 2)); // Debug log

      // Map MongoDB data to our Offer interface
      const normalizedOffers: Offer[] = rawOffers.map((o: any) => ({
        id: o.id || o._id || String(Math.random()),
        title: o.title || 'No Title',
        discount: o.discount || 'No Discount Info',
        category: o.category || 'Uncategorized',
        description: o.description || '',
        price: o.price || 0,
        isActive: o.isActive || false,
        adminStatus: o.adminStatus || 'unknown'
      }));

      console.log('Normalized offers:', JSON.stringify(normalizedOffers.slice(0, 2), null, 2)); // Debug log

      setOffers(prev =>
        pageNumber === 1 ? normalizedOffers : [...prev, ...normalizedOffers]
      );

      // Handle pagination flags
      const pagination = data?.pagination || {};
      setHasNext(pagination.hasNext ?? false);
      setPage(pageNumber);

    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOffers(1, true);
  }, []);

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      loadOffers(page + 1);
    }
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <View style={styles.offerCard}>
      <Text style={styles.offerTitle}>{item.title}</Text>
      <View style={styles.offerDetails}>
        <Text style={styles.offerLabel}>Discount:</Text>
        <Text style={styles.offerDiscount}>{item.discount}</Text>
      </View>
      <View style={styles.offerDetails}>
        <Text style={styles.offerLabel}>Category:</Text>
        <Text style={styles.offerCategory}>{item.category}</Text>
      </View>
      {item.description ? (
        <Text style={styles.offerDescription}>{item.description}</Text>
      ) : null}
      {item.price && item.price > 0 ? (
        <Text style={styles.offerPrice}>Price: ${item.price}</Text>
      ) : null}
      {/* <View style={styles.statusContainer}>
        <Text style={[
          styles.statusBadge,
          item.isActive ? styles.activeBadge : styles.inactiveBadge
        ]}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Text>
        <Text style={styles.adminStatus}>Status: {item.adminStatus}</Text>
      </View> */}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>All Offers</Text>
      <Text style={styles.headerSubtext}>Total: {offers.length} offers</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      {hasNext ? (
        <ActivityIndicator size="small" color="#007BFF" />
      ) : (
        <Text style={styles.endText}>No more offers</Text>
      )}
      
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No offers available</Text>
      <Text style={styles.emptySubtext}>Pull down to refresh or try again</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => loadOffers(1, true)}
      >
        <Text style={styles.refreshButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && offers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={offers}
        keyExtractor={(item: Offer) => item.id}
        renderItem={renderOffer}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={offers.length === 0 ? styles.emptyListContainer : undefined}
        nestedScrollEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={undefined}
      />
    </SafeAreaView>
  );
};

export default AllOffersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  offerCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  offerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  offerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 70,
  },
  offerDiscount: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    flex: 1,
  },
  offerCategory: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '500',
    flex: 1,
    textTransform: 'capitalize',
  },
  offerDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 8,
    lineHeight: 20,
  },
  offerPrice: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  adminStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 30,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endText: {
    textAlign: 'center',
    padding: 15,
    color: '#888',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
});