import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  ToastAndroid,
} from 'react-native';
import { DeliveryPerson } from './DeliveryPerson';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Santizate } from './Santizate';
import { Orders } from './Orders';
import { Loader } from '../../components/Loader';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { calculateTotalPrice } from '../../utils/utils';
import { RESET } from '../../redux/cartSlice';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../redux/userSlice';
import BASE_URL from '../../config';

export const DeliveryScreen = () => {
  const route = useRoute();
  const address = route.params?.address;
  const screenWidth = Dimensions.get('window').width;
  const screenheight = Dimensions.get('window').height;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const cartItems = useSelector(state => state.cart);
  const total = calculateTotalPrice(cartItems);
  const [result, setResult] = useState(null);
  const navigation = useNavigation();
  
  const [fuck, setFuck] = useState([]);
  var ans = [];
  
  const startCoordinates = [77.11288116671513, 28.73695862131864];
  const endCoordinates = [address?.longitude || 0, address?.latitude || 0];
  const [error, setError] = useState(false);
  
  const onCheckout = async () => {
    // STRIPE PAYMENT DISABLED - Skipping to order creation
    // Uncomment and setup Stripe when ready
    
    // For now, just create order directly without payment
    saveOrder('test_transaction_' + Date.now());
  };

  async function saveOrder(id) {
    try {
      setLoading(true);
      
      // 🔍 DEBUG: Log everything
      console.log('=== DEBUG INFO ===');
      console.log('Current User Object:', JSON.stringify(currentUser, null, 2));
      console.log('User ID:', currentUser?._id || currentUser?.id || currentUser?.userId);
      console.log('Token:', currentUser?.token?.substring(0, 20) + '...');
      
      const transformedProducts = cartItems.map(item => ({
        _id: item._id || item.product?._id,
        banner: item.banner || item.product?.banner,
        brand: item.brand || item.product?.brand,
        category: item.category || item.product?.category,
        name: item.name || item.product?.name,
        price: item.price || item.product?.price,
        quantity: item.quantity || item.unit || 1,
        regular_price: item.regular_price || item.product?.regular_price,
        store: item.store || item.product?.store,
        subcategory: item.subcategory || item.product?.subcategory,
        unit: item.unit || item.product?.unit || 1,
        weight: item.weight || item.product?.weight,
      }));

      // ✅ Try different possible user ID fields
      const userId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.customerId;
      
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        dispatch(logout());
        setLoading(false);
        return;
      }

      const orderPayload = {
        transaction: id,
        products: transformedProducts,
        total: total < 99 ? total + 15 : total,
        address: address,
        customer_id: userId,
        status: 'pending',
      };

      console.log('=== Order Payload ===');
      console.log(JSON.stringify(orderPayload, null, 2));
      
      const res = await axios.post(
        `${BASE_URL}/shopping/order`,
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      console.log('=== Order Response ===');
      console.log('Response:', res?.data);
      
      setLoading(false);
      setResult(res?.data);
      dispatch(RESET()); // ✅ Clear cart after successful order
    } catch (error) {
      setLoading(false);
      console.log('=== Order Error ===');
      console.log('Status:', error.response?.status);
      console.log('Error Details:', error.response?.data || error.message);
      
      if (error.response?.status === 403 || error.response?.data?.message === 'Not Authorized') {
        dispatch(logout());
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }],
        );
      } else {
        Alert.alert(
          'Order Failed',
          error.response?.data?.message || 'Unable to place order. Please try again.',
        );
      }
    }
  }

  async function fetchRoute() {
    // Mapbox disabled - uncomment when you have API key
  }
  
  useEffect(() => {
    onCheckout();
  }, []);

  return (
    <>
      <StatusBar backgroundColor="green" />
      {loading ? (
        <>
          <SafeAreaView
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Loader screenWidth={screenWidth} />
          </SafeAreaView>
        </>
      ) : (
        <SafeAreaView>
          {error ? (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                <Text>Some error occured!</Text>
              </View>
            </>
          ) : (
            <ScrollView>
              <View
                style={{
                  height: 130,
                  backgroundColor: 'green',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: screenWidth,
                }}
              >
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: 25,
                    textAlign: 'center',
                  }}
                >
                  Your Order is on the way
                </Text>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  Arriving in 48 Hours
                </Text>
              </View>
              <View
                style={{
                  width: screenWidth,
                  height: 800,
                  backgroundColor: 'white',
                }}
              >
                <DeliveryPerson screenWidth={screenWidth} />
                <Santizate />
                {/* ✅ Pass cartItems, total, and address as fallback props */}
                <Orders 
                  data={result} 
                  cartItems={cartItems}
                  total={total < 99 ? total + 15 : total}
                  address={address}
                />
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      )}
    </>
  );
};