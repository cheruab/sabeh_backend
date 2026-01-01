import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Alert,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Loader } from '../../components/Loader';
import { SelectAddress } from '../Address/SelectAddress';
import { MapPinIcon } from 'react-native-heroicons/outline';
import { BASE_URL } from '../../../config';

export const GroupCheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { currentUser } = useSelector((state) => state.user);
  
  const { group, isLeader } = route.params;
  const screenWidth = Dimensions.get('window').width;
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch user's addresses
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/customer/addresses`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Fetch addresses error:', error);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddress) {
        Alert.alert('Error', 'Please select a delivery address');
        return;
      }

      setPlacingOrder(true);

      // Calculate order details
      const participant = group.participants.find(
        (p) => p.customerId === currentUser._id
      );

      const orderData = {
        groupId: group._id,
        groupCode: group.uniqueCode,
        products: [
          {
            ...group.product,
            quantity: participant.quantity,
            price: group.product.group_price,
          },
        ],
        total: participant.quantity * group.product.group_price,
        address: selectedAddress,
        paymentMethod: 'cash_on_delivery',
      };

      // Create order
      const response = await axios.post(
        `${BASE_URL}/shopping/order`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      setPlacingOrder(false);

      ToastAndroid.show('Order placed successfully!', ToastAndroid.SHORT);
      
      // Navigate to order confirmation or home
      navigation.navigate('Home');
    } catch (error) {
      setPlacingOrder(false);
      console.error('Place order error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to place order'
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Loader screenWidth={screenWidth} />
      </SafeAreaView>
    );
  }

  const participant = group.participants.find(
    (p) => p.customerId === currentUser._id
  );
  
  const itemTotal = participant ? participant.quantity * group.product.group_price : 0;
  const deliveryFee = itemTotal > 99 ? 0 : 15;
  const total = itemTotal + deliveryFee;
  const savings = participant ? participant.quantity * (group.product.regular_price - group.product.group_price) : 0;

  return (
    <>
      <StatusBar backgroundColor="green" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* Group Info Banner */}
          <View style={{
            backgroundColor: '#e8f5e9',
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'green',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 20 }}>🎉</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: 'green' }}>
                Group Order - Code: {group.uniqueCode}
              </Text>
              <Text style={{ color: '#2e7d32', fontSize: 12 }}>
                You saved Birr {savings.toFixed(2)} with group buying!
              </Text>
            </View>
          </View>

          {/* Product Details */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 15 }}>
              Order Summary
            </Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Image
                source={{ uri: group.product.banner }}
                style={{ width: 80, height: 80, borderRadius: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: 'black' }}>
                  {group.product.name}
                </Text>
                <Text style={{ color: 'gray', fontSize: 12, marginTop: 5 }}>
                  {group.product.weight}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <Text style={{ textDecorationLine: 'line-through', color: 'gray' }}>
                    Birr {group.product.regular_price}
                  </Text>
                  <Text style={{ fontWeight: 'bold', color: 'green' }}>
                    Birr {group.product.group_price}
                  </Text>
                </View>
                <Text style={{ marginTop: 5, color: 'gray' }}>
                  Quantity: {participant?.quantity || 1}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Address */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                Delivery Address
              </Text>
              <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>Change</Text>
              </TouchableOpacity>
            </View>

            {selectedAddress ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MapPinIcon size={20} color="green" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    {selectedAddress.type}
                  </Text>
                  <Text style={{ color: 'gray', fontSize: 12 }}>
                    {selectedAddress.completeAddress}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate('Add Address')}
                style={{
                  padding: 15,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>
                  + Add Delivery Address
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Price Breakdown */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 15 }}>
              Price Details
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: 'gray' }}>Item Total</Text>
              <Text style={{ fontWeight: 'bold' }}>Birr {itemTotal.toFixed(2)}</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: 'gray' }}>Delivery Fee</Text>
              <Text style={{ fontWeight: 'bold', color: deliveryFee === 0 ? 'green' : 'black' }}>
                {deliveryFee === 0 ? 'FREE' : `Birr ${deliveryFee}`}
              </Text>
            </View>

            <View style={{
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              marginTop: 10,
              paddingTop: 10,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Total</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'green' }}>
                  Birr {total.toFixed(2)}
                </Text>
              </View>
              <Text style={{ color: 'green', fontSize: 12, marginTop: 5, textAlign: 'right' }}>
                You saved Birr {savings.toFixed(2)}!
              </Text>
            </View>
          </View>

          {/* Place Order Button */}
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={placingOrder || !selectedAddress}
            style={{
              backgroundColor: (!selectedAddress || placingOrder) ? 'gray' : 'green',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Address Selection Modal */}
        <SelectAddress 
          show={showAddressModal} 
          setShow={setShowAddressModal}
          onSelectAddress={(address) => {
            setSelectedAddress(address);
            setShowAddressModal(false);
          }}
        />
      </SafeAreaView>
    </>
  );
};