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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { loginSuccess, loginFailure } from '../../redux/userSlice';
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { BASE_URL } from '../../config';



export const PhoneLoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length > 0 && !cleaned.startsWith('251')) {
      if (cleaned.startsWith('0')) {
        return '251' + cleaned.substring(1);
      } else if (cleaned.startsWith('9')) {
        return '251' + cleaned;
      }
      return cleaned;
    }
    return cleaned;
  };
  
  const handlePasswordLogin = async () => {
    try {
      if (!phone || !password) {
        Alert.alert('Error', 'Please enter phone number and password');
        return;
      }

      setLoading(true);
      const formattedPhone = formatPhoneNumber(phone);

      const response = await axios.post(
  `${BASE_URL}/customer/auth/login/phone`,
  { phone: formattedPhone, password }
);
      setLoading(false);

      if (response.data.message) {
        Alert.alert('Error', 'Invalid phone number or password');
        dispatch(loginFailure());
        return;
      }

      if (response.data.id && response.data.token) {
        dispatch(loginSuccess(response.data));
        Alert.alert('Success', 'Login successful!');
        navigation.replace("Home");
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Login failed. Please try again.'
      );
      dispatch(loginFailure());
    }
  };

  const handleOTPLogin = async () => {
    try {
      if (!phone) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }

      setLoading(true);
      const formattedPhone = formatPhoneNumber(phone);
      const phoneWithPlus = `+${formattedPhone}`;

      // Send OTP
     const response = await axios.post(
  `${BASE_URL}/customer/auth/login/otp/send`,
  { phone: formattedPhone }
);

      if (!response.data.success) {
        setLoading(false);
        Alert.alert('Error', response.data.error || 'Failed to send OTP');
        return;
      }

      // Firebase OTP
      const confirmation = await auth().signInWithPhoneNumber(phoneWithPlus);

      setLoading(false);

      // Navigate to OTP screen
      navigation.navigate('OTPVerification', {
        phone: formattedPhone,
        phoneWithPlus,
        confirmation,
        type: 'login',
        devOTP: response.data.otp,
      });
    } catch (error) {
      setLoading(false);
      console.error('OTP login error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to send OTP. Please try again.'
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
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../../images/logo.png')}
            />
            <Text style={styles.appName}>Sabeh</Text>
            <Text style={styles.tagline}>Social Buying Platform</Text>
          </View>

          {/* Login Method Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                loginMethod === 'password' && styles.tabActive,
              ]}
              onPress={() => setLoginMethod('password')}>
              <Text
                style={[
                  styles.tabText,
                  loginMethod === 'password' && styles.tabTextActive,
                ]}>
                Password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'otp' && styles.tabActive]}
              onPress={() => setLoginMethod('otp')}>
              <Text
                style={[
                  styles.tabText,
                  loginMethod === 'otp' && styles.tabTextActive,
                ]}>
                OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
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
              />
            </View>
          </View>

          {/* Password Input (if password method) */}
          {loginMethod === 'password' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeSlashIcon size={24} color="#666" />
                  ) : (
                    <EyeIcon size={24} color="#666" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={loginMethod === 'password' ? handlePasswordLogin : handleOTPLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {loginMethod === 'password' ? 'Log In' : 'Send OTP'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PhoneSignup')}>
              <Text style={styles.linkText}>Sign Up</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#E0E0E0',
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
    borderRightColor: '#E0E0E0',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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