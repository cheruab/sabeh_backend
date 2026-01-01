import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import auth from '@react-native-firebase/auth';

// ✅ FIXED: Changed port from 8000 to 8001
const API_URL = 'http://localhost:8001';

export const PhoneSignupScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const formatPhoneNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length > 0 && !cleaned.startsWith('251')) {
      // Assuming Ethiopian numbers, adjust as needed
      if (cleaned.startsWith('0')) {
        return '251' + cleaned.substring(1);
      } else if (cleaned.startsWith('9')) {
        return '251' + cleaned;
      }
      return cleaned;
    }
    return cleaned;
  };

const handleSendOTP = async () => {
  try {
    const cleanedPhone = phone.replace(/\D/g, '');
    
    if (!cleanedPhone || cleanedPhone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number (at least 9 digits)');
      return;
    }

    setLoading(true);
    
    const formattedPhone = formatPhoneNumber(phone);
    const phoneWithPlus = `+${formattedPhone}`;
     
    console.log('Sending OTP to:', phoneWithPlus);

    // Check if phone already registered and get OTP
    const checkResponse = await axios.post(
      `${API_URL}/auth/signup/send-otp`,
      { phone: formattedPhone },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!checkResponse.data.success) {
      setLoading(false);
      Alert.alert('Error', checkResponse.data.error || 'Failed to send OTP');
      return;
    }

    // ✅ SKIP FIREBASE - Go directly to OTP screen
    setLoading(false);

    // Navigate to OTP screen
    navigation.navigate('OTPVerification', {
      phone: formattedPhone,
      phoneWithPlus,
      confirmation: null, // No Firebase confirmation
      type: 'signup',
      devOTP: checkResponse.data.otp,
    });
     
     
  } catch (error) { 
    setLoading(false);
    console.error('Send OTP error:', error);
    Alert.alert(
      'Error',
      error.response?.data?.error || error.message || 'Failed to send OTP. Please try again.'
    );
  }
};

  // Test connection function
  const testConnection = async () => {
    try {
      console.log('Testing connection to:', `${API_URL}/whoami`);
      const response = await axios.get(`${API_URL}/whoami`, {
        timeout: 5000,
      });
      console.log('✅ Backend connected:', response.data);
      Alert.alert('Success', `Backend connected!\n${response.data.msg}`);
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      Alert.alert(
        'Connection Failed',
        `Cannot reach backend server.\nError: ${error.message}\n\nMake sure backend is running on port 8001`
      );
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>📱</Text>
            <Text style={styles.title}>Welcome to Sabeh</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to get started
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <View style={styles.phoneInputWrapper}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>🇪🇹 +251</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="912345678"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={15}
                autoFocus
              />
            </View>

            <Text style={styles.helperText}>
              We'll send you a verification code
            </Text>
          </View>

          {/* Test Connection Button (Development Only) */}
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#FF9800', marginBottom: 10 }]}
              onPress={testConnection}>
              <Text style={styles.buttonText}>🔧 Test Backend Connection</Text>
            </TouchableOpacity>
          )}

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Code</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PhoneLogin')}>
              <Text style={styles.linkText}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 32,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#4CAF50',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  helperText: {
    marginTop: 8,
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
  terms: {
    marginTop: 'auto',
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});