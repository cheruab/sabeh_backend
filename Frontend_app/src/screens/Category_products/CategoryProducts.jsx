import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  StatusBar,
  Dimensions,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowsUpDownIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  XCircleIcon,
} from 'react-native-heroicons/outline';
import { ProductCard } from '../../components/ProductCard';
import { Footer } from '../../components/Footer';
import { axiosInstance } from '../../config';
import { useSelector } from 'react-redux';
import { Loader } from '../../components/Loader';
import axios from 'axios';

export const CategoryProducts = ({ route }) => {
  const [products, setProducts] = useState([]);
  const [subcat, setSubCat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const cartItems = useSelector(state => state.cart);
  const id = route?.params?.id;
  const { currentUser } = useSelector(state => state.user);
  const [sortBy, setSortBy] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [originalProducts, setOriginalProducts] = useState([]);

  const handleSubcategoryClick = subcategoryName => {
    setSelectedSubcategory(subcategoryName);
    const filteredProducts = products.filter(
      product => product.subcategory === subcategoryName
    );
    setProducts(filteredProducts);
  };

  const handleSort = method => {
    setSortBy(method);
    let sortedItems = [...products];

    if (method === true) {
      sortedItems.sort((a, b) => a.price - b.price);
    } else {
      sortedItems.sort((a, b) => b.price - a.price);
    }

    setProducts(sortedItems);
  };

  async function getWishlist() {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://10.0.2.2:8000/customer/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setWishlist(res?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function getProducts() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/category/${route.params.category}`
        );
        setProducts(res.data);
        setOriginalProducts(res.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    async function getCategoryData() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/get/category/${id}`);
        setSubCat(res?.data?.subcategory);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    }

    setSelectedSubcategory(null);
    getCategoryData();
    getWishlist();
    getProducts();
  }, []);

  const clearSubcategoryFilter = () => {
    setSelectedSubcategory(null);
    setProducts([...originalProducts]);
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <>
      <StatusBar backgroundColor="white" />

      {loading ? (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Loader screenWidth={screenWidth} />
        </SafeAreaView>
      ) : (
        <SafeAreaView
          style={{
            flex: 1,
            marginBottom: cartItems.length !== 0 ? 140 : 70,
          }}
        >
          {/* SORT / FILTER BAR */}
          <ScrollView
            horizontal
            style={{ margin: 10 }}
            contentContainerStyle={{ gap: 10 }}
          >
            {sortBy ? (
              <TouchableOpacity
                onPress={() => handleSort(false)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 6,
                  borderRadius: 10,
                  backgroundColor: 'white',
                }}
              >
                <ArrowsUpDownIcon size="15" color="black" />
                <Text style={{ marginHorizontal: 10 }}>Sort</Text>
                <ChevronDoubleDownIcon size="15" color="black" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleSort(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 6,
                  borderRadius: 10,
                  backgroundColor: 'white',
                }}
              >
                <ArrowsUpDownIcon size="15" color="black" />
                <Text style={{ marginHorizontal: 10 }}>Sort</Text>
                <ChevronDoubleUpIcon size="15" color="black" />
              </TouchableOpacity>
            )}

            {selectedSubcategory && (
              <TouchableOpacity
                onPress={clearSubcategoryFilter}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: 'white',
                }}
              >
                <Text style={{ marginRight: 10 }}>Clear Filter</Text>
                <XCircleIcon size="15" color="black" />
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* PRODUCT LIST */}
          <ScrollView style={{ padding: 5 }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
              }}
            >
              {products.map(item => (
                <ProductCard
                  key={item._id}
                  item={item}
                  wishlist={wishlist}
                  onToggleWishlist={async productId => {
                    try {
                      const resp = await axios.put(
                        'http://10.0.2.2:8000/product/wishlist',
                        { _id: productId },
                        {
                          headers: {
                            Authorization: `Bearer ${currentUser.token}`,
                            'Content-Type': 'application/json',
                          },
                        }
                      );

                      if (resp?.data) {
                        setWishlist([...wishlist, item]);
                      } else {
                        setWishlist(
                          wishlist.filter(
                            wishlistItem =>
                              wishlistItem._id !== productId
                          )
                        );
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      )}

      <Footer />
    </>
  );
};
