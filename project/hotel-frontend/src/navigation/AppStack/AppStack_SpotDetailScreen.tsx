import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '.';
import tw from '../../../tailwindcss';
import LinearGradient from 'react-native-linear-gradient';
import {
  Coffee,
  CoffeeBlack,
  Group,
  Swimming,
  SwimmingBlack,
  Cancel,
  Cross,
} from '../../lib/images';
import GoBackIcon from '../../components/GoBackIcon';
import {http, uploadPath} from '../../helpers/http';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../store';
import {DatePickerModal} from 'react-native-paper-dates';
import dayjs from 'dayjs';

type Props = NativeStackScreenProps<
  AppStackParamList,
  'AppStack_SpotDetailScreen'
>;
type IDetailCardProps = {
  backgroundColor: string;
  item: any;
  selected: boolean;
};
const {width} = Dimensions.get('window');
const ImageSwiper = ({images}) => (
  <FlatList
    data={images}
    renderItem={({item}) => (
      <Image
        source={{uri: uploadPath + item}}
        style={tw`w-[${width}px] h-96`}
      />
    )}
    keyExtractor={item => item.toString()}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
  />
);
const DetailCard = ({backgroundColor, item, selected}: IDetailCardProps) => {
  return (
    <View
      style={[
        tw`rounded-[13px] w-[${width / 2}px] ${backgroundColor} border-2`,
        selected ? tw`border-[#FF5C00]` : tw`border-transparent`,
      ]}>
      <FlatList
        data={item.images}
        renderItem={({item}) => (
          <Image
            source={{uri: uploadPath + item}}
            height={180}
            style={tw`rounded-[13px] mb-2 w-[${width / 2}px] h-[180px]`}
          />
        )}
        keyExtractor={item => item.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      <View style={tw`p-2`}>
        <Text
          style={tw`text-white font-dm text-[12px] font-bold text-left mb-2`}>
          {item.name}
        </Text>
        <View style={tw`flex-row items-end w-full justify-between mb-1`}>
          <View>
            <View style={tw`flex-row items-center`}>
              <Image source={Group} style={tw`h-3 w-3 mr-1`} />
              <Text style={tw`text-white font-dm text-[5px] font-bold`}>
                2 Adults, 1 Child
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Image source={Coffee} style={tw`h-3 w-3 mr-1`} />
              <Text style={tw`text-white font-dm text-[5px] font-bold mr-1.5`}>
                Free Breakfast
              </Text>
              <Image source={Swimming} style={tw`h-3 w-3 mr-1`} />
              <Text style={tw`text-white font-dm text-[5px] font-bold`}>
                Swimming Pool
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Image source={Swimming} style={tw`h-3 w-3 mr-1`} />
              <Text style={tw`text-white font-dm text-[5px] font-bold`}>
                {item.cancellationPolicy.name}
              </Text>
            </View>
          </View>
          <View>
            <View
              style={tw`w-8.5 h-4 rounded-[3px] bg-[#8B2500] flex-row justify-center items-center`}>
              <Text style={tw`text-white font-dm text-[8px] font-bold`}>
                {item.roomAvailable} Left
              </Text>
            </View>
          </View>
        </View>
        <View style={tw`flex-row gap-3 justify-end`}>
          <Text
            style={tw`text-white font-dm text-[18px] line-through font-bold`}>
            ${item.wasPrice}
          </Text>
          <Text style={tw`text-[#FF5C00] font-dm text-[18px] font-bold`}>
            ${item.price}
          </Text>
        </View>
      </View>
    </View>
  );
};
const AppStack_SpotDetailScreen: React.FC<Props> = ({navigation, route}) => {
  const [tickets, setTickets] = useState([]);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const user = useAtomValue(userAtom);
  const onPressReserve = () => {
    const checkIfRoomSelected = tickets.find(ticket => ticket.selected);
    if (!checkIfRoomSelected) {
      alert('Please select a ticket to reserve');
      return;
    }
    if (selectedDates.length === 0) {
      setOpenCalendar(true);
    } else {
      onPressPurchase();
    }
  };
  const onPressPurchase = async () => {
    const response = await http.post('/create-payment-intent', {
      amount:
        tickets.find(ticket => ticket.selected).price *
        selectedDates.length *
        ((route.params.item.fee || 0) / 100 + 1),
    });
    const {clientSecret, customer, paymentIntentId} = response.data;
    const {error} = await initPaymentSheet({
      customerId: customer,
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'hotel-booking-app-sonnet',
    });
    if (error) {
      console.log(error);
    } else {
      const {error} = await presentPaymentSheet();
      if (error) {
        console.log(error);
      } else {
        http
          .post('/user/reserve_ticket', {
            userId: user._id,
            ticketId: tickets.find(ticket => ticket.selected)._id,
            spotId: route.params.item._id,
            paymentIntentId,
            reserveDates: selectedDates,
          })
          .then(res => {
            setSelectedDates([]);
            setTickets((prev: any) =>
              prev.map((ticket: any) => ({...ticket, selected: false})),
            );
          });
      }
    }
  };

  useEffect(() => {
    getTickets();
  }, [route.params.item._id]);
  console.log(route.params.item);
  const getTickets = () => {
    http
      .get(`/user/get_tickets/${route.params.item._id}`)
      .then(res => {
        const data = res.data.data.map((ticket, index) => {
          return {
            ...ticket,
            backgroundColor: index % 2 === 0 ? 'bg-black' : 'bg-[#1E2761]',
            selected: false,
          };
        });
        setTickets(data);
      })
      .catch(err => {
        console.log(err);
      });
  };
  return (
    <LinearGradient
      colors={['#FFF', '#1E2761']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={tw`flex-1`}>
      <ScrollView>
        <View style={tw`relative`}>
          <View style={tw`absolute top-5 left-5 z-10`}>
            <GoBackIcon onPress={() => navigation.goBack()} />
          </View>
          <ImageSwiper images={route.params.item.images} />
          <View
            style={tw`absolute bottom-1.5 right-2 w-7 h-4 rounded-[3px] bg-black`}>
            <Text
              style={tw`text-white text-center font-dm text-[8px] font-bold leading-[9px]`}>
              35
            </Text>
            <Text
              style={tw`text-white text-center font-dm text-[5px] font-bold leading-[6px]`}>
              Pics
            </Text>
          </View>
        </View>
        <View style={tw`px-2`}>
          <Text style={tw`text-black font-abril text-[18px] font-bold py-2`}>
            {route.params.item.name}
          </Text>
          <View style={tw`flex-row gap-2 mb-1`}>
            <View style={tw`w-7 h-4 rounded-[3px] bg-[#1BF28B] mb-0.5`}>
              <Text
                style={tw`text-black text-center font-dm text-[8px] font-bold leading-[9px]`}>
                {9.5}
              </Text>
              <Text
                style={tw`text-black text-center font-dm text-[5px] font-bold leading-[6px]`}>
                Ratings
              </Text>
            </View>
          </View>
          <Text style={tw`text-black font-dm text-[5px] font-bold mb-4.5`}>
            {'See all 500 customer reviews >'}
          </Text>
          <Text style={tw`text-black font-dm text-[18px] font-bold mb-1.5`}>
            About The {route.params.item.type.name}
          </Text>
          <View style={tw`ml-6`}>
            <Text style={tw`text-black font-dm text-[8px] font-bold mb-1.5`}>
              {route.params.item.description}
            </Text>
          </View>
          <Text style={tw`text-black font-dm text-[18px] font-bold mb-1.5`}>
            Location
          </Text>
          <View style={tw`ml-6`}>
            <Text style={tw`text-black font-dm text-[8px] font-bold mb-1.5`}>
              {route.params.item.location}
            </Text>
          </View>
          <Text style={tw`text-black font-dm text-[18px] font-bold mb-1.5`}>
            Policies
          </Text>
          <Text style={tw`text-black font-dm text-[10px] font-bold mb-1.5`}>
            Entrance
          </Text>
          <View style={tw`ml-6`}>
            {route.params.item.entrancePolicies.map(
              (entrance: any, index: number) => (
                <Text
                  key={index}
                  style={tw`text-black font-dm text-[8px] font-bold mb-1.5`}>
                  {entrance.name}
                </Text>
              ),
            )}
          </View>
          <Text style={tw`text-black font-dm text-[10px] font-bold mb-1.5`}>
            Closing
          </Text>
          <View style={tw`ml-6`}>
            {route.params.item.closingPolicies.map(
              (closing: any, index: number) => (
                <Text
                  key={index}
                  style={tw`text-black font-dm text-[8px] font-bold mb-1.5`}>
                  {closing.name}
                </Text>
              ),
            )}
          </View>
          <Text style={tw`text-black font-dm text-[10px] font-bold mb-1.5`}>
            Opening Days
          </Text>
          <View style={tw`ml-6 mb-5`}>
            {route.params.item.openingDays.map(
              (openingDay: string, index: number) => (
                <Text
                  key={index}
                  style={tw`text-black font-dm text-[8px] font-bold mb-1.5`}>
                  {openingDay}
                </Text>
              ),
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`gap-3 flex-row mb-4`}>
              {tickets.length > 0 &&
                tickets.map((ticket, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.5}
                    onPress={() => {
                      const newTickets = tickets.map((r, i) => {
                        if (i === index) {
                          return {...r, selected: true};
                        }
                        return {...r, selected: false};
                      });
                      setTickets(newTickets);
                    }}>
                    <DetailCard
                      backgroundColor={ticket.backgroundColor}
                      item={ticket}
                      selected={ticket.selected}
                    />
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
        <View
          style={tw`py-3 bg-[#1E2761] w-full flex-row ${
            selectedDates.length > 0 && tickets.some(ticket => ticket.selected)
              ? 'justify-between'
              : 'justify-end'
          }`}>
          {selectedDates.length > 0 &&
            tickets.some(ticket => ticket.selected) && (
              <View style={tw`pt-4 px-8 flex-1`}>
                <View style={tw`flex-row items-center gap-2`}>
                  <Text style={tw`text-[#1BF28B] font-dm text-[10px]`}>
                    {`Date: ${selectedDates
                      .map(date => dayjs(date).format('YYYY MMMM DD'))
                      .join(', ')} (${selectedDates.length} DAYS)`}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => setOpenCalendar(true)}>
                    <Text style={tw`text-[#F00] font-dm text-[8px] font-bold`}>
                      Change
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={tw`text-white font-dm text-[10px]`}>{`Price: $${
                  tickets.find(ticket => ticket.selected).price
                } * ${selectedDates.length}`}</Text>
                <Text
                  style={tw`text-white font-dm text-[10px]`}>{`Tax & Fees: $${
                  (tickets.find(ticket => ticket.selected).price *
                    selectedDates.length *
                    (route.params.item.fee || 0)) /
                  100
                }`}</Text>
                <Text
                  style={tw`text-white text-[18px] font-bold font-dm`}>{`Total $${
                  tickets.find(ticket => ticket.selected).price *
                  selectedDates.length *
                  ((route.params.item.fee || 0) / 100 + 1)
                }`}</Text>
              </View>
            )}
          <View style={tw`pt-3 px-4`}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={onPressReserve}
              style={tw`shrink-0 rounded-t-5 flex-row justify-end items-center`}>
              <View style={tw`py-2.5 px-8 rounded-[13px] bg-[#FF5C00] mr-0`}>
                <Text style={tw`text-white text-[18px] font-dm font-bold`}>
                  Reserve
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <DatePickerModal
          mode="multiple"
          visible={openCalendar}
          onDismiss={() => setOpenCalendar(false)}
          onConfirm={params => {
            if (params.dates.length === 0) {
              alert('Please select a date');
              return;
            }
            setSelectedDates(params.dates);
            setOpenCalendar(false);
          }}
          label="Select Your Reserve Dates"
          closeIcon="close"
          locale="en"
          dates={selectedDates}
          validRange={{
            startDate: new Date(),
          }}
        />
      </ScrollView>
    </LinearGradient>
  );
};

export default AppStack_SpotDetailScreen;
