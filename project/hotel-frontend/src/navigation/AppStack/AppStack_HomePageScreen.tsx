import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  PanResponder,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {AppStackParamList} from '.';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';
import tw from '../../../tailwindcss';
import LinearGradient from 'react-native-linear-gradient';
import {Cancel, Coffee, Swimming, ToBelow} from '../../lib/images';
import {http, uploadPath} from '../../helpers/http';
import Loading from '../../components/Loading';
import {useAtomValue} from 'jotai';
import {currentLocationAtom, userAtom} from '../../store';
import {calculateDistance} from '../../helpers/common';
type Props = NativeStackScreenProps<
  AppStackParamList,
  'AppStack_HomePageScreen'
>;

interface ICardProps {
  navigation: NativeStackNavigationProp<
    AppStackParamList,
    'AppStack_HomePageScreen'
  >;
  item: any;
}
const windowsHeight = Dimensions.get('window').height;
const windowsWidth = Dimensions.get('window').width;
const defaultLocation = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
// const types = [
//   '5 star Hotel',
//   '4 star Hotel',
//   '3 star Hotel',
//   '2 star Hotel',
//   '1 star Hotel',
//   'Park',
//   'Museum',
//   'Restaurant',
// ];
const HotelCard: React.FC = ({navigation, item}: ICardProps) => {
  const onPressToDetail = () => {
    if (item.isHotel) {
      navigation.navigate('AppStack_HotelDetailScreen', {item});
    } else {
      navigation.navigate('AppStack_SpotDetailScreen', {item});
    }
  };
  return (
    <TouchableOpacity onPress={onPressToDetail} activeOpacity={0.5}>
      <View
        style={tw`m-3 rounded-[13px] border-[1px] border-[#0A0A0A] bg-black flex-row`}>
        <Image
          source={{uri: uploadPath + item.images[0]}}
          style={tw`rounded-[13px] mr-2.5 w-[180px] h-[180px]`}
          width={180}
          height={180}
        />
        <View style={tw`m-3 flex-1`}>
          <Text
            style={tw`h-13 text-white font-dm font-bold text-[14px] flex-shrink mb-2 leading-[18px]`}>
            {item.name}
          </Text>
          <View style={tw`flex-row mb-1.5`}>
            <Image source={Coffee} style={tw`h-3 w-3 `} />
            <Text style={tw`text-white font-dm text-[5px] leading-4 mr-3`}>
              Free Breakfast
            </Text>
            <Image source={Swimming} style={tw`h-3 w-3`} />
            <Text style={tw`text-white font-dm text-[5px] leading-4`}>
              Swimming Pool
            </Text>
          </View>
          <View style={tw`w-7 h-4 rounded-[3px] bg-[#1BF28B] mb-0.5`}>
            <Text
              style={tw`text-black text-center font-dm text-[8px] font-bold leading-[9px]`}>
              9.5
            </Text>
            <Text
              style={tw`text-black text-center font-dm text-[5px] font-bold leading-[6px]`}>
              rating
            </Text>
          </View>
          <View style={tw`flex-col items-end`}>
            <View
              style={tw`w-8.5 h-4 rounded-[3px] bg-[#8B2500] flex-row justify-center items-center mb-2`}>
              <Text style={tw`text-white font-dm text-[8px] font-bold`}>
                {item.minimumRooms} Left
              </Text>
            </View>
            <View style={tw`flex-row gap-3`}>
              <Text
                style={tw`text-white font-dm text-[18px] line-through font-bold`}>
                ${item.minimumWasPrice}
              </Text>
              <Text style={tw`text-[#FF5C00] font-dm text-[18px] font-bold`}>
                ${item.minimumPrice}
              </Text>
            </View>
            <Text style={tw`text-white font-dm text-[5px] font-bold`}>
              not includes taxes & fees
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const AppStack_HomePageScreen: React.FC<Props> = ({navigation, route}) => {
  const user = useAtomValue(userAtom);
  const [showText, setShowText] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [spotHotelLists, setSpotHotelLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const mousePositionRef = useRef(0);
  const directionRef = useRef(false);
  const gestureDyRef = useRef(0);
  const temporaryRef = useRef(0);
  const currentLocation = useAtomValue(currentLocationAtom);
  const [region, setRegion] = useState(
    currentLocation.latitude === 0 && currentLocation.longitude === 0
      ? defaultLocation
      : currentLocation,
  );
  const topSheetPosition = useSharedValue(windowsHeight - 80);
  const topListBackgroundOpactiy = useSharedValue(0);
  const touchLineBackgroundOpacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: 10,
      height: 100,
      zIndex: 10,
      backgroundColor: `rgba(238, 238, 238, ${topListBackgroundOpactiy.value})`,
    };
  });
  const calculateCurrentPoint = manual => mousePositionRef.current + manual;

  const calculateLimitPullingHeight = () => 75;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      mousePositionRef.current = topSheetPosition.value;
    },
    onPanResponderMove: (event, gestureState) => {
      if (gestureState.y0 !== 0) {
        temporaryRef.current = gestureState.y0;
      }
      const manualDy = gestureState.moveY - temporaryRef.current;
      directionRef.current = gestureDyRef.current >= manualDy;
      gestureDyRef.current = manualDy;

      if (showText === true && gestureState.dy < 0) {
        setShowText(false);
      }

      const currentPoint = calculateCurrentPoint(manualDy);
      const limitPullingHeight = calculateLimitPullingHeight();

      topListBackgroundOpactiy.value =
        (windowsHeight - currentPoint) / (windowsHeight - 60);
      touchLineBackgroundOpacity.value =
        1 - (windowsHeight - currentPoint) / (windowsHeight - 60);
      if (
        currentPoint > limitPullingHeight &&
        currentPoint < windowsHeight - 20
      ) {
        topSheetPosition.value = currentPoint;
      }
    },
    onPanResponderRelease: (event, gestureState) => {
      const manualDy = gestureState.moveY - temporaryRef.current;
      const currentPoint = calculateCurrentPoint(manualDy);
      const limitPullingHeight = calculateLimitPullingHeight();

      topListBackgroundOpactiy.value =
        (windowsHeight - currentPoint) / (windowsHeight - 60);
      touchLineBackgroundOpacity.value =
        1 - (windowsHeight - currentPoint) / (windowsHeight - 60);
      if (topSheetPosition.value > windowsHeight - 60) {
        setShowText(true);
        topSheetPosition.value = withTiming(windowsHeight - 80, {
          duration: 200,
        });
        topListBackgroundOpactiy.value = withTiming(0, {
          duration: 200,
        });
        touchLineBackgroundOpacity.value = withTiming(1, {
          duration: 200,
        });
      } else {
        if (directionRef.current) {
          topSheetPosition.value = withTiming(limitPullingHeight, {
            duration: 200,
          });
          topListBackgroundOpactiy.value = withTiming(1, {
            duration: 200,
          });
          touchLineBackgroundOpacity.value = withTiming(0, {
            duration: 200,
          });
        } else {
          topSheetPosition.value = withTiming(
            windowsHeight - 80,
            {
              duration: 200,
            },
            () => {
              runOnJS(setShowText)(true);
            },
          );
          topListBackgroundOpactiy.value = withTiming(0, {
            duration: 200,
          });
          touchLineBackgroundOpacity.value = withTiming(1, {
            duration: 200,
          });
        }
      }
    },
  });

  const getAllHotels = () => {
    setLoading(true);
    http
      .get('/user/all_hotels')
      .then(res => {
        setLoading(false);
        setSpotHotelLists((prev: any) => [
          ...prev,
          ...res.data.data.map((item: any) => ({
            ...item,
            isHotel: true,
          })),
        ]);
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };

  const getAllSpots = () => {
    http
      .get('/user/all_spots')
      .then(res => {
        setSpotHotelLists((prev: any) => [
          ...prev,
          ...res.data.data.map((item: any) => ({
            ...item,
            isHotel: false,
          })),
        ]);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const getAllTypes = () => {
    http
      .get('/user/all_types')
      .then(res => {
        setTypes(res.data.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const confirmType = (type: string) => {
    setSelectedType((prev: string) => (prev === type ? '' : type));
  };
  useEffect(() => {
    getAllSpots();
    getAllHotels();
    getAllTypes();
    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', () => {
        return true;
      });
    };
  }, []);

  const saveLocation = async location => {
    const locationData = {
      formatted_address: location.formatted_address,
      latitude: location.latitude,
      longitude: location.longitude,
      icon: location.icon,
      userId: user._id,
    };
    await http.post('/user/save_location', locationData);
  };
  useEffect(() => {
    if (route.params?.searchResult) {
      saveLocation(route.params.searchResult);
      setRegion({
        latitude: route.params.searchResult.latitude,
        longitude: route.params.searchResult.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [route.params?.searchResult]);
  useEffect(() => {
    if (!loading) {
      setSpotHotelLists(prev =>
        prev.sort(
          (a, b) =>
            calculateDistance(
              region.latitude,
              region.longitude,
              a.position.lat,
              a.position.lng,
            ) -
            calculateDistance(
              region.latitude,
              region.longitude,
              b.position.lat,
              b.position.lng,
            ),
        ),
      );
    }
  }, [region, loading]);
  if (loading) return <Loading />;
  return (
    <View style={tw`flex-1 relative`}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={tw`relative mx-2 mb-2`}
          onPress={() => navigation.navigate('AppStack_PriceFilterScreen')}>
          <Image source={Cancel} style={tw`w-[40px] h-[40px]`} />
          <View style={tw`absolute top-[10px] left-[10px] w-full`}>
            <Image source={ToBelow} style={tw`w-[20px] h-[20px] z-50`} />
          </View>
        </TouchableOpacity>
        {types.map((type, index) => (
          <TouchableOpacity
            style={tw`flex-1 flex-col items-center`}
            key={index}
            onPress={() => {
              confirmType(type._id);
            }}
            activeOpacity={0.5}>
            <Image
              source={{uri: uploadPath + type.images[0]}}
              width={45}
              height={45}
              style={tw`rounded-full ${
                selectedType == type._id
                  ? 'border-[#1BF2DD]'
                  : 'border-transparent'
              } border-[2px] w-[40px] h-[40px]`}
            />
            <Text
              style={tw`text-black text-center font-bold font-dm text-[8px] px-1`}>
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
      <View
        style={tw`absolute bottom-25 left-0 right-0 flex-row justify-center gap-10 z-20`}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            navigation.navigate('AppStack_ProfileScreen');
          }}>
          <View
            style={tw`px-3.5 py-1 flex-row justify-center items-center rounded-full bg-white h-7.5`}>
            <Text
              style={tw`text-black font-dm text-[16px] capitalize font-bold`}>
              Profile
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            navigation.navigate('AppStack_HotelSearch');
          }}>
          <View
            style={tw`px-13 py-2 flex-row justify-center items-center rounded-full bg-[#222222]/50 h-7.5`}>
            <Text style={tw`text-white font-dm text-[11px] capitalize`}>
              Where to?
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <MapView
        showsCompass={false}
        mapType="standard"
        style={tw`h-full w-full`}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}>
        {spotHotelLists.length > 0 &&
          spotHotelLists
            .filter(
              item => selectedType === '' || item.type._id == selectedType,
            )
            .map((item, index) => (
              <Marker
                key={`${item.id}-${index}`} // Assuming each item has a unique `id`
                coordinate={{
                  latitude: item.position.lat,
                  longitude: item.position.lng,
                }}>
                {item.isHotel ? (
                  <View
                    style={tw`w-7 h-4 rounded-[3px] bg-[#1E2761] flex-row justify-center items-center`}>
                    <Text
                      style={tw`text-white text-[8px] text-center font-dm font-bold`}>
                      ${item.minimumPrice}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={tw`w-[30px] h-[30px] rounded-full border-[1px] border-[#1E2761]`}>
                    <Image
                      source={{uri: uploadPath + item.images[0]}}
                      style={tw`w-full h-full rounded-full`}
                      width={30}
                      height={30}
                    />
                  </View>
                )}
                <Callout
                  key={`callout-${item.id}`} // Ensure Callout also has a unique key
                  style={tw`flex-row justify-center items-center flex-wrap w-20`}
                  onPress={() => {
                    navigation.navigate(
                      item.isHotel
                        ? 'AppStack_HotelDetailScreen'
                        : 'AppStack_SpotDetailScreen',
                      {item},
                    );
                  }}>
                  <View>
                    <Text style={tw`font-bold text-black`}>{item.name}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
      </MapView>
      <Animated.View
        hitSlop={{top: 0, bottom: 0, left: 0, right: 0}}
        style={{
          ...tw`absolute left-0 right-0 z-20 h-${(windowsHeight - 60) / 4}`,
          top: topSheetPosition,
        }}>
        <LinearGradient
          colors={['#EEEEEE', '#1E2761']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={tw`rounded-t-5 flex-col items-center h-full`}>
          <View
            style={tw`min-h-[50px] w-full flex items-center justify-center`}
            {...panResponder.panHandlers}>
            <Animated.View
              style={{
                ...tw`w-24 h-1 bg-[#93999A] rounded-full`,
                opacity: touchLineBackgroundOpacity,
              }}
            />
          </View>
          {showText && (
            <Text style={tw`text-black font-dm text-[16px] font-bold mb-2`}>
              Over 1000 Amazing Places
            </Text>
          )}

          <FlatList
            contentContainerStyle={tw`w-${windowsWidth / 4}`}
            data={spotHotelLists.filter(
              item => selectedType === '' || item.type._id === selectedType,
            )}
            keyExtractor={item => item._id.toString()}
            style={{maxHeight: windowsHeight - 180}}
            renderItem={({item}) => (
              <HotelCard key={item._id} navigation={navigation} item={item} />
            )}
          />
          <View
            style={tw`flex-row justify-center items-center gap-10 z-20 h-17.5`}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                setShowText(true);
                topSheetPosition.value = withTiming(windowsHeight - 80, {
                  duration: 200,
                });
              }}>
              <View
                style={tw`px-3.5 py-1 flex-row justify-center items-center rounded-full bg-white h-7.5`}>
                <Text
                  style={tw`text-black font-dm text-[16px] capitalize font-bold`}>
                  Map
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                navigation.navigate('AppStack_HotelSearch');
              }}>
              <View
                style={tw`px-13 py-2 flex-row justify-center items-center rounded-full bg-[#222222]/50 h-7.5`}>
                <Text style={tw`text-white font-dm text-[11px] capitalize`}>
                  Where to?
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export default AppStack_HomePageScreen;
