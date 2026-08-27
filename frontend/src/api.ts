import axios from 'axios';
import { AdminStat } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEvents = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const seedEvents = async () => {
  const response = await api.post('/seed');
  return response.data;
};

export const fetchEventDetail = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export const createBooking = async (bookingData: {
  event_id: string;
  user_name: string;
  user_email: string;
  seat_ids: string[];
}) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const fetchUserBookings = async (email: string) => {
  const response = await api.get(`/bookings?email=${encodeURIComponent(email)}`);
  return response.data;
};

// Fixed: Sends booking ID if available, or sends the object body to /bookings/cancel
export const cancelBooking = async (bookingData: {
  _id?: string;
  id?: string;
  user_email: string;
  event_id: string;
  seat_ids: string[];
}) => {
  const bookingId = bookingData._id || bookingData.id;

  if (bookingId) {
    // If backend route uses /bookings/{id}/cancel
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  }

  // Fallback: If backend uses query params to find the MongoDB document
  const response = await api.post(
    `/bookings/cancel?email=${encodeURIComponent(bookingData.user_email)}&event_id=${bookingData.event_id}`,
    bookingData.seat_ids
  );
  return response.data;
};

export const fetchAdminStats = async (): Promise<AdminStat[]> => {
  const response = await api.get('/admin/stats');
  return response.data;
};