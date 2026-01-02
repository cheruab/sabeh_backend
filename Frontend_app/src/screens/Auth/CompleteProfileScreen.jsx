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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';

// ✅ FIXED: Use localhost after adb reverse
const API_URL = `${BASE_URL}/customer`;

export const CompleteProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { phone } = route.params;

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    return pwd.length >= 6;
  };

  const handleComplete = async () => {
    try {
      // Validation
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter your first name');
        return;
      }

      if (!lastName.trim()) {
        Alert.alert('Error', 'Please enter your last name');
        return;
      }

      if (!password) {
        Alert.alert('Error', 'Please enter a password');
        return;
      }

      if (!validatePassword(password)) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      setLoading(true);

      // Create account
      const response = await axios.post(
        `${API_URL}/auth/signup/complete`,
        {
          phone,
          password,
          name: name.trim(),
          lastName: lastName.trim(),
        }
      );

      setLoading(false);

      if (response.data.id && response.data.token) {
        // Save to Redux
        dispatch(loginSuccess(response.data));

        Alert.alert(
          'Success! 🎉',
          'Your account has been created successfully!',
          [
            {
              text: 'Get Started',
              onPress: () => {
                // Navigate will happen automatically due to Redux state change
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Complete profile error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to create account'
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>👤</Text>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Just a few more details to get started
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
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
                <Text style={styles.hint}>At least 6 characters</Text>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <EyeSlashIcon size={24} color="#666" />
                    ) : (
                      <EyeIcon size={24} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Phone Display */}
              <View style={styles.phoneDisplay}>
                <Text style={styles.phoneLabel}>Phone Number:</Text>
                <Text style={styles.phoneNumber}>+{phone}</Text>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
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
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  optional: {
    color: '#999',
    fontWeight: '400',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#F8F9FA',
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
  hint: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginTop: 8,
  },
  phoneLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
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
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});