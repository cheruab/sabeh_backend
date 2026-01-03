import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  ToastAndroid,
  Share,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCurrentGroup, updateGroup } from '../../redux/groupSlice';
import { Loader } from '../../components/Loader';
import * as Progress from 'react-native-progress';
import { 
  UsersIcon, 
  ClockIcon, 
  ShareIcon,
  CheckCircleIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { BASE_URL } from '../../config';

export const GroupDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const groupCode = route.params?.groupCode;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Join form
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinName, setJoinName] = useState(currentUser?.name || '');
  const [joinPhone, setJoinPhone] = useState(currentUser?.phone || '');
  const [quantity, setQuantity] = useState('1');

  const screenWidth = Dimensions.get('window').width;

  // Fetch group details
  const fetchGroup = async () => {
  try {
    setLoading(true);
    const response = await axios.get(
      `${BASE_URL}/group/${groupCode}`
    );
    setGroup(response.data);
    dispatch(setCurrentGroup(response.data));
    setLoading(false);
  } catch (error) {
    setLoading(false);
    console.error('Fetch group error:', error);
    Alert.alert('Error', 'Failed to load group details');
  }
};


  // Calculate time left
  useEffect(() => {
    if (!group) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const expires = new Date(group.expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [group]);

  useEffect(() => {
    fetchGroup();
  }, [groupCode]);

  // Share group
  const handleShare = async () => {
    try {
      const shareUrl = `sabeh://group/${group.uniqueCode}`;
      const message = `🎉 Join my group buy and save!

${group.product.name}
Regular: Birr ${group.product.regular_price}
Group Price: Birr ${group.product.group_price}

${group.currentParticipants}/${group.maxParticipants} members joined
${timeLeft}

Join now: ${shareUrl}`;

      await Share.share({
        message,
        title: 'Join Sabeh Group Buy',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Join group
  const handleJoin = async () => {
    try {
      if (!joinName || !joinPhone) {
        Alert.alert('Error', 'Please enter your name and phone');
        return;
      }

      setJoining(true);

      const response = await axios.post(
  `${BASE_URL}/group/${groupCode}/join`,
  {
    name: joinName,
    phone: joinPhone,
    quantity: parseInt(quantity) || 1,
  },
  {
    headers: {
      Authorization: `Bearer ${currentUser.token}`,
      'Content-Type': 'application/json',
    },
  }
);

      setGroup(response.data);
      dispatch(updateGroup(response.data));
      setShowJoinForm(false);
      setJoining(false);

      ToastAndroid.show('Successfully joined the group!', ToastAndroid.SHORT);
    } catch (error) {
      setJoining(false);
      console.error('=== JOIN ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Failed to join group'
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

  if (!group) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Group not found</Text>
      </SafeAreaView>
    );
  }

  const isLeader = group.leader.customerId === currentUser?._id;
  const hasJoined = group.participants.some(p => p.customerId === currentUser?._id);
  const progress = group.currentParticipants / group.maxParticipants;
  const spotsLeft = group.maxParticipants - group.currentParticipants;
  const savingsPerPerson = group.product.regular_price - group.product.group_price;

  return (
    <>
      <StatusBar backgroundColor="green" />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Status Badge */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <View style={{
              backgroundColor: group.status === 'active' ? 'green' : 'gray',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                {group.status.toUpperCase()}
              </Text>
            </View>
            {isLeader && (
              <View style={{
                backgroundColor: '#ffd700',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}>
                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 12 }}>
                  👑 YOU'RE THE LEADER
                </Text>
              </View>
            )}
          </View>

          {/* Product Card */}
          <View style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <Image
                source={{ uri: group.product.banner }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'black' }}>
                  {group.product.name}
                </Text>
                <Text style={{ color: 'gray', marginTop: 5 }}>{group.product.weight}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <Text style={{ textDecorationLine: 'line-through', color: 'gray' }}>
                    Birr {group.product.regular_price}
                  </Text>
                  <Text style={{ fontWeight: 'bold', color: 'green', fontSize: 18 }}>
                    Birr {group.product.group_price}
                  </Text>
                </View>
                <View style={{ backgroundColor: 'red', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 8 }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                    SAVE Birr {savingsPerPerson.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress */}
          <View style={{
            backgroundColor: '#e8f5e9',
            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black', marginBottom: 10 }}>
              Group Progress
            </Text>
            <Progress.Bar
              progress={progress}
              width={screenWidth - 80}
              height={10}
              color="green"
              unfilledColor="#ddd"
              borderWidth={0}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'green' }}>
                {group.currentParticipants}/{group.maxParticipants}
              </Text>
              <Text style={{ color: 'gray' }}>
                {spotsLeft} spots left
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
              <ClockIcon size={16} color="gray" />
              <Text style={{ color: 'gray', fontWeight: 'bold' }}>{timeLeft}</Text>
            </View>
          </View>

          {/* Group Leader Info - Replacing Group Code */}
          <View style={{
            backgroundColor: '#f0f9ff',
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#bfdbfe',
          }}>
            <Text style={{ color: '#1e40af', marginBottom: 12, fontWeight: 'bold', fontSize: 16 }}>
              👑 Group Leader Information
            </Text>
            
            {/* Leader Name */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#3b82f6',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}>
                <UserIcon size={18} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>Leader Name</Text>
                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 16 }}>
                  {group.leader.name}
                </Text>
              </View>
            </View>

            {/* Leader Phone */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#10b981',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}>
                <PhoneIcon size={18} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>Phone Number</Text>
                <Text style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 16 }}>
                  +{group.leader.phone}
                </Text>
              </View>
            </View>

            {/* Delivery Address */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f59e0b',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}>
                <MapPinIcon size={18} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>Delivery Address</Text>
                <Text style={{ fontWeight: '600', color: '#1f2937', fontSize: 14, lineHeight: 20 }}>
                  {group.deliveryAddress?.completeAddress || 'Address not provided'}
                </Text>
              </View>
            </View>
          </View>

          {/* Members List */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black', marginBottom: 10 }}>
              Members ({group.participants.length})
            </Text>
            {group.participants.map((participant, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'green',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {participant.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    {participant.name}
                    {participant.customerId === group.leader.customerId && ' 👑'}
                  </Text>
                  <Text style={{ color: 'gray', fontSize: 12 }}>
                    Quantity: {participant.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Join Status / Actions */}
          {hasJoined ? (
            <View style={{ marginBottom: 20 }}>
              <View style={{
                backgroundColor: '#e8f5e9',
                padding: 15,
                borderRadius: 10,
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <CheckCircleIcon size={40} color="green" />
                <Text style={{ color: 'green', fontWeight: 'bold', marginTop: 10 }}>
                  You're in this group!
                </Text>
              </View>

              {/* Checkout Button - Only show if group is completed */}
              {group.status === 'completed' && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('GroupCheckout', { 
                    group, 
                    isLeader 
                  })}
                  style={{
                    backgroundColor: 'green',
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    Proceed to Checkout
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : !showJoinForm && spotsLeft > 0 && group.status === 'active' ? (
            <TouchableOpacity
              onPress={() => setShowJoinForm(true)}
              style={{
                backgroundColor: 'green',
                padding: 15,
                borderRadius: 10,
                alignItems: 'center',
                marginBottom: 20,
              }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Join This Group
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Join Form */}
          {showJoinForm && !hasJoined && (
            <View style={{
              backgroundColor: '#f5f5f5',
              padding: 20,
              borderRadius: 10,
              marginBottom: 20,
            }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 15 }}>
                Join Group
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                  backgroundColor: 'white',
                  color: 'black',
                }}
                placeholder="Your Name"
                placeholderTextColor="#999"
                value={joinName}
                onChangeText={setJoinName}
              />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                  backgroundColor: 'white',
                  color: 'black',
                }}
                placeholder="Your Phone"
                placeholderTextColor="#999"
                value={joinPhone}
                onChangeText={setJoinPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 15,
                  backgroundColor: 'white',
                  color: 'black',
                }}
                placeholder="Quantity"
                placeholderTextColor="#999"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
              <TouchableOpacity
                onPress={handleJoin}
                disabled={joining}
                style={{
                  backgroundColor: joining ? 'gray' : 'green',
                  padding: 15,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  {joining ? 'Joining...' : 'Confirm & Join'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowJoinForm(false)}
                style={{
                  padding: 15,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'gray' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Share Button */}
          <TouchableOpacity
            onPress={handleShare}
            style={{
              backgroundColor: '#2196F3',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <ShareIcon size={20} color="white" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Share Group Link
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};