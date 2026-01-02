import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { addGroup, setLoading, setError } from '../../redux/groupSlice';

export const CreateGroupScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { currentUser } = useSelector((state) => state.user);
  
  const product = route.params?.product;
  const screenWidth = Dimensions.get('window').width;

  // LOCAL loading state instead of Redux
  const [creating, setCreating] = useState(false);
  const [minParticipants, setMinParticipants] = useState('5');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [durationHours, setDurationHours] = useState('72');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Auto-fill name and phone from currentUser when component mounts
  useEffect(() => {
    console.log('CreateGroup - Current User:', currentUser);
    
    if (currentUser) {
      // Set first name only from currentUser
      setLeaderName(currentUser.name || '');
      
      // Set phone from currentUser
      setLeaderPhone(currentUser.phone || '');
      
      console.log('Auto-filled - Name:', currentUser.name, 'Phone:', currentUser.phone);
    }
  }, [currentUser]);

  const handleCreateGroup = async () => {
    try {
      console.log('=== CREATE GROUP START ===');
      console.log('📍 Delivery Address from state:', deliveryAddress);
      console.log('URL: sabehbackend-production.up.railway.app/group/create');
      console.log('Product:', product?._id);
      console.log('Leader:', leaderName, leaderPhone);

      if (!product) {
        Alert.alert('Error', 'Product information is missing');
        return;
      }

      if (!leaderName || !leaderPhone) {
        Alert.alert('Error', 'Please enter your name and phone');
        return;
      }

      if (!deliveryAddress.trim()) {
        Alert.alert('Error', 'Please enter delivery address');
        return;
      }

      console.log('✅ Validation passed - Address is:', deliveryAddress);

      const calculatedGroupPrice = product.groupPrice || product.regular_price * 0.8;
      const min = parseInt(minParticipants);
      const max = parseInt(maxParticipants);

      if (min < 2 || max < min) {
        Alert.alert('Error', 'Please enter valid participant numbers');
        return;
      }

      setCreating(true); // Use LOCAL state

      const groupData = {
        productId: product._id,
        productName: product.name,
        productBanner: product.banner,
        regularPrice: product.regular_price,
        groupPrice: calculatedGroupPrice,
        weight: product.weight,
        category: product.category,
        minParticipants: min,
        maxParticipants: max,
        durationHours: parseInt(durationHours),
        leaderName,
        leaderPhone,
        deliveryAddress: {
          type: 'other', // Changed from 'custom' to 'other' to match schema enum
          completeAddress: deliveryAddress.trim(),
        },
      };

      console.log('📦 FULL Group Data being sent:', JSON.stringify(groupData, null, 2));
      console.log('🔍 Specifically checking address:', groupData.deliveryAddress);

      console.log('Sending request...');
      const response = await axios.post(
        'sabehbackend-production.up.railway.app/group/create',
        groupData,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Success Response:', JSON.stringify(response.data, null, 2));
      console.log('✅ Address in response:', response.data.deliveryAddress);
      setCreating(false);

      dispatch(addGroup(response.data));
      ToastAndroid.show('Group created successfully!', ToastAndroid.SHORT);
      navigation.navigate('GroupDetail', { groupCode: response.data.uniqueCode });
    } catch (error) {
      setCreating(false);
      
      console.error('❌ CREATE GROUP ERROR');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Response:', error.response?.data);

      let errorMessage = 'Failed to create group';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - Please check your connection';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server';
      } else if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const savings = product?.regular_price - (product?.groupPrice || product?.regular_price * 0.8);
  const savingsPercent = product?.discount || Math.round(((product?.regular_price - (product?.groupPrice || product?.regular_price * 0.8)) / product?.regular_price) * 100);

  return (
    <>
      <StatusBar backgroundColor="green" />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>
            Create Group Buy
          </Text>
          <Text style={{ fontSize: 14, color: 'gray', marginBottom: 20 }}>
            Start a group and invite friends to save together!
          </Text>

          <View style={{ backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Image source={{ uri: product?.banner }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>{product?.name}</Text>
                <Text style={{ color: 'gray', marginTop: 5 }}>{product?.weight}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <Text style={{ textDecorationLine: 'line-through', color: 'gray' }}>Birr {product?.regular_price}</Text>
                  <Text style={{ fontWeight: 'bold', color: 'green', fontSize: 16 }}>
                    Birr {(product?.groupPrice || product?.regular_price * 0.8).toFixed(0)}
                  </Text>
                  <View style={{ backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{savingsPercent}% OFF</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>Your Information</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, color: 'black' }}
            placeholder="Your Name"
            placeholderTextColor="#999"
            value={leaderName}
            onChangeText={setLeaderName}
          />
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, color: 'black' }}
            placeholder="Your Phone"
            placeholderTextColor="#999"
            value={leaderPhone}
            onChangeText={setLeaderPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#ddd', 
              borderRadius: 8, 
              padding: 12, 
              marginBottom: 20, 
              color: 'black',
              minHeight: 80,
              textAlignVertical: 'top'
            }}
            placeholder="Delivery Address"
            placeholderTextColor="#999"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
          />

          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', marginBottom: 10 }}>Group Settings</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 5, color: 'gray' }}>Min Participants</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, color: 'black' }}
                placeholder="5"
                value={minParticipants}
                onChangeText={setMinParticipants}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ marginBottom: 5, color: 'gray' }}>Max Participants</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, color: 'black' }}
                placeholder="20"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ marginBottom: 5, color: 'gray' }}>Duration (hours)</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, color: 'black' }}
              placeholder="72"
              value={durationHours}
              onChangeText={setDurationHours}
              keyboardType="number-pad"
            />
            <Text style={{ color: 'gray', fontSize: 12, marginTop: 5 }}>How long the group will remain active</Text>
          </View>

          <View style={{ backgroundColor: '#e8f5e9', padding: 15, borderRadius: 10, marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', color: 'green', marginBottom: 10 }}>💰 Benefits as Group Leader:</Text>
            <Text style={{ color: '#2e7d32', marginBottom: 5 }}>• Save Birr {savings?.toFixed(2)} per person</Text>
            <Text style={{ color: '#2e7d32', marginBottom: 5 }}>• Earn 5% commission on total savings</Text>
            <Text style={{ color: '#2e7d32' }}>• Help your community save money</Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateGroup}
            disabled={creating}
            style={{ 
              backgroundColor: creating ? '#ccc' : 'green', 
              padding: 15, 
              borderRadius: 10, 
              alignItems: 'center', 
              marginBottom: 20,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
            }}>
            {creating && <ActivityIndicator color="white" />}
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              {creating ? 'Creating...' : 'Create Group & Share'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};