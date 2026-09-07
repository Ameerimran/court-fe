import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';
import { AuthPageComponent } from './auth-page.component';
import { LandingPageComponent } from './landing-page.component';
import { AuthService } from './services/auth.service';

type View = 'home' | 'login' | 'register' | 'admin';

@Component({
  imports: [RouterOutlet, AdminPageComponent, AuthPageComponent, LandingPageComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly authService = inject(AuthService);
  protected readonly view = signal<View>('home');
  protected readonly isLoggedIn = computed(() => this.authService.currentUser() !== null);
  protected openLogin(): void { this.view.set('login'); }
  protected openRegister(): void { this.view.set('register'); }
  protected openHome(): void { this.view.set('home'); }
  protected openAdmin(): void { this.view.set('admin'); }
  protected completeLogin(): void { this.view.set('home'); }
  protected logout(): void { this.authService.logout(); this.view.set('home'); }
}
