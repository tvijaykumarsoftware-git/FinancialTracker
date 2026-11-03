import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = '/gateway/users';
  private accessToken: string | null = null;
  private session: AuthResponse | null = null;

  get currentSession(): AuthResponse | null {
    return this.session;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.usersUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.usersUrl}/register`, request);
  }

  startSession(session: AuthResponse): void {
    this.session = session;
    this.accessToken = session.accessToken;
  }

  signOut(): void {
    this.session = null;
    this.accessToken = null;
  }

  get token(): string | null {
    return this.accessToken;
  }
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token;
  if (!token || !request.url.startsWith('/gateway')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
