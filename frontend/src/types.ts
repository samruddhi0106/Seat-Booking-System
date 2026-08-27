export interface Seat {
  seat_id?: string;
  id?: string;
  row: string;
  number: number;
  category?: string;
  price?: number;
  status: 'available' | 'held' | 'booked';
  booked_by?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date_time: string;
  venue: string;
  rows: number;
  seats_per_row: number;
  seats?: Seat[];
}

export interface Booking {
  id: string;
  event_id: string;
  event_title?: string;
  user_name?: string;
  user_email: string;
  seat_ids: string[];
  status?: string;
  created_at?: string;
}

export interface AdminStat {
  event_id: string;
  title: string;
  total_seats: number;
  booked_seats: number;
  available_seats: number;
  occupancy: string;
}