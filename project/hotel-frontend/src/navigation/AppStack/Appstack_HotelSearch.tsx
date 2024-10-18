import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Dimensions,
  FlatList,
  Keyboard,
} from 'react-native';
import tw from '../../../tailwindcss';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '.';
import LinearGradient from 'react-native-linear-gradient';
import GoBackIcon from '../../components/GoBackIcon';
import AnimationCard from '../../components/AnimationCard';
import {Cancel, Marker} from '../../lib/images';
import {getPlacesByQuery} from '../../helpers/common';
import {http, mapApiKey} from '../../helpers/http';
import {DecreaseIcon, IncreaseIcon} from '../../components/PlusMinusIcons';
import {CalendarList} from 'react-native-calendars';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../store';
type Props = NativeStackScreenProps<AppStackParamList, 'AppStack_HotelSearch'>;
interface ISearchedLocationProps {
  formatted_address: string;
  icon: string;
  onPress: () => void;
}
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const screenWidth = Dimensions.get('window').width;
const ImageCard: React.FC<ISearchedLocationProps> = ({
  formatted_address,
  icon,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onPress} style={tw`w-27`}>
      <View style={tw`w-25 h-25 rounded-[13px]`}>
        <Image source={{uri: icon}} style={tw`w-full h-full rounded-[13px]`} />
      </View>
      <Text style={tw`text-black text-[11px] px-3 py-1 ellipsis`}>
        {formatted_address}
      </Text>
    </TouchableOpacity>
  );
};
const AppStack_HotelSearch: React.FC<Props> = ({navigation, route}) => {
  const user = useAtomValue(userAtom);
  const [openLocation, setOpenLocation] = useState(true);
  const [locationFocus, setLocationFocus] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [locationSelected, setLocationSelected] = useState({} as any);
  const [searchLocationResults, setSearchLocationResults] = useState([]);
  const [searchedLocations, setSearchedLocations] = useState([]);
  const [locationCardHeight, setLocationCardHeight] = useState(320);
  const [keyBoardShow, setKeyBoardShow] = useState(false);
  const locationSearchWidth = useRef(new Animated.Value(0)).current;
  const locationSearchWidthAnim = Animated.timing(locationSearchWidth, {
    toValue: locationFocus ? screenWidth - 50 : 264,
    duration: 200,
    useNativeDriver: false,
  });
  const getSearchedLocations = () => {
    http.get(`/user/get_locations/${user._id}`).then(response => {
      setSearchedLocations(response.data.data);
    });
  };
  useEffect(() => {
    getSearchedLocations();
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyBoardShow(true);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyBoardShow(false);
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);
  useEffect(() => {
    if (locationFocus) setLocationCardHeight(500);
    else setLocationCardHeight(360);
    locationSearchWidthAnim.stop();
    locationSearchWidthAnim.start();
  }, [locationFocus]);

  useEffect(() => {
    if (locationText.length >= 2) {
      getPlacesByQuery(
        locationText,
        'AIzaSyDEGDxLK7KpB3DGFqVLSrcJQkVWU4be_zQ',
      ).then(places => {
        setSearchLocationResults(places);
      });
    }
  }, [locationText]);
  const selectLocation = (item: any) => {
    setLocationFocus(false);
    setLocationText('');
    setLocationSelected(item);
    setSearchLocationResults([]);
    confirmSearch(item);
  };
  const initializeAll = () => {
    setLocationSelected({});
  };
  const confirmSearch = item => {
    if (!item.name) return alert('Please select a location');
    navigation.navigate('AppStack_HomePageScreen', {
      searchResult: {
        latitude: item.geometry.location.lat,
        longitude: item.geometry.location.lng,
        formatted_address: item.formatted_address,
        icon: item.icon,
      },
    });
  };
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={tw`flex-grow`}
      resetScrollToCoords={{x: 0, y: 0}}
      scrollEnabled={true}>
      <LinearGradient
        colors={['#FFF', '#1BF2DD']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={tw`flex-1 relative`}>
        <View style={tw`mt-5 ml-5 mb-10 mb-10 flex-row items-center`}>
          <GoBackIcon onPress={() => navigation.goBack()} />
          <Text style={tw`font-abril text-black text-[18px] ml-5`}>Search</Text>
        </View>
        <View style={tw`px-1.5 w-full`}>
          <AnimationCard
            open={openLocation}
            onPress={() => {
              setOpenLocation(true);
            }}
            cardHeight={locationCardHeight}
            title="Where"
            smallTitle="Location"
            value={locationSelected.name || 'Add Location'}>
            <View style={tw`flex-col items-center`}>
              <AnimatedTextInput
                style={{
                  ...tw`flex justify-center ${
                    locationFocus ? 'text-left' : 'text-center'
                  } h-12.5 bg-black/50 rounded-full mb-10 text-white text-[14px] px-4`,
                  width: locationSearchWidth,
                }}
                value={locationText}
                onChangeText={setLocationText}
                onFocus={() => setLocationFocus(true)}
                placeholder="Search for locations"
                placeholderTextColor={'white'}
              />
            </View>
            {locationFocus && (
              <FlatList
                style={tw`w-full h-80`}
                data={searchLocationResults}
                keyExtractor={item => item.place_id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={tw`flex-row items-center px-7.5 pb-7`}
                    onPress={() => selectLocation(item)}>
                    <View
                      style={tw`w-16 h-16 rounded-[12px] bg-[#D0D8DA] flex-row justify-center items-center mr-4`}>
                      <Image
                        source={{uri: item.icon.replace('/', '')}}
                        style={tw`w-7.5 h-7.5`}
                      />
                    </View>
                    <Text style={tw`text-black font-abril text-[14px] flex-1`}>
                      {item.formatted_address}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            {!locationFocus && (
              <ScrollView
                scrollEnabled={true}
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                style={tw`mx-4`}>
                <View style={tw`flex flex-row gap-2`}>
                  {searchedLocations.map((item, index) => (
                    <ImageCard
                      key={index}
                      formatted_address={item.formatted_address}
                      icon={item.icon}
                      onPress={() => {
                        navigation.navigate('AppStack_HomePageScreen', {
                          searchResult: item,
                        });
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </AnimationCard>
        </View>
        {!keyBoardShow && (
          <View style={tw`absolute bottom-0 w-full`}>
            <View
              style={tw`h-20 shrink-0 rounded-t-5 bg-white flex-row justify-between items-center`}>
              <TouchableOpacity activeOpacity={0.5} onPress={initializeAll}>
                <Text style={tw`text-black font-dm text-[16px] font-bold mx-8`}>
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => confirmSearch(locationSelected)}>
                <View style={tw`py-2.5 px-8 rounded-[13px] bg-[#FF5C00] mr-5`}>
                  <Text style={tw`text-white text-[18px] font-dm font-bold`}>
                    Search
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
    </KeyboardAwareScrollView>
  );
};

export default AppStack_HotelSearch;
