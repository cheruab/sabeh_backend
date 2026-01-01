import React, { useEffect, useState } from 'react';
import { 
  View, 
  Dimensions, 
  Text, 
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { EnterAddress } from './EnterAddress';
import { MapPinIcon } from 'react-native-heroicons/solid';

export const AddAddress = () => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState({
    text: 'Your Location',
    place_name: 'Getting your location...'
  });
  
  // Start with default Addis Ababa coordinates
  const [coords, setCoords] = useState({
    latitude: 9.0192,
    longitude: 38.7525,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [markerCoords, setMarkerCoords] = useState(null);
  const mapRef = React.useRef(null);

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
      
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message: 'This app needs to access your location to show your current position on the map',
          buttonPositive: 'OK',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Location permission granted');
        return true;
      } else {
        console.log('❌ Location permission denied');
        Alert.alert(
          'Permission Required',
          'Please enable location permission in your device settings to use this feature',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // You can open settings here if needed
            }}
          ]
        );
        return false;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  // Get current location with better error handling
  const getCurrentLocation = async () => {
    console.log('🔍 Getting current location...');
    setLoading(true);

    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      setLoading(false);
      setLocationData({
        text: 'Permission Denied',
        place_name: 'Tap on map to select location manually'
      });
      return;
    }

    // Configure geolocation for better accuracy
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
      locationProvider: 'auto'
    });

    console.log('📡 Requesting location with high accuracy...');

    // Use watchPosition for real-time updates
    const watchId = Geolocation.watchPosition(
      (position) => {
        console.log('✅ Location received:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        
        const { latitude, longitude, accuracy } = position.coords;
        
        const newCoords = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        
        setCoords(newCoords);
        setMarkerCoords({ latitude, longitude });
        setLocationData({
          text: 'Current Location',
          place_name: `Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)} (${Math.round(accuracy)}m accuracy)`
        });
        
        // Animate map to current location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newCoords, 1000);
        }
        
        setLoading(false);
        
        // Stop watching after first successful location
        Geolocation.clearWatch(watchId);
      },
      (error) => {
        console.error('❌ Location error:', {
          code: error.code,
          message: error.message
        });
        setLoading(false);
        
        let errorMessage = 'Unable to get location';
        let suggestion = '';
        
        switch (error.code) {
          case 1:
            errorMessage = 'Location permission denied';
            suggestion = 'Please enable location permission in Settings';
            break;
          case 2:
            errorMessage = 'Location unavailable';
            suggestion = 'Make sure GPS is enabled on your device';
            break;
          case 3:
            errorMessage = 'Location request timed out';
            suggestion = 'Please try again or select location manually';
            break;
        }
        
        Alert.alert(
          'Location Error', 
          `${errorMessage}\n\n${suggestion}`,
          [
            { text: 'Select Manually', onPress: () => {
              setLocationData({
                text: 'Select Location',
                place_name: 'Tap on map to choose your location'
              });
            }},
            { text: 'Try Again', onPress: getCurrentLocation }
          ]
        );
      },
      { 
        enableHighAccuracy: true,
        timeout: 30000, // Increased timeout
        maximumAge: 0,
        distanceFilter: 0, // Get all updates
        useSignificantChanges: false,
      }
    );
  };

  // Get location when component mounts
  useEffect(() => {
    // Small delay to let map render first
    const timer = setTimeout(() => {
      getCurrentLocation();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle map press
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoords({ latitude, longitude });
    setLocationData({
      text: 'Selected Location',
      place_name: `Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}`
    });
    console.log('📍 Location selected:', latitude, longitude);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={coords}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            zoomEnabled={true}
            scrollEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
          >
            {markerCoords && (
              <Marker
                coordinate={markerCoords}
                title="Delivery Location"
                description="Your items will be delivered here"
                pinColor="green"
                draggable={true}
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setMarkerCoords({ latitude, longitude });
                  setLocationData({
                    text: 'Selected Location',
                    place_name: `Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}`
                  });
                }}
              />
            )}
          </MapView>

          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="green" />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            </View>
          )}

          {/* Recenter button */}
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.recenterText}>
              {loading ? '⏳' : '📍'} My Location
            </Text>
          </TouchableOpacity>

          {/* Instructions overlay */}
          {!markerCoords && !loading && (
            <View style={styles.instructionsOverlay}>
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionsText}>
                  👆 Tap on the map to select your delivery location
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Location Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.locationInfo}>
            <View style={styles.iconContainer}>
              <MapPinIcon size={24} color="green" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>
                {locationData.text}
              </Text>
              <Text style={styles.locationSubtitle}>
                {locationData.place_name}
              </Text>
            </View>
          </View>

          {markerCoords && (
            <View style={styles.helpText}>
              <Text style={styles.helpTextContent}>
                💡 You can drag the marker to adjust the exact location
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !markerCoords && styles.confirmButtonDisabled
            ]}
            onPress={() => {
              if (!markerCoords) {
                Alert.alert('Please Select Location', 'Tap on the map or use "My Location" to select your delivery address');
                return;
              }
              setShow(true);
            }}
            disabled={!markerCoords}
          >
            <Text style={styles.confirmButtonText}>
              {markerCoords ? 'Confirm Location & Continue' : 'Select Location First'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <EnterAddress
        show={show}
        setShow={setShow}
        longitude={markerCoords?.longitude || coords.longitude}
        latitude={markerCoords?.latitude || coords.latitude}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  recenterButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  recenterText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
  },
  instructionsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  instructionsText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    backgroundColor: '#e8f5e9',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  helpText: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  helpTextContent: {
    fontSize: 13,
    color: '#0369a1',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
