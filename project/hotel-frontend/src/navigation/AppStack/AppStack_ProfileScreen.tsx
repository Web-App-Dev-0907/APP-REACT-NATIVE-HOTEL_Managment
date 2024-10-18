import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  TextInput,
  Linking,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import tw from '../../../tailwindcss';
import dayjs from 'dayjs';
import LinearGradient from 'react-native-linear-gradient';
import GoBackIcon from '../../components/GoBackIcon';
import {AppStackParamList} from '.';
import {useAtom} from 'jotai';
import {isLoggedInAtom, userAtom} from '../../store';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Cancel, Cross} from '../../lib/images';
import {http} from '../../helpers/http';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type Props = NativeStackScreenProps<
  AppStackParamList,
  'AppStack_ProfileScreen'
>;

const SaveButton = ({type, onPress}) => {
  return (
    <View style={tw`absolute right-5 top-5`}>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          onPress(type);
        }}>
        <View
          style={tw`w-15 h-7.5 rounded-[13px] bg-[#FF5C00] flex-row justify-center items-center`}>
          <Text style={tw`text-white font-dm text-[14px] font-bold`}>Save</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ReservationCard = ({
  title,
  price,
  date,
  remainingTime,
  status,
  reserveDates = [],
  onPressToRefund,
}) => (
  <View style={tw`mb-2`}>
    {reserveDates.length > 0 && (
      <Text
        style={tw`text-[#1E2761] text-center font-dm text-[14px] font-bold tracking-[0.25px] mt-2 mb-4`}>
        {`Date: ${reserveDates
          .map(date => dayjs(date).format('YYYY MMMM DD'))
          .join(', ')} (${reserveDates.length} DAYS)`}
      </Text>
    )}
    <View style={tw`flex-row justify-between items-start mb-3`}>
      <Text
        style={tw`text-black font-dm font-bold text-[14px] capitalize w-1/2`}>
        {title}
      </Text>
      <View style={tw`flex-row gap-2 items-center flex-1 justify-end`}>
        <Text style={tw`text-black font-dm text-[18px] font-bold`}>
          ${price}
        </Text>
        {!(status || remainingTime === 0) && (
          <TouchableOpacity activeOpacity={0.5} onPress={onPressToRefund}>
            <Image source={Cancel} style={tw`w-[18px] h-[18px]`} />
            <View style={tw`absolute top-[2px] left-[2px] w-full`}>
              <Image source={Cross} style={tw`w-[14px] h-[14px] z-50`} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
    <View
      style={tw`flex-row justify-between items-center pb-3 border-b-[1px] border-[#D0D8DA]`}>
      <Text style={tw`text-[#93999A] font-dm text-[12px] capitalize`}>
        {dayjs(date).format('MMMM DD YYYY. h:mm A')}
      </Text>
      {!status && remainingTime !== 0 && (
        <Text
          style={tw`text-[#717171] font-dm text-[8px] capitalize tracking-[0.25px]`}>
          Time Remaining For Cancellation: {Math.round(remainingTime / 3600000)}{' '}
          Hours
        </Text>
      )}
    </View>
  </View>
);
const initialCode = 'US';

const AppStack_ProfileScreen: React.FC<Props> = ({navigation, route}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState(initialCode);
  const [user] = useAtom(userAtom);
  const [reservations, setReservations] = useState([]);
  const [_, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const [focused, setFocused] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    password: false,
  });
  const [keyboardShow, setKeyboardShow] = useState(false);

  useEffect(() => {
    getReservations();
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShow(true);
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShow(false);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (user.country) setCountryCode(user.country);
    if (user.name) setName(user.name);
    if (user.email) setEmail(user.email);
    if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
  }, [user]);

  useEffect(() => {
    if (route.params?.countryCode) {
      setCountryCode(route.params.countryCode);
    }
  }, [route.params?.countryCode]);

  const handleOutsideClick = () => {
    setFocused({
      name: false,
      email: false,
      phoneNumber: false,
      password: false,
    });
  };
  const getReservations = () => {
    http
      .post('/user/get_reservations', {userId: user._id})
      .then(res => {
        setReservations(res.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };
  const onPressToCall = () => {
    Linking.openURL(`tel:+8801711234567`);
  };

  const saveProfile = (type: string) => {
    if (type === 'name' && name.trim() === '') {
      alert('Name is required');
      return;
    }
    if (type === 'email' && email.trim() === '') {
      alert('Email is required');
      return;
    }
    if (type === 'phoneNumber' && phoneNumber.trim() === '') {
      alert('Phone is required');
      return;
    }
    if (type === 'password') {
      if (password.trim() === '') {
        alert('Password is required');
        return;
      }
      if (password.trim().length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
    }

    const values = {
      name,
      email,
      phoneNumber,
      password,
    };

    auth()
      .signInWithPhoneNumber(
        type === 'phoneNumber' ? phoneNumber : user.phoneNumber,
      )

      .then(confirmResult => {
        navigation.navigate('AuthStack_OTPScreen', {
          from: 'profile',
          type,
          value: values[type],
          confirmResult,
        });

        setPassword('');
      })

      .catch(error => {
        alert(error.message);
      });
  };

  const navigateToMain = () => {
    navigation.navigate('AppStack_HomePageScreen');
  };

  const onPressCountry = () => {
    navigation.navigate('AuthStack_CountryScreen', {
      from: 'profile',
    });
  };

  const onPressSignOut = () => {
    setIsLoggedIn(false);
    AsyncStorage.removeItem('authStatus');
    navigation.navigate('AuthStack', {screen: 'AuthStack_SigninScreen'});
  };

  const onPressToRefund = reservation => {
    http
      .post('/user/cancel_reservation', {
        reservationId: reservation._id,
        refundPrice: reservation.price,
      })
      .then(res => {
        getReservations();
      })
      .catch(err => {
        console.log(err);
      });
  };
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={tw`flex-grow`}
      keyboardShouldPersistTaps="handled"
      resetScrollToCoords={{x: 0, y: 0}}
      scrollEnabled={true}>
      <TouchableWithoutFeedback onPress={handleOutsideClick}>
        <LinearGradient
          colors={['#FFF', '#1BF2DD']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={tw`flex-1 relative`}>
          <View style={tw`mt-5 ml-5 mb-10 flex-row items-center`}>
            <GoBackIcon onPress={navigateToMain} />

            <Text style={tw`font-abril text-black text-[18px] ml-5`}>
              Profile
            </Text>
          </View>

          <View style={tw`mx-3`}>
            <View style={tw`relative`}>
              <TextInput
                style={tw`bg-white rounded-[13px] w-full h-17.5 self-center mb-7 ${
                  focused.name ? 'pr-30 pl-5' : 'text-center'
                } font-dm font-normal text-[14px] font-bold tracking-[0.5px]`}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor={'#000'}
                onFocus={() => setFocused({...focused, name: true})}
                onBlur={() => setFocused({...focused, name: false})}
              />

              {focused.name && (
                <SaveButton type={'name'} onPress={saveProfile} />
              )}
            </View>

            <View style={tw`relative`}>
              <TextInput
                style={tw`bg-white rounded-[13px] w-full h-17.5 self-center mb-7 ${
                  focused.email ? 'pr-30 pl-5' : 'text-center'
                } font-dm font-normal text-[14px] font-bold tracking-[0.5px]`}
                value={email}
                textContentType="emailAddress"
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={'#000'}
                onFocus={() => setFocused({...focused, email: true})}
                onBlur={() => setFocused({...focused, email: false})}
              />

              {focused.email && (
                <SaveButton type={'email'} onPress={saveProfile} />
              )}
            </View>

            <View style={tw`flex-row w-full justify-center mb-7`}>
              <View
                style={tw`flex-row items-center h-17.5 w-full bg-white rounded-[13px] relative`}>
                <TouchableOpacity activeOpacity={0.5} onPress={onPressCountry}>
                  <Image
                    width={60}
                    height={30}
                    source={{
                      uri: `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`,
                    }}
                    style={tw`ml-20 mr-2.5`}
                  />
                </TouchableOpacity>

                <TextInput
                  style={tw`bg-white rounded-lg flex-1 font-dm font-bold text-[14px] ${
                    focused.phoneNumber ? 'pr-25' : ''
                  } `}
                  value={phoneNumber}
                  placeholder="Phone Number"
                  placeholderTextColor={'#000'}
                  onChangeText={setPhoneNumber}
                  onFocus={() => setFocused({...focused, phoneNumber: true})}
                  onBlur={() => setFocused({...focused, phoneNumber: false})}
                />

                {focused.phoneNumber && (
                  <SaveButton type={'phoneNumber'} onPress={saveProfile} />
                )}
              </View>
            </View>

            <View style={tw`relative`}>
              <TextInput
                style={tw`bg-white rounded-[13px] w-full h-17.5 self-center mb-7 text-center font-dm font-normal text-[14px] font-bold tracking-[0.5px] ${
                  focused.password ? 'pr-30 pl-5 text-left' : 'text-center'
                }`}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                placeholder="Tab To Set Password"
                placeholderTextColor={'#000'}
                onFocus={() => setFocused({...focused, password: true})}
                onBlur={() => {
                  setFocused({...focused, password: false});
                }}
                onPress={() => {
                  setFocused({...focused, password: true});
                }}
              />

              {focused.password && (
                <SaveButton type={'password'} onPress={saveProfile} />
              )}
              {reservations.length > 0 && (
                <View
                  style={tw`bg-white rounded-[13px] w-full self-center px-6 pt-4 pb-3 mb-5`}>
                  <Text
                    style={tw`font-abril text-black text-[18px] tracking-wide mb-11`}>
                    My Reservations
                  </Text>
                  {reservations.map(reservation => (
                    <ReservationCard
                      key={reservation._id}
                      {...reservation}
                      onPressToRefund={() => onPressToRefund(reservation)}
                    />
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={onPressSignOut}
              style={tw`h-20 rounded-t-5 flex-row justify-center items-center mb-18`}>
              <View style={tw`py-2.5 px-8 rounded-[13px] bg-[#FD3A84] mr-5`}>
                <Text
                  style={tw`text-white text-[18px] font-dm font-bold tracking-wide`}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {!keyboardShow && (
            <View style={tw`absolute bottom-0 w-full`}>
              <View
                style={tw`h-20 shrink-0 rounded-t-5 bg-white flex-row justify-between items-center`}>
                <View style={tw`ml-5`}>
                  <Text style={tw`text-black font-dm text-[16px] font-bold`}>
                    Customer Service
                  </Text>

                  <Text
                    style={tw`text-[#93999A] font-dm text-[12px] font-normal`}>
                    +8801711234567
                  </Text>
                </View>

                <TouchableOpacity activeOpacity={0.5} onPress={onPressToCall}>
                  <View
                    style={tw`py-2.5 px-8 rounded-[13px] bg-[#FF5C00] mr-5`}>
                    <Text style={tw`text-white text-[18px] font-dm font-bold`}>
                      Call
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
};

export default AppStack_ProfileScreen;
