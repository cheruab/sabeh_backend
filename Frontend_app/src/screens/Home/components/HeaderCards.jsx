import React, {useEffect, useState} from 'react';
import {ScrollView, View, Text, Image, TouchableOpacity} from 'react-native';
import {axiosInstance} from '../../../config';
import {useNavigation} from '@react-navigation/native';

export const HeaderCards = () => {
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  async function fetchCategories() {
    try {
      const res = await axiosInstance.get('/get/categories');
      setCategories(res?.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <ScrollView
      style={{marginVertical: 10}}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 10,
        gap: 20,
      }}
    >
      {categories.map(item => {
        return (
          <TouchableOpacity
            key={item._id}
            onPress={() => {
              navigation.navigate('Category', {
                category: item?.CategoryName,
                id: item?._id,
              });
            }}
            activeOpacity={0.8}
          >
            <View
              style={{
                width: 90,
                alignItems: 'center',
                gap: 8,
              }}
            >
              {/* Circle Image Card */}
              <View
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: 75,
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',

                  // 🔥 Zoomed + floating effect
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 5,
                  elevation: 8,
                  transform: [{ scale: 1.05 }],
                }}
              >
                <Image
                  style={{
                    width: 65,
                    height: 65,
                    borderRadius: 65,
                    resizeMode: 'contain',
                  }}
                  source={{uri: item.CategoryImage?.image_url}}
                />
              </View>

              {/* Label */}
              <Text
                style={{
                  fontWeight: '600',
                  color: '#333',
                  textAlign: 'center',
                  fontSize: 13,
                  textTransform: 'capitalize',
                }}
              >
                {item.CategoryName}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
