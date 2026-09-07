import { Component, ViewEncapsulation, inject, input, output, signal } from '@angular/core';
import { AuthService } from './services/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './auth-page.component.html',
})
export class AuthPageComponent {
  private readonly authService = inject(AuthService);
  readonly mode = input<AuthMode>('login');
  readonly modeChange = output<AuthMode>();
  readonly authenticated = output<void>();
  readonly homeRequested = output<void>();
  readonly adminRequested = output<void>();
  readonly authMessage = signal('');
  readonly authName = signal('');
  readonly authEmail = signal('');
  readonly authPassword = signal('');

  updateAuth(field: 'name' | 'email' | 'password', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'name') this.authName.set(value);
    if (field === 'email') this.authEmail.set(value);
    if (field === 'password') this.authPassword.set(value);
  }

  submit(): void {
    if (!this.authEmail() || !this.authPassword() || (this.mode() === 'register' && !this.authName())) {
      this.authMessage.set('Please complete all required fields.');
      return;
    }
    const result = this.mode() === 'login'
      ? this.authService.login(this.authEmail(), this.authPassword())
      : this.authService.register(this.authName(), this.authEmail(), this.authPassword());
    if (!result.ok) { this.authMessage.set(result.message ?? 'Unable to authenticate.'); return; }
    this.authMessage.set('');
    this.authenticated.emit();
  }
}
