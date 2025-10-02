import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

// Types
interface Location {
  latitude: number;
  longitude: number;
}

interface NearbyPlace {
  place_id: string;
  name: string;
  vicinity: string;
  types: string[];
  rating?: number;
  distance: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  price_level?: number;
  opening_hours?: {
    open_now: boolean;
  };
}

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface FilterOption {
  id: string;
  name: string;
  icon: string;
  types: string[];
  color: string;
}

interface TravelMode {
  id: string;
  name: string;
  icon: string;
  value: string;
}

const LocationScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([]);
  const [showingRoute, setShowingRoute] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const mapRef = useRef<MapView>(null);
  const watchId = useRef<number | null>(null);
  const [travelMode, setTravelMode] = useState<string>('driving');
  const [showTravelModeModal, setShowTravelModeModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navigationSteps, setNavigationSteps] = useState<any[]>([]);

  // Google Places API Key (Replace with your actual API key)
  const GOOGLE_PLACES_API_KEY = 'AIzaSyArCHsyFiAhe2Nvj113V99-Sx2uKNCGBp8';

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      id: 'all',
      name: 'All',
      icon: '🏠',
      types: [],
      color: '#4285F4'
    },
    {
      id: 'restaurants',
      name: 'Restaurants',
      icon: '🍽️',
      types: ['restaurant', 'food', 'meal_takeaway'],
      color: '#FF6B35'
    },
    {
      id: 'cafes',
      name: 'Cafes',
      icon: '☕',
      types: ['cafe', 'bakery'],
      color: '#8B4513'
    },
    {
      id: 'hotels',
      name: 'Hotels',
      icon: '🏨',
      types: ['lodging', 'hotel'],
      color: '#9C27B0'
    },
    {
      id: 'attractions',
      name: 'Attractions',
      icon: '🏛️',
      types: ['tourist_attraction', 'museum', 'park'],
      color: '#4CAF50'
    },
    {
      id: 'shopping',
      name: 'Shopping',
      icon: '🛒',
      types: ['shopping_mall', 'store', 'clothing_store'],
      color: '#FF9800'
    },
    {
      id: 'hospitals',
      name: 'Hospitals',
      icon: '🏥',
      types: ['hospital', 'pharmacy', 'doctor'],
      color: '#F44336'
    },
    {
      id: 'banks',
      name: 'Banks',
      icon: '🏦',
      types: ['bank', 'atm', 'finance'],
      color: '#607D8B'
    },
    {
      id: 'gas_stations',
      name: 'Gas Stations',
      icon: '⛽',
      types: ['gas_station'],
      color: '#795548'
    }
  ];

  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  useEffect(() => {
    applyFilter();
  }, [nearbyPlaces, activeFilter]);

  // Apply filter to places
  const applyFilter = () => {
    if (activeFilter === 'all') {
      setFilteredPlaces(nearbyPlaces);
    } else {
      const selectedFilter = filterOptions.find(f => f.id === activeFilter);
      if (selectedFilter) {
        const filtered = nearbyPlaces.filter(place =>
          place.types.some(type => selectedFilter.types.includes(type))
        );
        setFilteredPlaces(filtered);
      }
    }
  };

  // Travel mode options
  const travelModes: TravelMode[] = [
    { id: 'driving', name: 'Driving', icon: '🚗', value: 'driving' },
    { id: 'walking', name: 'Walking', icon: '🚶', value: 'walking' },
    { id: 'bicycling', name: 'Bicycling', icon: '🚴', value: 'bicycling' },
    { id: 'transit', name: 'Transit', icon: '🚌', value: 'transit' },
  ];

  // IMPROVED: Request location permissions with better error handling
  const requestLocationPermission = async () => {
    console.log('Requesting location permission...');

    if (Platform.OS === 'android') {
      try {
        // Check if permission is already granted
        const checkPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        console.log('Permission already granted:', checkPermission);

        if (checkPermission) {
          getCurrentLocation();
          return;
        }

        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs access to your location to show nearby places and provide directions.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        console.log('Permission result:', granted);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          console.log('Permission denied');
          Alert.alert(
            'Permission Required',
            'Location permission is required to use this feature. Please enable it in app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          setLoading(false);
        }
      } catch (err) {
        console.warn('Permission error:', err);
        setLoading(false);
      }
    } else {
      // iOS - request permission through Geolocation
      getCurrentLocation();
    }
  };

  // IMPROVED: Get current location with better error handling and options
  const getCurrentLocation = () => {
    console.log('Getting current location...');

    // Set timeout for location request
    const timeoutId = setTimeout(() => {
      console.log('Location request timeout');
      handleLocationError({
        code: 3,
        message: 'Location request timeout'
      });
    }, 30000); // 30 seconds timeout

    Geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        console.log('Location success:', position);

        const { latitude, longitude, accuracy } = position.coords;
        console.log(`Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);

        const newLocation = { latitude, longitude };
        setCurrentLocation(newLocation);
        setLoading(false);

        // Fetch nearby places
        fetchNearbyPlaces(latitude, longitude);

        // Start watching position changes
        startLocationWatch();
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error('Location error:', error);
        handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 25000, // 25 seconds
        maximumAge: 10000, // Accept cached location up to 10 seconds old
      },
    );
  };

  // IMPROVED: Handle location errors with better user feedback
  const handleLocationError = (error: any) => {
    console.error('Location error details:', error);
    setLoading(false);

    let errorMessage = 'Unable to get your location. ';
    let fallbackToDefault = true;

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        errorMessage += 'Location permission was denied. Please enable location services in your device settings.';
        fallbackToDefault = false;
        Alert.alert(
          'Location Permission Denied',
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMessage += 'Your location is currently unavailable. Please check your GPS/network connection.';
        break;
      case 3: // TIMEOUT
        errorMessage += 'Location request timed out. Please try again.';
        break;
      default:
        errorMessage += `Error: ${error.message}`;
        break;
    }

    if (fallbackToDefault) {
      // Fallback to default location (Colombo, Sri Lanka) for testing
      const defaultLocation = { latitude: 6.9271, longitude: 79.8612 };
      setCurrentLocation(defaultLocation);
      fetchNearbyPlaces(defaultLocation.latitude, defaultLocation.longitude);

      Alert.alert(
        'Location Error',
        errorMessage + ' Using Colombo location for demo.',
        [
          { text: 'OK' },
          {
            text: 'Retry', onPress: () => {
              setLoading(true);
              getCurrentLocation();
            }
          }
        ]
      );
    }
  };

  // IMPROVED: Watch location changes with better error handling
  const startLocationWatch = () => {
    console.log('Starting location watch...');

    watchId.current = Geolocation.watchPosition(
      (position) => {
        console.log('Location updated:', position.coords);
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        setCurrentLocation(newLocation);
      },
      (error) => {
        console.error('Watch position error:', error);
        // Don't show error alerts for watch position failures
        // as they can be frequent and annoying
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update when user moves 10 meters
        interval: 5000, // Check every 5 seconds
        fastestInterval: 2000, // Fastest update interval
      },
    );
  };

  // Add method to manually retry location
  const retryLocation = () => {
    setLoading(true);
    setCurrentLocation(null);
    requestLocationPermission();
  };

  // Handle map ready event
  const onMapReady = () => {
    console.log('Map is ready');
    setMapReady(true);

    if (currentLocation && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }, 1000);
    }
  };

  // Fetch nearby places using Google Places API
  const fetchNearbyPlaces = async (latitude: number, longitude: number) => {
    setPlacesLoading(true);
    try {
      const radius = 5000; // 5km radius
      const types = 'restaurant|cafe|tourist_attraction|hospital|bank|gas_station|shopping_mall|lodging|store|pharmacy|atm|museum|park|bakery';

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${types}&key=${GOOGLE_PLACES_API_KEY}`
      );

      const data = await response.json();

      if (data.results) {
        const placesWithDistance = data.results.map((place: any) => ({
          ...place,
          distance: calculateDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          ),
        }));

        placesWithDistance.sort((a: NearbyPlace, b: NearbyPlace) => a.distance - b.distance);

        setNearbyPlaces(placesWithDistance.slice(0, 50));
      } else {
        console.error('Places API error:', data);
        Alert.alert('API Error', 'Unable to fetch nearby places. Please check your API key.');
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      Alert.alert('Network Error', 'Unable to fetch nearby places. Please check your internet connection.');
    } finally {
      setPlacesLoading(false);
    }
  };

  // Get directions from Google Directions API
  const getDirections = async (destination: NearbyPlace) => {
    if (!currentLocation) return;

    try {
      setPlacesLoading(true);
      const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
      const dest = `${destination.geometry.location.lat},${destination.geometry.location.lng}`;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=${travelMode}&key=${GOOGLE_PLACES_API_KEY}`
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = decodePolyline(route.overview_polyline.points);
        setRouteCoordinates(coordinates);
        setSelectedPlace(destination);
        setShowingRoute(true);
        setNavigationSteps(route.legs[0].steps);

        // Enable 3D view for navigation
        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: currentLocation,
            pitch: 60,
            heading: 0,
            altitude: 300,
            zoom: 18,
          }, { duration: 2000 });
        }

        // Fit the map to show the entire route
        if (mapRef.current && coordinates.length > 0) {
          const allCoords = [currentLocation, ...coordinates, {
            latitude: destination.geometry.location.lat,
            longitude: destination.geometry.location.lng
          }];

          setTimeout(() => {
            mapRef.current?.fitToCoordinates(allCoords, {
              edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
              animated: true,
            });
          }, 2500);
        }
      } else {
        Alert.alert('No Route', 'Unable to find a route to this location');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      Alert.alert('Error', 'Unable to get directions');
    } finally {
      setPlacesLoading(false);
    }
  };

  // Decode polyline string to coordinates
  const decodePolyline = (encoded: string): RouteCoordinate[] => {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1E5,
        longitude: lng / 1E5,
      });
    }
    return poly;
  };

  // Clear route
  const clearRoute = () => {
    setRouteCoordinates([]);
    setSelectedPlace(null);
    setShowingRoute(false);

    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  // Recenter to current location
  const recenterToCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateCamera({
        center: currentLocation,
        pitch: isNavigating ? 60 : 0,
        heading: 0,
        altitude: isNavigating ? 300 : 1000,
        zoom: isNavigating ? 18 : 15,
      }, { duration: 1000 });
    }
  };

  // Start navigation
  const startNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
    if (mapRef.current && currentLocation) {
      mapRef.current.animateCamera({
        center: currentLocation,
        pitch: 60,
        heading: 0,
        altitude: 300,
        zoom: 18,
      }, { duration: 2000 });
    }
  };

  // Stop navigation
  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    if (mapRef.current && currentLocation) {
      mapRef.current.animateCamera({
        center: currentLocation,
        pitch: 0,
        heading: 0,
        altitude: 1000,
        zoom: 15,
      }, { duration: 1000 });
    }
  };

  // Open in external maps app
  const openInMaps = (place: NearbyPlace) => {
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    const label = encodeURIComponent(place.name);

    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}&q=${label}`,
      android: `google.navigation:q=${lat},${lng}&mode=d`,
    });

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
          Linking.openURL(browserUrl);
        }
      });
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format distance
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Get place type icon
  const getPlaceIcon = (types: string[]): string => {
    if (types.includes('restaurant') || types.includes('food') || types.includes('meal_takeaway')) return '🍽️';
    if (types.includes('cafe') || types.includes('bakery')) return '☕';
    if (types.includes('tourist_attraction') || types.includes('museum')) return '🏛️';
    if (types.includes('hospital') || types.includes('pharmacy')) return '🏥';
    if (types.includes('bank') || types.includes('atm')) return '🏦';
    if (types.includes('gas_station')) return '⛽';
    if (types.includes('shopping_mall') || types.includes('store')) return '🛒';
    if (types.includes('lodging') || types.includes('hotel')) return '🏨';
    if (types.includes('park')) return '🌳';
    return '📍';
  };

  // Handle place item press - Show travel mode selection
  const onPlacePress = (place: NearbyPlace) => {
    // Clear any existing route first
    if (showingRoute) {
      clearRoute();
    }

    Alert.alert(
      place.name,
      `${place.vicinity}\nDistance: ${formatDistance(place.distance)}${place.rating ? `\nRating: ${place.rating.toFixed(1)} ⭐` : ''
      }${place.opening_hours?.open_now !== undefined ?
        `\n${place.opening_hours.open_now ? '🟢 Open now' : '🔴 Closed'}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose Travel Mode', onPress: () => {
            setSelectedPlace(place);
            setShowTravelModeModal(true);
          }
        },
        { text: 'Open in Maps', onPress: () => openInMaps(place) },
      ]
    );
  };

  // Handle filter change
  const onFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    // Clear route when changing filters
    if (showingRoute) {
      clearRoute();
    }
  };

  // Render filter item
  const renderFilterItem = ({ item }: { item: FilterOption }) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        activeFilter === item.id && { backgroundColor: item.color }
      ]}
      onPress={() => onFilterChange(item.id)}
    >
      <Text style={[
        styles.filterIcon,
        activeFilter === item.id && styles.activeFilterIcon
      ]}>
        {item.icon}
      </Text>
      <Text style={[
        styles.filterText,
        activeFilter === item.id && styles.activeFilterText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render nearby place item
  const renderPlaceItem = ({ item }: { item: NearbyPlace }) => (
    <TouchableOpacity
      style={[
        styles.placeItem,
        selectedPlace?.place_id === item.place_id && styles.selectedPlaceItem
      ]}
      onPress={() => onPlacePress(item)}
    >
      <View style={styles.placeHeader}>
        <Text style={styles.placeIcon}>{getPlaceIcon(item.types)}</Text>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.placeAddress} numberOfLines={1}>{item.vicinity}</Text>
          <View style={styles.placeDetails}>
            {item.rating && (
              <Text style={styles.placeRating}>⭐ {item.rating.toFixed(1)}</Text>
            )}
            {item.opening_hours?.open_now !== undefined && (
              <Text style={[
                styles.openStatus,
                item.opening_hours.open_now ? styles.openNow : styles.closed
              ]}>
                {item.opening_hours.open_now ? '• Open' : '• Closed'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.placeDistance}>
          <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => getDirections(item)}
          >
            <Text style={styles.directionsButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Getting your location...</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryLocation}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            onMapReady={onMapReady}
            showsUserLocation={true}
            showsMyLocationButton={false}
            followsUserLocation={isNavigating}
            showsCompass={true}
            showsScale={true}
            rotateEnabled={true}
            scrollEnabled={true}
            zoomEnabled={true}
            loadingEnabled={true}
            loadingIndicatorColor="#4285F4"
            mapType="standard"
            pitchEnabled={true}
            showsBuildings={true}
            showsIndoors={true}
            camera={isNavigating ? {
              center: currentLocation,
              pitch: 60,
              heading: 0,
              altitude: 300,
              zoom: 18,
            } : undefined}
          >
            {/* Current location marker */}
            <Marker
              coordinate={currentLocation}
              title="Your Location"
              description="You are here"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationDot} />
              </View>
            </Marker>

            {/* Nearby places markers */}
            {filteredPlaces.slice(0, 20).map((place) => (
              <Marker
                key={place.place_id}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                title={place.name}
                description={`${formatDistance(place.distance)} away`}
                onPress={() => onPlacePress(place)}
              >
                <View style={[
                  styles.customMarker,
                  selectedPlace?.place_id === place.place_id && styles.selectedMarker
                ]}>
                  <Text style={styles.markerText}>{getPlaceIcon(place.types)}</Text>
                </View>
              </Marker>
            ))}

            {/* Route polyline */}
            {showingRoute && routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#4285F4"
                strokeWidth={4}
                geodesic={true}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.mapPlaceholderText}>Loading map...</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryLocation}>
              <Text style={styles.retryButtonText}>Retry Location</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Clear route button */}
        {showingRoute && (
          <TouchableOpacity style={styles.clearRouteButton} onPress={clearRoute}>
            <Text style={styles.clearRouteText}>✕ Clear Route</Text>
          </TouchableOpacity>
        )}

        {/* Recenter Button */}
        <TouchableOpacity style={styles.recenterButton} onPress={recenterToCurrentLocation}>
          <Text style={styles.recenterText}>📍</Text>
        </TouchableOpacity>

        {/* Navigation Controls */}
        {showingRoute && !isNavigating && (
          <TouchableOpacity style={styles.startNavigationButton} onPress={startNavigation}>
            <Text style={styles.startNavigationText}>🧭 Start Navigation</Text>
          </TouchableOpacity>
        )}

        {/* Stop Navigation Button */}
        {isNavigating && (
          <TouchableOpacity style={styles.stopNavigationButton} onPress={stopNavigation}>
            <Text style={styles.stopNavigationText}>⏹️ Stop Navigation</Text>
          </TouchableOpacity>
        )}

        {/* Current Navigation Step */}
        {isNavigating && navigationSteps.length > 0 && currentStepIndex < navigationSteps.length && (
          <View style={styles.navigationInstruction}>
            <Text style={styles.instructionText}>
              {navigationSteps[currentStepIndex].html_instructions.replace(/<[^>]*>/g, '')}
            </Text>
            <Text style={styles.instructionDistance}>
              {navigationSteps[currentStepIndex].distance.text}
            </Text>
          </View>
        )}
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <FlatList
          data={filterOptions}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Nearby Places List */}
      <View style={styles.placesContainer}>
        <Text style={styles.placesTitle}>
          {filteredPlaces.length} places found {selectedPlace && `(Route to ${selectedPlace.name})`}
        </Text>
        {placesLoading ? (
          <View style={styles.placesLoading}>
            <ActivityIndicator size="small" color="#4285F4" />
            <Text>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPlaces}
            renderItem={renderPlaceItem}
            keyExtractor={(item) => item.place_id}
            showsVerticalScrollIndicator={false}
            style={styles.placesList}
          />
        )}
      </View>

      {/* Travel Mode Selection Modal */}
      <Modal
        visible={showTravelModeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTravelModeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Travel Mode</Text>
            {travelModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.travelModeItem,
                  travelMode === mode.value && styles.selectedTravelMode
                ]}
                onPress={() => {
                  setTravelMode(mode.value);
                  setShowTravelModeModal(false);
                  if (selectedPlace) {
                    getDirections(selectedPlace);
                  }
                }}
              >
                <Text style={styles.travelModeIcon}>{mode.icon}</Text>
                <Text style={styles.travelModeText}>{mode.name}</Text>
                {travelMode === mode.value && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTravelModeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#4285F4',
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  menuButton: {
    padding: 5,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  currentLocationText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  mapContainer: {
    height: 450,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(66, 133, 244, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4285F4',
  },
  currentLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4285F4',
  },
  customMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#4285F4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    backgroundColor: '#4285F4',
    borderColor: '#fff',
  },
  markerText: {
    fontSize: 14,
  },
  clearRouteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearRouteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterList: {
    paddingHorizontal: 10,
  },
  filterItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    minWidth: 70,
  },
  filterIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  activeFilterIcon: {
    color: '#fff',
  },
  filterText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  placesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 10,
  },
  placesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 15,
    color: '#333',
  },
  placesLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placesList: {
    flex: 1,
  },
  placeItem: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 4,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedPlaceItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4285F4',
    borderWidth: 2,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
    marginRight: 10,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  placeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeRating: {
    fontSize: 12,
    color: '#f39c12',
    marginRight: 8,
  },
  openStatus: {
    fontSize: 11,
    fontWeight: '500',
  },
  openNow: {
    color: '#4CAF50',
  },
  closed: {
    color: '#F44336',
  },
  placeDistance: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 4,
  },
  directionsButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recenterText: {
    fontSize: 20,
  },
  startNavigationButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startNavigationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stopNavigationButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopNavigationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navigationInstruction: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionDistance: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  travelModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedTravelMode: {
    backgroundColor: '#E3F2FD',
  },
  travelModeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  travelModeText: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  checkMark: {
    fontSize: 20,
    color: '#4285F4',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
});

export default LocationScreen;