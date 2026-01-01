import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const API_URL = 'http://localhost:8001';

import axios from 'axios';

export const OTPVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { phone, phoneWithPlus, confirmation, type, devOTP } = route.params;
  
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-fill for development
  useEffect(() => {
    if (devOTP && __DEV__) {
      const otpArray = devOTP.toString().split('');
      setOTP(otpArray);
    }
  }, [devOTP]);

  const handleOTPChange = (value, index) => {
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (newOTP.every(digit => digit !== '') && newOTP.join('').length === 6) {
      handleVerifyOTP(newOTP.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    try {
      setLoading(true);
      const finalOTP = otpCode || otp.join('');

      if (finalOTP.length !== 6) {
        Alert.alert('Error', 'Please enter the complete 6-digit code');
        setLoading(false);
        return;
      }

      console.log('Verifying OTP:', finalOTP);

      // Verify with Firebase
      if (confirmation) {
        try {
          await confirmation.confirm(finalOTP);
        } catch (firebaseError) {
          console.log('Firebase verification failed:', firebaseError);
          // Continue with backend verification even if Firebase fails
        }
      }

      // Verify with backend
     const response = await axios.post(
  `${API_URL}/auth/signup/verify-otp`,
  { phone, otp: finalOTP }
);
          
      setLoading(false);

      if (response.data.success) {
        if (type === 'signup') {
          // Navigate to complete profile
          navigation.navigate('CompleteProfile', { phone });
        } else {
          // Login successful
          Alert.alert('Success', 'Login successful!');
          navigation.replace("Home");
          // Handle login success (navigate to home, etc.)
        }
      } else {
        Alert.alert('Error', response.data.error || 'Invalid OTP');
      }
    } catch (error) {
      setLoading(false);
      console.error('Verify OTP error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Invalid OTP. Please try again.'
      );
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setCanResend(false);
      setResendTimer(60);
      setOTP(['', '', '', '', '', '']);

     const response = await axios.post(
  `${API_URL}/customer/auth/${type}/send-otp`,
  { phone }
);

      setLoading(false);

      if (response.data.success) {
        Alert.alert('Success', 'New code sent successfully!');
      } else {
        Alert.alert('Error', response.data.error || 'Failed to send code');
      }
    } catch (error) {
      setLoading(false);
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🔐</Text>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a code to {phoneWithPlus || phone}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.changeNumber}>Change Number</Text>
            </TouchableOpacity>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Development hint */}
          {__DEV__ && devOTP && (
            <Text style={styles.devHint}>Dev OTP: {devOTP}</Text>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => handleVerifyOTP()}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                Resend code in {resendTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  changeNumber: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    backgroundColor: '#F8F9FA',
  },
  otpInputFilled: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  devHint: {
    textAlign: 'center',
    color: '#FF9800',
    marginBottom: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
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
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    color: '#999',
  },
  resendText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
});