import axios from "axios";
import { Alert } from "react-native";

// ✅ Production URL with HTTPS
const PRODUCTION_URL = "https://sabehbackend-production.up.railway.app";

// For development
const DEVELOPMENT_URL = "http://192.168.137.1:8000";

export const BASE_URL = __DEV__ ? DEVELOPMENT_URL : PRODUCTION_URL;

console.log('🌐 Using API URL:', BASE_URL);
console.log('📱 __DEV__ mode:', __DEV__);

// Create axios instances with LONGER timeout for Railway
export const axiosInstance = axios.create({
  baseURL: BASE_URL + "/product",
  timeout: 30000, // ✅ 30 seconds (was 10000)
});

export const customerAxiosInstance = axios.create({
  baseURL: BASE_URL + "/customer",
  timeout: 30000, // ✅ 30 seconds
});

export const shoppingAxiosInstance = axios.create({
  baseURL: BASE_URL + "/shopping",
  timeout: 30000, // ✅ 30 seconds
});

export const groupAxiosInstance = axios.create({
  baseURL: BASE_URL + "/group",
  timeout: 30000, // ✅ 30 seconds
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
      
      if (!error.response) {
        console.error('🔴 Network Error - Cannot reach server');
      }
      
      return Promise.reject(error);
    }
  );
});

export default BASE_URL;