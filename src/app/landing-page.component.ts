import { Component, ViewEncapsulation, computed, inject, input, output, signal } from '@angular/core';
import { AuthService } from './services/auth.service';
import { BookingService } from './services/booking.service';
import { CourtService } from './services/court.service';
import { Court, Sport } from './models';

@Component({
  selector: 'app-landing-page',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  private readonly authService = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly courtService = inject(CourtService);
  readonly loginRequested = output<void>();
  readonly registerRequested = output<void>();
  readonly logoutRequested = output<void>();
  readonly isLoggedIn = input(false);
  readonly sports: Sport[] = ['All courts', 'Badminton', 'Futsal', 'Pickleball', 'Tennis'];
  readonly dates = [
    { day: 'Tue', date: '16', month: 'Jun' }, { day: 'Wed', date: '17', month: 'Jun' },
    { day: 'Thu', date: '18', month: 'Jun' }, { day: 'Fri', date: '19', month: 'Jun' },
    { day: 'Sat', date: '20', month: 'Jun' },
  ];
  readonly slots = ['07:00 AM', '08:30 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM'];
  readonly courts = this.courtService.courts;
  readonly selectedSport = signal<Sport>('All courts');
  readonly selectedDate = signal('16');
  readonly selectedSlot = signal('08:30 AM');
  readonly notice = signal('');
  readonly filteredCourts = computed(() => {
    const sport = this.selectedSport();
    const courts = this.courts();
    return sport === 'All courts' ? courts : courts.filter((court) => court.sport === sport);
  });

  chooseSport(sport: Sport): void { this.selectedSport.set(sport); this.notice.set(''); }
  chooseDate(date: string): void { this.selectedDate.set(date); this.notice.set(''); }
  chooseSlot(slot: string): void { this.selectedSlot.set(slot); this.notice.set(''); }
  reserve(court: Court): void {
    if (!this.isLoggedIn()) {
      this.loginRequested.emit();
      return;
    }
    const user = this.authService.currentUser();
    if (!user) { this.loginRequested.emit(); return; }
    const result = this.bookingService.createBooking(user, court, `Jun ${this.selectedDate()}`, this.selectedSlot());
    this.notice.set(result.message);
  }
}
