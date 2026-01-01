import React, {useState, useEffect} from 'react';
import {View, ScrollView, Dimensions, Text, ToastAndroid, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {Loader} from '../../components/Loader';
import { formatDate } from '../../utils/utils';
import {useNavigation} from '@react-navigation/native';
import { useDispatch } from "react-redux";
import { logout } from '../../redux/userSlice';
import { ShoppingBagIcon } from 'react-native-heroicons/outline';

export const YourOrders = () => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const {currentUser} = useSelector(state => state.user);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  async function getOrders() {
    try {
      console.log('🔍 Fetching orders...');
      console.log('User token:', currentUser?.token ? 'Present' : 'Missing');
      
      setLoading(true);
      setError(null);
      
      // Use correct URL for Android emulator
      const res = await axios.get(`http://10.0.2.2:8000/shopping/orders`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('✅ Orders response:', res.data);
      
      if(res.data.message === 'Not Authorized') {
        dispatch(logout());
        setLoading(false);
        ToastAndroid.show('Your Session has been expired !', ToastAndroid.SHORT);
        navigation.navigate('Home');
        return;
      }
      
      setLoading(false);
      setResult(res?.data || []);
      
      if (!res?.data || res.data.length === 0) {
        console.log('ℹ️ No orders found');
      }
      
    } catch (error) {
      setLoading(false);
      console.error('❌ Error fetching orders:', error.message);
      console.error('Error details:', error.response?.data);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check your connection.');
      } else if (error.response?.status === 401) {
        dispatch(logout());
        ToastAndroid.show('Session expired. Please login again.', ToastAndroid.SHORT);
        navigation.navigate('Home');
      } else if (error.response) {
        setError(error.response.data?.message || 'Failed to load orders');
      } else if (error.request) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred');
      }
    }
  }

  useEffect(() => {
    if (currentUser?.token) {
      getOrders();
    }
  }, [currentUser]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Loader screenWidth={screenWidth} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!result || result.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ShoppingBagIcon size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>
            You haven't placed any orders yet.{'\n'}
            Start shopping to see your orders here!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Orders list
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {result.map(item => {
          return (
            <View key={item._id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderDate}>
                    Date: {formatDate(item?.createdAt)}
                  </Text>
                  <Text style={styles.orderAddress}>
                    Address: {item?.address?.type || 'Not specified'}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  item?.status === 'delivered' && styles.statusDelivered,
                  item?.status === 'pending' && styles.statusPending,
                  item?.status === 'processing' && styles.statusProcessing,
                ]}>
                  <Text style={styles.statusText}>
                    {item?.status?.toUpperCase() || 'PENDING'}
                  </Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.itemsContainer}>
                {item?.products?.map((product, index) => {
                  return (
                    <View key={product._id || index} style={styles.itemRow}>
                      <Text style={styles.itemName}>
                        {product?.name} × {product?.quantity}
                      </Text>
                      <Text style={styles.itemPrice}>
                        Birr {(product?.quantity * product?.price).toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Delivery Fee */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>
                  {item?.total > 99 ? 'FREE' : 'Birr 15'}
                </Text>
              </View>

              {/* Total */}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  Birr {item?.total?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#34C759',
  },
  statusDelivered: {
    backgroundColor: '#34C759',
  },
  statusPending: {
    backgroundColor: '#FF9500',
  },
  statusProcessing: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#34C759',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
});