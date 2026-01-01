import React from 'react';
import {Text, TextInput, View, Image, TouchableOpacity} from 'react-native';
import {styles} from '../Styles';
import { HeaderCards } from './HeaderCards';
import { SearchBar } from '../../../components/SearchBar';
import { useNavigation } from '@react-navigation/native';

export const HeaderComponent = () => {

  const navigation = useNavigation();

  return (
    <View style={styles.headComponent}>
      <View style={styles.top}>
     <View style={{ marginTop: 12 }}>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>
    DELIVERY IN
  </Text>

  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 28 }}>
    48 Hours
  </Text>

  <Text style={{ color: 'white', fontWeight: '400' }}>
    Addis Ababa, Ethiopia
  </Text>
</View>

        <View>
          <TouchableOpacity onPress={()=>{
            navigation.navigate("AccountTab");
          }} >
            <Image source={require('../../../images/account.png')} />
          </TouchableOpacity>
        </View>
      </View>
      <SearchBar place={"Search here"} />
    </View>
  );
};
