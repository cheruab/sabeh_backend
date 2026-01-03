import axios from "axios";
import { Alert } from "react-native";

// ✅ ADD https:// prefix!
const PRODUCTION_URL = "https://sabehbackend-production.up.railway.app";

// ✅ For development, use your local machine IP (not localhost)
const DEVELOPMENT_URL = "http://192.168.137.1:8000";

// 🆕 FORCE PRODUCTION URL FOR TESTING (Remove after fixing)
// Uncomment this line to ALWAYS use production URL even in dev mode:
// export const BASE_URL = PRODUCTION_URL;

export const BASE_URL = __DEV__ ? DEVELOPMENT_URL : PRODUCTION_URL;

console.log('🌐 Using API URL:', BASE_URL);
console.log('📱 __DEV__ mode:', __DEV__);

// 🆕 Test connection on app start
const testConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    const response = await axios.get(`${BASE_URL}/customer/whoami`, {
      timeout: 5000,
    });
    console.log('✅ Backend connected:', response.data);
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    // Alert.alert(
    //   'Connection Error',
    //   `Cannot connect to backend.\nURL: ${BASE_URL}\nError: ${error.message}`
    // );
  }
};

// Run test on import
testConnection();

// For product/category endpoints
export const axiosInstance = axios.create({
  baseURL: BASE_URL + "/product",
  timeout: 10000,
});

// For customer endpoints
export const customerAxiosInstance = axios.create({
  baseURL: BASE_URL + "/customer",
  timeout: 10000,
});

// For shopping endpoints
export const shoppingAxiosInstance = axios.create({
  baseURL: BASE_URL + "/shopping",
  timeout: 10000,
});

// For group buying endpoints
export const groupAxiosInstance = axios.create({
  baseURL: BASE_URL + "/group",
  timeout: 10000,
});

// Add interceptors
[axiosInstance, customerAxiosInstance, shoppingAxiosInstance, groupAxiosInstance].forEach(instance => {
  instance.interceptors.request.use(
    (config) => {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      console.log(`✅ ${response.config.url} - ${response.status}`);
      return response;
    },
    (error) => {
      console.error(`❌ API Error:`, {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      
      // 🆕 Show user-friendly error
      if (!error.response) {
        console.error('🔴 Network Error - Cannot reach server');
      }
      
      return Promise.reject(error);
    }
  );
});

export default BASE_URL;