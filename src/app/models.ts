export type Sport = 'All courts' | 'Badminton' | 'Futsal' | 'Pickleball' | 'Tennis';

export interface Court {
  id: string;
  name: string;
  sport: Exclude<Sport, 'All courts'>;
  location: string;
  price: number;
  rating: number;
  accent: string;
}

export interface Booking {
  id: string;
  userId: string;
  customer: string;
  courtId: string;
  court: string;
  sport: string;
  time: string;
  date: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}
