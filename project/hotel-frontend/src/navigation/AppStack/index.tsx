import React from 'react';
import AppStack_HomePageScreen from './AppStack_HomePageScreen';
import AppStack_HotelDetailScreen from './AppStack_HotelDetailScreen';
import AppStack_ProfileScreen from './AppStack_ProfileScreen';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {RootStackParamList} from 'RootNavigator';
import AuthStack from '../../navigation/AuthStack';
import AppStack_HotelSearch from './Appstack_HotelSearch';
import AppStack_PriceFilterScreen from './AppStack_PriceFilterScreen';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import AuthStack_OTPScreen from '../AuthStack/AuthStack_OTPScreen';
import AppStack_SpotDetailScreen from './AppStack_SpotDetailScreen';
export type AppStackParamList = {
  AppStack_HomePageScreen?: {
    searchResult: {
      latitude: number;
      longitude: number;
      formatted_address: string;
      icon: string;
    };
  };
  AppStack_HotelDetailScreen: {
    item: any;
  };
  AppStack_SpotDetailScreen: {
    item: any;
  };
  AppStack_HotelSearch: undefined;
  AppStack_LocationSearch: undefined;
  AppStack_PriceFilterScreen: undefined;
  AppStack_ProfileScreen: {
    countryCode: string;
  };
  AuthStack_OTPScreen: {
    confirmResult: FirebaseAuthTypes.ConfirmationResult;
    phoneNumber?: string;
    countryCode?: string;
    from?: string;
    type?: string;
    value?: string;
  };
  AuthStack_CountryScreen: {
    from: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'AppStack'>;
const Stack = createNativeStackNavigator<AppStackParamList>();
const AppStack: React.FC<Props> = ({navigation, route}) => {
  return (
    <Stack.Navigator initialRouteName="AppStack_HomePageScreen">
      <Stack.Screen
        name="AppStack_HomePageScreen"
        component={AppStack_HomePageScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AppStack_HotelDetailScreen"
        component={AppStack_HotelDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AppStack_SpotDetailScreen"
        component={AppStack_SpotDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AppStack_ProfileScreen"
        component={AppStack_ProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AppStack_HotelSearch"
        component={AppStack_HotelSearch}
        options={{headerShown: false, animation: 'ios'}}
      />
      <Stack.Screen
        name="AppStack_PriceFilterScreen"
        component={AppStack_PriceFilterScreen}
        options={{headerShown: false, animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="AuthStack_OTPScreen"
        component={AuthStack_OTPScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
