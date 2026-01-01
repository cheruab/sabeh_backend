import React from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';

export const Account = () => {
  const { currentUser } = useSelector((state) => state.user);

  // Debug: Log currentUser to see what data we have
  console.log('Current User Data:', currentUser);

  // Get full name from user data
  const getFullName = () => {
    if (!currentUser) return 'Guest User';
    
    const firstName = currentUser.name || '';
    const lastName = currentUser.lastName || '';
    
    // Combine first and last name
    const fullName = `${firstName} ${lastName}`.trim();
    
    // If we have a name, return it
    if (fullName) {
      return fullName;
    }
    
    // Fallback to email or phone if no name
    return currentUser.email || currentUser.phone || 'Guest User';
  };

  // Get contact info (phone or email) - this should be separate from name
  const getContactInfo = () => {
    if (!currentUser) return '';
    
    // Prioritize showing phone number
    if (currentUser.phone) {
      return `+${currentUser.phone}`;
    }
    
    // If no phone, show email
    if (currentUser.email) {
      return currentUser.email;
    }
    
    return '';
  };

  return (
    <View
      style={{
        flexDirection: 'column',
        gap: 10,
      }}>
      <Text
        style={{
          color: 'black',
          fontSize: 25,
          fontWeight: 'bold',
        }}>
        My account
      </Text>
      <View>
        <Text
          style={{
            color: 'black',
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 4,
          }}>
          {getFullName()}
        </Text>
        {getContactInfo() && (
          <Text
            style={{
              color: 'gray',
              fontSize: 14,
            }}>
            {getContactInfo()}
          </Text>
        )}
      </View>
    </View>
  );
};