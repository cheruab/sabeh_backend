import axios from "axios";

// ✅ ADD https:// prefix!
const PRODUCTION_URL = "https://sabehbackend-production.up.railway.app";

// ✅ For development, use your local machine IP (not localhost)
const DEVELOPMENT_URL = "http://192.168.137.1:8000"; // Replace X with your actual IP

export const BASE_URL = __DEV__ ? DEVELOPMENT_URL : PRODUCTION_URL;

console.log('🌐 Using API URL:', BASE_URL);

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
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
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
      console.error(`❌ ${error.config?.url} - ${error.response?.status || 'Network Error'}`);
      return Promise.reject(error);
    }
  );
});

export default BASE_URL;