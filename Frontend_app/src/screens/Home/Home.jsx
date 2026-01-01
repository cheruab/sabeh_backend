import React from 'react';
import { SafeAreaView, StatusBar, ScrollView, View } from 'react-native';
import { HeaderComponent } from './components/HeaderComponent';
import { Highlight } from './components/Highlight';
import { CategorySection } from './components/CategorySection';
import { Footer } from '../../components/Footer';
import { useSelector } from 'react-redux';
import { HeaderCards } from './components/HeaderCards';

export const Home = () => {
  const cartItems = useSelector(state => state.cart);

  return (
    <>
      <StatusBar backgroundColor="#f01f1f" />

      <SafeAreaView
        style={{
          flex: 1,
          marginBottom: cartItems.length !== 0 ? 140 : 70,
        }}
      >
        {/* 🔒 FIXED SECTION */}
        <View>
          <HeaderComponent />
          <HeaderCards />
          
        </View>
   
        {/* 📜 SCROLLABLE CONTENT */}
        <ScrollView>
          {/* put content that should scroll here */}
          <Highlight />
          <CategorySection />
        </ScrollView>
      </SafeAreaView>

      <Footer />
    </>
  );
};
