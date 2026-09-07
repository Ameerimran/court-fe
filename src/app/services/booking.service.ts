import { Injectable, signal } from '@angular/core';
import { Booking, Court, User } from '../models';

const BOOKINGS_KEY = 'courtly-bookings';

@Injectable({ providedIn: 'root' })
export class BookingService {
  readonly bookings = signal<Booking[]>(this.readBookings());

  createBooking(user: User, court: Court, date: string, time: string): { ok: boolean; message: string } {
    const exists = this.bookings().some((booking) => booking.courtId === court.id && booking.date === date && booking.time === time && booking.status !== 'cancelled');
    if (exists) return { ok: false, message: 'This court is already booked for that time.' };
    const booking: Booking = { id: crypto.randomUUID(), userId: user.id, customer: user.name, courtId: court.id, court: court.name, sport: court.sport, date, time, status: 'confirmed' };
    this.save([...this.bookings(), booking]);
    return { ok: true, message: `${court.name} is booked for ${date} at ${time}.` };
  }

  cancelBooking(id: string): void { this.save(this.bookings().map((booking) => booking.id === id ? { ...booking, status: 'cancelled' } : booking)); }
  userBookings(userId: string): Booking[] { return this.bookings().filter((booking) => booking.userId === userId); }
  private save(bookings: Booking[]): void { if (typeof localStorage !== 'undefined') localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings)); this.bookings.set(bookings); }
  private readBookings(): Booking[] {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(BOOKINGS_KEY) : null;
    if (saved) return JSON.parse(saved) as Booking[];
    const demoBookings: Booking[] = [
      { id: 'booking-1', userId: 'demo-1', customer: 'Maya Chen', courtId: 'court-1', court: 'Northside Arena', sport: 'Badminton', date: 'Jun 16', time: '08:30 AM', status: 'confirmed' },
      { id: 'booking-2', userId: 'demo-2', customer: 'Alex Rivera', courtId: 'court-2', court: 'The Yard Futsal', sport: 'Futsal', date: 'Jun 16', time: '10:00 AM', status: 'confirmed' },
      { id: 'booking-3', userId: 'demo-3', customer: 'Nora Patel', courtId: 'court-3', court: 'Paddle Club', sport: 'Pickleball', date: 'Jun 17', time: '01:00 PM', status: 'pending' },
      { id: 'booking-4', userId: 'demo-4', customer: 'Sam Wilson', courtId: 'court-4', court: 'Baseline Tennis', sport: 'Tennis', date: 'Jun 20', time: '09:30 AM', status: 'confirmed' },
    ];
    if (typeof localStorage !== 'undefined') localStorage.setItem(BOOKINGS_KEY, JSON.stringify(demoBookings));
    return demoBookings;
  }
}
