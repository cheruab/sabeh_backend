import axios from "axios";

// For Android Emulator, use 10.0.2.2 instead of localhost
// Main service base URL (Customer, Product, Shopping)
export const BASE_URL = "sabehbackend-production.up.railway.app";

// Group service base URL - runs on port 8004
export const GROUP_BASE_URL = "http://10.0.2.2:8004";

// For product/category endpoints
export const axiosInstance = axios.create({
  baseURL: BASE_URL + "/product",
});

// For customer endpoints (login, addresses, etc)
export const customerAxiosInstance = axios.create({
  baseURL: BASE_URL + "/customer",
});

// For shopping endpoints (cart, orders, etc)
export const shoppingAxiosInstance = axios.create({
  baseURL: BASE_URL + "/shopping",
});

// For group buying endpoints
export const groupAxiosInstance = axios.create({
  baseURL: GROUP_BASE_URL + "/group",
});