import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import { View, Text, StyleSheet } from 'react-native';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  ClipboardDocumentListIcon,
  UserCircleIcon,
  MagnifyingGlassIcon 
} from 'react-native-heroicons/outline';
import {
  HomeIcon as HomeSolid,
  ShoppingCartIcon as CartSolid,
  ClipboardDocumentListIcon as OrdersSolid,
  UserCircleIcon as UserSolid
} from 'react-native-heroicons/solid';

// Import screens
import { Home } from './src/screens/Home/Home';
import { Checkout } from './src/screens/Checkout/Checkout';
import { YourOrders } from './src/screens/YourOrders/YourOrders';
import { Profile } from './src/screens/Profile/Profile';
import { CategoryProducts } from './src/screens/Category_products/CategoryProducts';
import { AddAddress } from './src/screens/Address/AddAddress';
import { DeliveryScreen } from './src/screens/Delivery/DeliveryScreen';
import { Search } from './src/screens/Search/Search';
import { Wishlist } from './src/screens/Wishlist/Wishlist';
import { CreateGroupScreen } from './src/screens/Group/CreateGroupScreen';
import { GroupDetailScreen } from './src/screens/Group/GroupDetailScreen';
import { GroupCheckoutScreen } from './src/screens/Group/GroupCheckoutScreen';
import { GroupOptionsScreen } from './src/screens/Group/GroupOptionsScreen';
import { PhoneSignupScreen } from './src/screens/Auth/PhoneSignupScreen';
import { OTPVerificationScreen } from './src/screens/Auth/OTPVerificationScreen';
import { CompleteProfileScreen } from './src/screens/Auth/CompleteProfileScreen';
import { PhoneLoginScreen } from './src/screens/Auth/PhoneLoginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Cart badge component
const CartBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

// Bottom Tab Navigator
function MainTabs() {
  const cartItems = useSelector((state: any) => state.cart);
  const cartCount = cartItems?.length || 0;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#34C759',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            focused ? <HomeSolid size={26} color={color} /> : <HomeIcon size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Checkout"
        component={Checkout}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ focused, color }) => (
            <View>
              {focused ? <CartSolid size={26} color={color} /> : <ShoppingCartIcon size={26} color={color} />}
              <CartBadge count={cartCount} />
            </View>
          ),
          headerShown: true,
          title: 'My Cart',
          headerStyle: { backgroundColor: '#34C759' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={YourOrders}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused, color }) => (
            focused ? <OrdersSolid size={26} color={color} /> : <ClipboardDocumentListIcon size={26} color={color} />
          ),
          headerShown: true,
          title: 'My Orders',
          headerStyle: { backgroundColor: '#34C759' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={Profile}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused, color }) => (
            focused ? <UserSolid size={26} color={color} /> : <UserCircleIcon size={26} color={color} />
          ),
          headerShown: true,
          title: 'My Account',
          headerStyle: { backgroundColor: '#34C759' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
function AppNavigator() {
  const currentUser = useSelector((state: any) => state.user.currentUser);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      {/* Show auth screens if not logged in */}
      {!currentUser ? (
        <>
          <Stack.Screen
            name="PhoneLogin"
            component={PhoneLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PhoneSignup"
            component={PhoneSignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerificationScreen}
            options={{
              title: 'Verification',
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="CompleteProfile"
            component={CompleteProfileScreen}
            options={{
              title: 'Complete Profile',
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#fff',
              headerLeft: () => null,
            }}
          />
        </>
      ) : (
        <>
          {/* Main App with Bottom Tabs */}
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />

          {/* Other Screens (Outside bottom tabs) */}
          <Stack.Screen
            name="Category"
            component={CategoryProducts}
            options={({ route, navigation }: any) => ({
              title: route?.params?.category,
              headerTitleStyle: {
                fontSize: 20,
              },
              headerRight: () => (
                <MagnifyingGlassIcon
                  color="black"
                  size={30}
                  onPress={() => {
                    navigation.navigate('Search');
                  }}
                />
              ),
            })}
          />
          <Stack.Screen name="Add Address" component={AddAddress} />
          <Stack.Screen
            name="Delivery"
            component={DeliveryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Wishlist" 
            component={Wishlist}
            options={{
              title: 'My Wishlist',
              headerStyle: { backgroundColor: '#34C759' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Search"
            component={Search}
            options={{ headerShown: false }}
          />

          {/* Group Buying Screens */}
          <Stack.Screen
            name="GroupOptions"
            component={GroupOptionsScreen}
            options={{
              title: 'Group Buying Options',
              headerStyle: { backgroundColor: '#34C759' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroupScreen}
            options={{
              title: 'Create Group Buy',
              headerStyle: { backgroundColor: '#34C759' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="GroupDetail"
            component={GroupDetailScreen}
            options={{
              title: 'Group Details',
              headerStyle: { backgroundColor: '#34C759' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="GroupCheckout"
            component={GroupCheckoutScreen}
            options={{
              title: 'Checkout',
              headerStyle: { backgroundColor: '#34C759' },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default App;