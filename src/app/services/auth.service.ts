import { Injectable, signal } from '@angular/core';
import { User } from '../models';

const USERS_KEY = 'courtly-users';
const SESSION_KEY = 'courtly-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(this.readSession());

  login(email: string, password: string): { ok: boolean; message?: string } {
    const user = this.readUsers().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password);
    if (!user) return { ok: false, message: 'Invalid email or password.' };
    this.setSession(user);
    return { ok: true };
  }

  register(name: string, email: string, password: string): { ok: boolean; message?: string } {
    const users = this.readUsers();
    if (users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) return { ok: false, message: 'An account with this email already exists.' };
    const user: User = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), password, role: 'user' };
    this.writeUsers([...users, user]);
    this.setSession(user);
    return { ok: true };
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }

  private setSession(user: User): void {
    const sessionUser = { ...user, password: undefined } as User;
    if (this.isBrowser()) localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    this.currentUser.set(sessionUser);
  }

  private readUsers(): User[] {
    const saved = this.isBrowser() ? localStorage.getItem(USERS_KEY) : null;
    if (saved) return JSON.parse(saved) as User[];
    const demoUser: User = { id: 'demo-user', name: 'Jordan Miles', email: 'jordan@example.com', password: 'password', role: 'user' };
    this.writeUsers([demoUser]);
    return [demoUser];
  }

  private writeUsers(users: User[]): void { if (this.isBrowser()) localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  private readSession(): User | null {
    const saved = this.isBrowser() ? localStorage.getItem(SESSION_KEY) : null;
    return saved ? JSON.parse(saved) as User : null;
  }
  private isBrowser(): boolean { return typeof localStorage !== 'undefined'; }
}
