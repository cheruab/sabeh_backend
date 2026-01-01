import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {axiosInstance} from '../../../config';
import {Loader} from '../../../components/Loader';
import {ProductCard} from '../../../components/ProductCard';

export const CategorySection = () => {
  const screenWidth = Dimensions.get('screen').width;
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  async function fetchAllProducts() {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/'); // Get all products
      setLoading(false);
      console.log(res);
      setProducts(res?.data);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const navigation = useNavigation();
  
  return (
    <>
      {loading ? (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Loader screenWidth={screenWidth} />
        </SafeAreaView>
      ) : (
        <SafeAreaView
          style={{
            margin: 10,
            flexDirection: 'column',
          }}>
          <View>
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              Featured Products
            </Text>
          </View>
          <ScrollView
            contentContainerStyle={{
              gap: 5,
            }}
            style={{marginTop: 10}}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                gap: 2,
              }}>
              {products?.slice(0, 10).map(item => {
                return <ProductCard key={item._id} item={item} />;
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </>
  );
};