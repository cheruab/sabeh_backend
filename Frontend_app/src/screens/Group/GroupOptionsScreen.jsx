import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Loader } from '../../components/Loader';
import * as Progress from 'react-native-progress';
import { 
  UsersIcon, 
  ClockIcon, 
  PlusCircleIcon,
  PhoneIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';

// Use correct API URL for Android Emulator
const API_BASE_URL = 'sabehbackend-production.up.railway.app/group';

export const GroupOptionsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { currentUser } = useSelector((state) => state.user);
  
  const product = route.params?.product;
  const screenWidth = Dimensions.get('window').width;
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch active groups for this product
  const fetchGroups = async () => {
    try {
      console.log('Fetching groups for product:', product?._id);
      setLoading(true);
      
      const response = await axios.get(
        `${API_BASE_URL}/product/${product._id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
      console.log('Groups fetched:', response.data);
      setGroups(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Fetch groups error:', error.message);
      console.error('Error details:', error.response?.data);
      setLoading(false);
      setGroups([]);
      
      // Show error to user
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Timeout', 'Server is taking too long to respond. Please try again.');
      } else if (error.response) {
        Alert.alert('Error', error.response.data?.error || 'Failed to load groups');
      } else if (error.request) {
        Alert.alert('Network Error', 'Could not connect to server. Please check your connection.');
      }
    }
  };

  useEffect(() => {
    if (!product) {
      Alert.alert('Error', 'Product information is missing');
      navigation.goBack();
      return;
    }
    fetchGroups();
  }, [product]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const calculateTimeLeft = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Loader screenWidth={screenWidth} />
        <Text style={{ marginTop: 20, color: '#666' }}>Loading groups...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Product information is missing</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, padding: 10, backgroundColor: '#2196F3', borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const groupPrice = product.groupPrice || product.regular_price * 0.8;
  const savings = product.regular_price - groupPrice;

  return (
    <>
      <StatusBar backgroundColor="#2196F3" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 20 }}>
          
          {/* Product Header */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Image
                source={{ uri: product.banner }}
                style={{ width: 80, height: 80, borderRadius: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>
                  {product.name}
                </Text>
                <Text style={{ color: 'gray', marginTop: 5 }}>{product.weight}</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <Text style={{ textDecorationLine: 'line-through', color: 'gray' }}>
                    Birr {product.regular_price}
                  </Text>
                  <Text style={{ fontWeight: 'bold', color: '#2196F3', fontSize: 16 }}>
                    Birr {groupPrice.toFixed(0)}
                  </Text>
                  <View style={{ backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      Save Birr {savings.toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Create New Group Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateGroup', { product })}
            style={{
              backgroundColor: '#2196F3',
              padding: 15,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 20,
            }}>
            <PlusCircleIcon size={24} color="white" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Create New Group
            </Text>
          </TouchableOpacity>

          {/* Active Groups */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', marginBottom: 15 }}>
            {groups.length > 0 ? 'Active Groups' : 'No Active Groups Yet'}
          </Text>

          {groups.length === 0 && (
            <View style={{
              backgroundColor: 'white',
              padding: 30,
              borderRadius: 10,
              alignItems: 'center',
            }}>
              <Text style={{ color: 'gray', textAlign: 'center', marginBottom: 10 }}>
                Be the first to create a group for this product!
              </Text>
              <Text style={{ color: 'gray', fontSize: 12, textAlign: 'center' }}>
                Start a group and invite friends to save together.
              </Text>
            </View>
          )}

          {/* Group Cards */}
          {groups.map((group) => {
            const progress = group.currentParticipants / group.maxParticipants;
            const spotsLeft = group.maxParticipants - group.currentParticipants;
            const timeLeft = calculateTimeLeft(group.expiresAt);

            return (
              <TouchableOpacity
                key={group._id}
                onPress={() => navigation.navigate('GroupDetail', { groupCode: group.uniqueCode })}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 10,
                  padding: 15,
                  marginBottom: 15,
                }}>
                
                {/* Leader Info */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#2196F3',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                        {group.leader.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', color: 'black' }}>
                        {group.leader.name} 👑
                      </Text>
                      <Text style={{ color: 'gray', fontSize: 12 }}>Group Leader</Text>
                    </View>
                  </View>
                  <View style={{
                    backgroundColor: group.status === 'active' ? '#e8f5e9' : '#f5f5f5',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{
                      color: group.status === 'active' ? 'green' : 'gray',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}>
                      {group.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Leader Contact Info */}
                <View style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: 12, 
                  borderRadius: 8, 
                  marginBottom: 15,
                  borderLeftWidth: 3,
                  borderLeftColor: '#2196F3',
                  flexDirection: 'row',
                }}>
                  {/* Left Side - Leader Info */}
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    {/* Leader Name */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#2196F3',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 8,
                      }}>
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                          👑
                        </Text>
                      </View>
                      <Text style={{ 
                        color: '#1f2937', 
                        fontSize: 14,
                        fontWeight: '600',
                        flex: 1,
                      }} numberOfLines={1}>
                        {group.leader.name}
                      </Text>
                    </View>

                    {/* Phone */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <PhoneIcon size={16} color="#10b981" />
                      <Text style={{ 
                        marginLeft: 8, 
                        color: '#1f2937', 
                        fontSize: 13,
                        fontWeight: '500',
                        flex: 1,
                      }} numberOfLines={1}>
                        +{group.leader.phone}
                      </Text>
                    </View>
                    
                    {/* Address */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <MapPinIcon size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                      <Text style={{ 
                        marginLeft: 8, 
                        color: '#4b5563', 
                        fontSize: 12,
                        flex: 1,
                        lineHeight: 18,
                      }} numberOfLines={2}>
                        {group.deliveryAddress?.completeAddress || 'Address not provided'}
                      </Text>
                    </View>
                  </View>

                  {/* Vertical Divider */}
                  <View style={{
                    width: 1,
                    backgroundColor: '#cbd5e1',
                    marginHorizontal: 8,
                  }} />

                  {/* Right Side - Product Info */}
                  <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center' }}>
                    <Image
                      source={{ uri: group.product.banner }}
                      style={{ 
                        width: '100%', 
                        height: 60, 
                        borderRadius: 6,
                        marginBottom: 6,
                      }}
                      resizeMode="cover"
                    />
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: 2,
                    }} numberOfLines={2}>
                      {group.product.name}
                    </Text>
                    <Text style={{
                      fontSize: 10,
                      color: '#6b7280',
                    }} numberOfLines={1}>
                      {group.product.weight}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <Progress.Bar
                  progress={progress}
                  width={screenWidth - 70}
                  height={8}
                  color="#2196F3"
                  unfilledColor="#e0e0e0"
                  borderWidth={0}
                />

                {/* Stats */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <UsersIcon size={16} color="gray" />
                    <Text style={{ color: 'gray' }}>
                      {group.currentParticipants}/{group.maxParticipants} joined
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <ClockIcon size={16} color="gray" />
                    <Text style={{ color: 'gray', fontWeight: 'bold' }}>{timeLeft}</Text>
                  </View>
                </View>

                {/* Join Button */}
                {spotsLeft > 0 && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('GroupDetail', { groupCode: group.uniqueCode })}
                    style={{
                      backgroundColor: '#2196F3',
                      padding: 12,
                      borderRadius: 8,
                      marginTop: 15,
                      alignItems: 'center',
                    }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      Join Group ({spotsLeft} spots left)
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};