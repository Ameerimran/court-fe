import { Component, ViewEncapsulation, computed, inject, output } from '@angular/core';
import { Booking, Court } from './models';
import { BookingService } from './services/booking.service';
import { CourtService } from './services/court.service';

@Component({
  selector: 'app-admin-page',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './admin-page.component.html',
})
export class AdminPageComponent {
  private readonly courtService = inject(CourtService);
  private readonly bookingService = inject(BookingService);
  readonly homeRequested = output<void>();
  readonly logoutRequested = output<void>();
  readonly courts = this.courtService.courts;
  readonly bookings = computed<Booking[]>(() => this.bookingService.bookings().map((booking) => ({ ...booking, status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1), time: `${booking.date}, ${booking.time}` })));
}
