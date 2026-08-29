import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
readonly token = signal<string | null>(localStorage.getItem('access_token'));

    isAuthenticated(): boolean { return !!this.token(); }
    setToken(token: string): void { localStorage.setItem('access_token', token); this.token.set(token); }
    logout(): void { localStorage.removeItem('access_token'); this.token.set(null); }
    }