import axios from 'axios';

export const http = axios.create({
  // baseURL: 'https://hotelbooking.render.com.marketmajesty.net/api',
  baseURL: 'http://192.168.148.100:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
export const uploadPath = 'http://192.168.148.100:8001/uploads/';
// export const uploadPath =
// 'https://hotelbooking.render.com.marketmajesty.net/uploads/';
export const mapApiKey = process.env.PLACE_API_KEY;
