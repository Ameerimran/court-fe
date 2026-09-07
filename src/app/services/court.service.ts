import { Injectable, signal } from '@angular/core';
import { Court } from '../models';

const COURTS_KEY = 'courtly-courts';

@Injectable({ providedIn: 'root' })
export class CourtService {
  readonly courts = signal<Court[]>(this.readCourts());

  addCourt(court: Omit<Court, 'id' | 'rating'>): Court {
    const created: Court = { ...court, id: crypto.randomUUID(), rating: 5 };
    this.save([...this.courts(), created]);
    return created;
  }

  updateCourt(id: string, changes: Partial<Court>): void {
    this.save(this.courts().map((court) => court.id === id ? { ...court, ...changes } : court));
  }

  removeCourt(id: string): void { this.save(this.courts().filter((court) => court.id !== id)); }

  private save(courts: Court[]): void { if (typeof localStorage !== 'undefined') localStorage.setItem(COURTS_KEY, JSON.stringify(courts)); this.courts.set(courts); }
  private readCourts(): Court[] {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(COURTS_KEY) : null;
    if (saved) return JSON.parse(saved) as Court[];
    const courts: Court[] = [
      { id: 'court-1', name: 'Northside Arena', sport: 'Badminton', location: 'Riverside District', price: 18, rating: 4.9, accent: 'coral' },
      { id: 'court-2', name: 'The Yard Futsal', sport: 'Futsal', location: 'Warehouse Quarter', price: 42, rating: 4.8, accent: 'blue' },
      { id: 'court-3', name: 'Paddle Club', sport: 'Pickleball', location: 'Old Town', price: 24, rating: 4.7, accent: 'yellow' },
      { id: 'court-4', name: 'Baseline Tennis', sport: 'Tennis', location: 'Lakeside Park', price: 28, rating: 4.9, accent: 'green' },
    ];
    if (typeof localStorage !== 'undefined') localStorage.setItem(COURTS_KEY, JSON.stringify(courts));
    return courts;
  }
}
