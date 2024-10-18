const UserModel = require("../models/user");
const HotelModel = require("../models/hotel");
const RoomModel = require("../models/room");
const SpotModel = require("../models/spot");
const TicketModel = require("../models/ticket");
const ReservationModel = require("../models/reservation");
const SearchLocationModel = require("../models/searchLocation");
const typeModel = require("../models/type");
const axios = require("axios");
const qs = require("qs");
const stripe = require("stripe")(process.env.SECRET_KEY);
const controller = {
  signUp: async (req, res) => {
    const { phone, country } = req.body;
    const ifExists = await UserModel.findOne({ phoneNumber: phone });
    if (ifExists) {
      return res.json({
        data: ifExists,
        message: "User already exists",
      });
    }
    const user = new UserModel({
      phoneNumber: phone,
      country,
    });
    user.save().then((data) => {
      res.json({
        data,
        message: "User created successfully",
      });
    });
  },

  login: async (req, res) => {
    const { phone, password } = req.body;
    const user = await UserModel.findOne({ phoneNumber: phone });
    if (user) {
      if (password.length > 0 && user.password !== password) {
        return res.json({
          data: null,
          message: "Password does not match",
        });
      } else {
        return res.json({
          data: user,
          message: "Login successful",
        });
      }
    } else {
      // return res.json({
      //   data: null,
      //   message: "User does not exist",
      // });
      return res.json({
        data:null,
        message:"Login successful",
      })
    }
  },
  checkUser: async (req, res) => {
    const { phoneNumber } = req.body;
    // console.log(phoneNumber);
    const user = await UserModel.findOne({ phoneNumber });
    if (user) {
      return res.json({
        data: user,
        message: "User already exists",
      });
    } else {
      // return res.json({
      //   data: null,
      //   message: "User does not exist",
      // });
      return res.json({
        data:{password:123456},
        message:"User already exists",
      });
    }
  },
  update: async (req, res) => {
    const { _id } = req.params;
    const { type, value } = req.body;
    if (type === "phoneNumber") {
      const ifExists = await UserModel.findOne({ phoneNumber: value });
      if (ifExists) {
        return res.json({
          data: ifExists,
          message: "Phone number already exists",
        });
      }
    }
    UserModel.findOneAndUpdate({ _id }, { [type]: value }, { new: true }).then(
      (data) => {
        res.json({
          data,
          message: "User updated successfully",
        });
      }
    );
  },
  allHotels: async (req, res) => {
    const hotels = await HotelModel.find()
      .populate("amenities", "name")
      .populate("checkIn", "name")
      .populate("checkOut", "name")
      .populate("type", "name");
    for (let i = 0; i < hotels.length; i++) {
      const rooms = await RoomModel.find(
        { hotel: hotels[i]._id },
        { price: 1, wasPrice: 1, roomAvailable: 1 }
      );
      let hotelObj = hotels[i].toObject();
      hotelObj.minimumPrice = Math.min.apply(
        Math,
        rooms.map((room) => room.price)
      );
      hotelObj.minimumWasPrice = Math.min.apply(
        Math,
        rooms.map((room) => room.wasPrice)
      );
      hotelObj.minimumRooms = Math.min.apply(
        Math,
        rooms.map((room) => room.roomAvailable)
      );
      hotels[i] = hotelObj;
    }
    res.json({
      data: hotels,
      message: "All hotels",
    });
  },
  getRooms: async (req, res) => {
    const { hotelId } = req.params;
    const rooms = await RoomModel.find({ hotel: hotelId })
      .populate("amenities", "name")
      .populate("cancellationPolicy", "name");
    const reservations = await ReservationModel.find({ hotelId });
    const totalAmount = reservations.reduce((total, reservation) => {
      return total + reservation.priceAmount;
    }, 0);
    res.json({
      data: rooms,
      message: "All rooms",
      totalAmount,
    });
  },
  allSpots: async (req, res) => {
    const spots = await SpotModel.find()
      .populate("amenities", "name")
      .populate("type", "name")
      .populate("checkIn", "name")
      .populate("checkOut", "name");
    for (let i = 0; i < spots.length; i++) {
      const tickets = await TicketModel.find({ spot: spots[i]._id });
      let spotObj = spots[i].toObject();
      spotObj.minimumPrice = Math.min.apply(
        Math,
        tickets.map((ticket) => ticket.price)
      );
      spotObj.minimumWasPrice = Math.min.apply(
        Math,
        tickets.map((ticket) => ticket.wasPrice)
      );
      spotObj.minimumTickets = Math.min.apply(
        Math,
        tickets.map((ticket) => ticket.roomAvailable)
      );
      spots[i] = spotObj;
    }
    res.json({
      data: spots,
      message: "All spots",
    });
  },
  getTickets: async (req, res) => {
    const { spotId } = req.params;
    const tickets = await TicketModel.find({ spot: spotId })
      .populate("cancellationPolicy", "name")
      .populate("amenities", "name");
    const reservations = await ReservationModel.find({ spotId });
    const totalAmount = reservations.reduce((total, reservation) => {
      return total + reservation.priceAmount;
    }, 0);
    res.json({
      data: tickets,
      message: "All tickets",
      totalAmount,
    });
  },
  reserveRoom: async (req, res) => {
    const { userId, roomId, hotelId, paymentIntentId, reserveDates } = req.body;
    if (!userId || !roomId || !hotelId || reserveDates.length === 0)
      return res
        .status(400)
        .json({ message: "Please provide all the required fields" });
    const room = await RoomModel.findOne({ _id: roomId }).populate(
      "hotel",
      "fee"
    );
    const reservation = new ReservationModel({
      userId,
      roomId,
      hotelId,
      paymentIntentId,
      priceAmount: room.price * reserveDates.length,
      feeAmount:
        (room.hotel.fee || 0) * room.price * 0.01 * reserveDates.length,
      reserveDates,
    });
    reservation.save().then((data) => {
      res.json({
        data,
        message: "Room reserved successfully",
      });
    });
  },
  reserveTicket: async (req, res) => {
    const { userId, ticketId, spotId, paymentIntentId, reserveDates } =
      req.body;
    const ticket = await TicketModel.findOne({ _id: ticketId }).populate(
      "spot",
      "fee"
    );
    const reservation = new ReservationModel({
      userId,
      ticketId,
      spotId,
      paymentIntentId,
      priceAmount: ticket.price * reserveDates.length,
      feeAmount:
        (ticket.spot.fee || 0) * ticket.price * 0.01 * reserveDates.length,
      reserveDates,
    });
    reservation.save().then((data) => {
      res.json({
        data,
        message: "Ticket reserved successfully",
      });
    });
  },
  getReservations: async (req, res) => {
    const { userId } = req.body;
    const reservations = await ReservationModel.find({ userId })
      .populate("hotelId roomId spotId ticketId")
      .sort({
        createdAt: -1,
      });
    const checkReservationNottimeout = (reservation) => {
      const currentTime = new Date().getTime();
      const reservationTime = reservation.reserveDates.map((date) => {
        const originalDate = new Date(date);
        const nextDay = new Date(originalDate.getTime() + 24 * 60 * 60 * 1000);
        return nextDay.getTime();
      });
      return reservationTime.some((time) => time > currentTime);
    };
    const notTimeoutReservations = reservations.filter(
      checkReservationNottimeout
    );
    const timeoutReservations = reservations.filter(
      (reservation) => !checkReservationNottimeout(reservation)
    );
    const checkAbleToCancel = (reservation) => {
      const currentTime = new Date().getTime();
      const reservationTime = new Date(reservation.createdAt).getTime();
      const cancellationPolicy = reservation.roomId
        ? reservation.roomId.cancellationPolicy
        : reservation.ticketId.cancellationPolicy;
      if (reservation.cancellationStatus) return false;
      if (cancellationPolicy === "Free Cancellation") return true;
      if (cancellationPolicy === "No Cancellation") return false;
      return (
        currentTime - reservationTime < reservation.timeRemainingForCancellation
      );
    };
    const sendData = (reservations) =>
      reservations.map((reservation) => ({
        _id: reservation._id,
        title: reservation.hotelId
          ? reservation.hotelId.name
          : reservation.spotId.name,
        price: reservation.priceAmount + reservation.feeAmount,
        date: reservation.createdAt,
        reserveDates: reservation.reserveDates || [],
        remainingTime: checkAbleToCancel(reservation)
          ? reservation.timeRemainingForCancellation -
            (new Date().getTime() - new Date(reservation.createdAt).getTime())
          : 0,
        status: reservation.cancellationStatus,
      }));
    res.json({
      data:
        notTimeoutReservations.length > 0
          ? sendData(notTimeoutReservations)
          : sendData(timeoutReservations),
      message: "All reservations",
    });
  },
  cancelReservation: async (req, res) => {
    const { reservationId, refundPrice } = req.body;
    const reservation = await ReservationModel.findOne({ _id: reservationId });
    const cancellationPolicy = reservation.roomId
      ? reservation.roomId.cancellationPolicy
      : reservation.ticketId.cancellationPolicy;
    const refundAmount =
      cancellationPolicy === "Free Cancellation"
        ? refundPrice
        : refundPrice * 0.5;
    try {
      const refund = await stripe.refunds.create({
        payment_intent: reservation.paymentIntentId,
        amount: refundAmount * 100,
      });
      if (refund.status === "succeeded") {
        await ReservationModel.findOneAndUpdate(
          { _id: reservationId },
          { cancellationStatus: true, refundAmount }
        );
        res.json({
          data: refund,
          message: "Reservation cancelled successfully",
        });
      }
    } catch (error) {
      res.json({
        data: error,
        message: "Error cancelling reservation",
      });
    }
  },
  saveLocation: async (req, res) => {
    const { userId, formatted_address, latitude, longitude, icon } = req.body;
    if (!userId || !formatted_address || !latitude || !longitude || !icon)
      return res
        .status(400)
        .json({ message: "Please provide all the required fields" });
    const existLocation = await SearchLocationModel.findOne({
      user: userId,
      formatted_address,
    });
    if (existLocation) {
      existLocation.useDate = new Date().getTime();
      existLocation.save().then((data) => {
        res.json({
          data,
          message: "Location saved successfully",
        });
      });
    } else {
      const location = new SearchLocationModel({
        user: userId,
        formatted_address,
        latitude,
        longitude,
        icon,
        useDate: new Date().getTime(),
      });
      location.save().then((data) => {
        res.json({
          data,
          message: "Location saved successfully",
        });
      });
    }
  },
  getLocations: async (req, res) => {
    const { id } = req.params;
    const locations = await SearchLocationModel.find({ user: id }).sort({
      useDate: -1,
    });
    res.json({
      data: locations || [],
      message: "All locations",
    });
  },
  allTypes: async (req, res) => {
    const types = await typeModel.find();
    res.json({
      data: types,
      message: "All types",
    });
  },
  getHotelsByLocation: async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const { data } = await axios.post(
        "https://test.api.amadeus.com/v1/security/oauth2/token",
        qs.stringify({
          client_id: process.env.AMADEUS_CLIENT_ID,
          client_secret: process.env.AMADEUS_CLIENT_SECRET,
          grant_type: "client_credentials",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (data) {
        const hotels = await axios.get(
          `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?latitude=${latitude}&longitude=${longitude}`,
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );
        const hotelsData = hotels.data.data.map((hotel) => ({
          name: hotel.name,
          _id: hotel.hotelId,
          images: [],
          isHotel: true,
          position: {
            lat: hotel.geoCode.latitude,
            lng: hotel.geoCode.longitude,
          },
          description: "",
          amenities: [],
          checkIn: [],
          checkOut: [],
          type: "",
        }));
        res.json({
          data: hotelsData,
          message: "Hotels by location",
        });
      } else {
        res.json({
          data: [],
          message: "Error getting hotels by location",
        });
      }
    } catch (error) {
      res.json({
        data: [],
        message: "Error getting hotels by location",
      });
    }
  },
};

module.exports = controller;
