import React from 'react';
import { Image, View, Text } from 'react-native';
import { PhoneIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DeliveryPerson = ({ screenWidth }) => {
  return (
    <SafeAreaView
      style={{
        width: screenWidth,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 16,
      }}
    >
      {/* Profile Image */}
      <Image
        source={require('../../images/ds.png')}
        style={{
          height: 50,
          width: 50,
          borderRadius: 25,
        }}
      />

      {/* Text Container */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 14,
            color: '#000',
          }}
          numberOfLines={2}     // ✅ allows wrapping safely
        >
          I am Heavy Driver, Your Delivery Partner
        </Text>
      </View>

      {/* Call Icon */}
      <PhoneIcon size={36} color="green" />
    </SafeAreaView>
  );
};
