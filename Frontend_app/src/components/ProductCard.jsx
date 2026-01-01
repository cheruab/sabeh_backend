import React, {useState, useEffect} from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {HeartIcon, UserGroupIcon} from 'react-native-heroicons/outline';
import {HeartIcon as HeartSolidIcon} from 'react-native-heroicons/solid';
import {useDispatch, useSelector} from 'react-redux';
import {ADD_TO_CART} from '../redux/cartSlice';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export const ProductCard = ({item, wishlist, onToggleWishlist}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart);

  useEffect(() => {
    setIsInWishlist(
      wishlist?.some(wishlistItem => wishlistItem._id === item._id),
    );
  }, [wishlist, item._id]);

  const isItemInCart = cartItems.find(i => i._id === item._id);
  const groupPrice = item.groupPrice || item.regular_price * 0.8;
  const discount = Math.round(((item.regular_price - groupPrice) / item.regular_price) * 100);

  return (
    <View style={[styles.card, {width: cardWidth}]}>
      {/* Top Row */}
      <View style={styles.topRow}>
        {discount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{discount}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={async () => {
            await onToggleWishlist(item._id);
            setIsInWishlist(!isInWishlist);
          }}>
          {isInWishlist ? (
            <HeartSolidIcon size={16} color="#FF3B30" />
          ) : (
            <HeartIcon size={16} color="#999" />
          )}
        </TouchableOpacity>
      </View>

      {/* Compact Image */}
      <View style={styles.imageBox}>
        <Image style={styles.image} source={{uri: item.banner}} resizeMode="contain" />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.weight}>{item.weight}</Text>
      </View>

      {/* Rectangular Buttons with Prices */}
      <View style={styles.actions}>
        {/* Buy Alone Button - Rectangular */}
        <TouchableOpacity
          style={[styles.btn, styles.aloneBtn]}
          onPress={() => {
            dispatch(ADD_TO_CART({...item, quantity: 1}));
          }}>
          <Text style={styles.btnLabel}>Buy Alone</Text>
          <View style={styles.priceRow}>
            <Text style={styles.btnPrice}>{item.regular_price}</Text>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>Birr</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* For Group Button - Rectangular */}
        <TouchableOpacity
          style={[styles.btn, styles.groupBtn]}
          onPress={() => {
            navigation.navigate('GroupOptions', {
              product: {
                ...item,
                groupPrice: groupPrice,
                discount: discount,
              },
            });
          }}>
          <View style={styles.groupTop}>
            <UserGroupIcon size={10} color="#fff" strokeWidth={2.5} />
            <Text style={styles.groupLabel}>For GROUP</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.groupBtnPrice}>{groupPrice.toFixed(0)}</Text>
            <View style={styles.currencyBadgeGroup}>
              <Text style={styles.currencyTextGroup}>Birr</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* In Cart Badge */}
      {isItemInCart && (
        <View style={styles.cartBadge}>
          <View style={styles.cartDot} />
          <Text style={styles.cartText}>{isItemInCart.quantity} in cart</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 8,
    paddingBottom: 4,
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  }, 
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  wishlistBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  imageBox: {
    width: '100%',
    height: 110,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 16,
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  weight: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 6,
  },
  btn: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  aloneBtn: {
    backgroundColor: '#fab861ff',
    borderWidth: 1,
    borderColor: 'rgba(241, 169, 14, 0.12)',
  },
  groupBtn: {
    backgroundColor: '#f8461aff',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  btnLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffffff',
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  groupTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  groupLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },  
  btnPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fdfcfcff',
    letterSpacing: 0.2,
  },
  groupBtnPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  currencyBadge: {
    backgroundColor: '#f74040ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fffefeff',
    letterSpacing: 0.2,
  },
  currencyBadgeGroup: {
    backgroundColor: 'rgba(219, 10, 38, 0.97)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  currencyTextGroup: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  cartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 5,
    gap: 5,
  },
  cartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  cartText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

