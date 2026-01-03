import React from 'react';
import { Text, TextInput, StyleSheet, View, Image, SafeAreaView, TouchableOpacity, PixelRatio, StatusBar, ToastAndroid, Dimensions } from 'react-native';
import { customerAxiosInstance } from '../../config';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useDispatch } from "react-redux";
import { loginFailure, loginStart, loginSuccess } from '../../redux/userSlice';
import { useSelector } from "react-redux";
import { Home } from '../Home/Home';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc421"
  },
  pic: {
    flex: 0.5,
    objectFit: "cover"
  },
  loginContainer: {
    flex: 0.5,
    backgroundColor: "white",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  logo: {
    width: "20%",
    height: "20%",
    marginTop: PixelRatio.getPixelSizeForLayoutSize(5),
    objectFit: "contain",
    borderRadius: 10
  },
  input: {
    height: 40,
    margin: 12,
    width: "80%",
    borderRadius: 10,
    borderColor: "grey",
    borderWidth: 1,
    padding: 10,
  },
  mainheading: {
    marginTop: PixelRatio.getPixelSizeForLayoutSize(5),
    fontSize: PixelRatio.getPixelSizeForLayoutSize(10),
    fontWeight: "bold",
    color: "black"
  },
  dusriheading: {
    fontWeight: "bold",
    color: "black"
  },
  button: {
    height: 40,
    width: "80%",
    borderRadius: 10,
    borderColor: "grey",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#0d9903",
    color: "white",
    marginTop: PixelRatio.getPixelSizeForLayoutSize(2),
  },
  testButton: {
    height: 40,
    width: "80%",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    backgroundColor: "#FF9800",
    color: "white",
    marginTop: 10,
  }
});

export const Login = ({ }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.user);
  const screenWidth = Dimensions.get('window').width;

  // 🆕 AUTO-LOGIN FOR TESTING (DEMO MODE)
  const handleDemoLogin = () => {
    // Mock user data - no backend call needed
    const mockUser = {
      id: 'demo_user_12345',
      name: 'Demo',
      lastName: 'User',
      phone: '251912345678',
      email: 'demo@sabeh.com',
      isAdmin: false,
      token: 'demo_token_for_testing_purposes_only'
    };

    dispatch(loginSuccess(mockUser));
    ToastAndroid.show('🎉 Demo Mode - Logged in!', ToastAndroid.SHORT);
  };

  // Format phone number helper
  const formatPhoneNumber = (text: string) => {
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

  const handleLogin = async () => {
    try {
      if (!phone || !password) {
        ToastAndroid.show('Please enter phone and password', ToastAndroid.SHORT);
        return;
      }

      setLoading(true);
      const formattedPhone = formatPhoneNumber(phone);

      dispatch(loginStart());
      
      const response = await customerAxiosInstance.post('/auth/login/phone', {
        phone: formattedPhone,
        password: password,
      });

      if (response.data.message) {
        setLoading(false);
        ToastAndroid.show('Invalid credentials', ToastAndroid.SHORT);
        dispatch(loginFailure());
        return;
      }

      if (response.data.id && response.data.token) {
        dispatch(loginSuccess(response.data));
        ToastAndroid.show('Login successful!', ToastAndroid.SHORT);
        setLoading(false);
      } else {
        setLoading(false);
        ToastAndroid.show('Login failed', ToastAndroid.SHORT);
        dispatch(loginFailure());
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch(loginFailure());
      ToastAndroid.show('Login failed. Check your connection.', ToastAndroid.SHORT);
      setLoading(false);
    }
  };

  return (
    <>
      {
        currentUser ? <Home /> :
          <>
            <StatusBar backgroundColor='#ecfa23' barStyle={'dark-content'} />

            <SafeAreaView style={styles.container}>
              <Image style={styles.pic}
                source={{
                  uri: 'https://i.postimg.cc/Hkd3yCBN/bg.png',
                }}
              />
              <View style={styles.loginContainer}>
                <Image style={styles.logo} source={require("../../images/sabehlogo.png")} />
                <Text style={styles.mainheading}>Sabeh Grocery app</Text>
                <Text style={styles.dusriheading}>Log in with Phone</Text>
                
                {/* 🆕 DEMO LOGIN BUTTON - PROMINENT PLACEMENT */}
                <TouchableOpacity
                  onPress={handleDemoLogin}
                  style={styles.testButton}
                >
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                    🎯 DEMO MODE - Quick Login
                  </Text>
                </TouchableOpacity>

                {/* Phone Input */}
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setPhone(text)}
                  value={phone}
                  placeholder="Phone (e.g., 0912345678)"
                  keyboardType="phone-pad"
                />
                
                {/* Password Input */}
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                  secureTextEntry={true}
                  placeholder="Enter your password"
                />
                
                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.button}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {loading ? 'Logging in...' : 'Continue'}
                  </Text>
                </TouchableOpacity>

                {/* New Phone Auth Buttons */}
                <TouchableOpacity
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate('PhoneSignup');
                  }}
                  style={[styles.button, { backgroundColor: '#2196F3', marginTop: 10 }]}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Sign Up with Phone
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate('PhoneLogin');
                  }}
                  style={[styles.button, { backgroundColor: '#4CAF50', marginTop: 10 }]}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Login with OTP
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={{
                backgroundColor: "#d3d3d3",
                fontSize: PixelRatio.getPixelSizeForLayoutSize(4),
                textAlign: "center",
                padding: 5
              }}>
                By continuing, you agree to our Terms of service & Privacy policy
              </Text>
            </SafeAreaView>
          </>
      }
    </>
  );
};