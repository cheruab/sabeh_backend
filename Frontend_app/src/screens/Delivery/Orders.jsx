import React from 'react';
import {Text, View, Dimensions} from 'react-native';

export const Orders = ({data, cartItems, total, address}) => {
  const screenWidth = Dimensions.get('window').width;
  
  // ✅ Use cartItems if data is not available (for new orders)
  const products = data?.products || cartItems || [];
  const orderTotal = data?.total || total || 0;
  const deliveryAddress = data?.address || address || null;
  
  // ✅ Handle empty/loading state
  if (!products || products.length === 0) {
    return (
      <View
        style={{
          margin: 10,
          width: screenWidth * 0.95,
          borderColor: 'black',
          borderWidth: 0.5,
          borderRadius: 10,
          padding: 10,
        }}>
        <Text style={{fontWeight: 'bold', textAlign: 'center'}}>
          Loading order details...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        margin: 10,
        width: screenWidth * 0.95,
        borderColor: 'black',
        borderWidth: 0.5,
        borderRadius: 10,
        padding: 10,
      }}>
      <View>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 16,
            marginBottom: 10,
          }}>
          Your order details
        </Text>
      </View>

      {/* ✅ Show Delivery Address */}
      {deliveryAddress && (
        <View
          style={{
            marginBottom: 10,
            backgroundColor: '#f0f0f0',
            padding: 10,
            borderRadius: 5,
          }}>
          <Text style={{fontWeight: 'bold', color: 'green', marginBottom: 5}}>
            📍 Delivery Address ({deliveryAddress.type || 'Home'}):
          </Text>
          <Text style={{color: 'gray'}}>
            {deliveryAddress.completeAddress || 'No address provided'}
          </Text>
        </View>
      )}

      <View>
        {products.map((item, index) => {
          // ✅ Handle both cart item structure and order product structure
          const productName = item?.name || item?.product?.name || 'Unknown Product';
          const productPrice = item?.price || item?.product?.price || 0;
          const productQuantity = item?.quantity || item?.unit || 1;
          
          return (
            <View
              key={item?._id || item?.product?._id || index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 5,
              }}>
              <Text>
                {productName} X {productQuantity}
              </Text>
              <Text> Birr {(productPrice * productQuantity).toFixed(2)}</Text>
            </View>
          );
        })}
        
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            marginTop: 5,
          }}
        />
        
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              color: 'black',
            }}>
            Subtotal
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              color: 'red',
            }}>
            Birr {orderTotal < 99 ? (orderTotal - 15).toFixed(2) : orderTotal.toFixed(2)}
          </Text>
        </View>
        
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              color: 'black',
            }}>
            Delivery Charge
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              color: '#3477eb',
            }}>
            {orderTotal < 99 ? 'Birr 15' : 'Free'}
          </Text>
        </View>
        
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
          }}>
          <Text
            style={{
              fontWeight: 'bold',
              color: 'black',
            }}>  
            Total 
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              color: 'green',
            }}>
            Birr {orderTotal?.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};