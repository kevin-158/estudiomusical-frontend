import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.development';

interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly url = `${environment.HOST}/login`;

  login(username: string, password: string) {
    const body: LoginRequest = { username, password };
    return this.http.post<{ access_token: string }>(this.url, body);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(environment.TOKEN_NAME);
    }

    return this.http.get<void>(`${environment.HOST}/auth/logout`);
  }

  getToken() {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return sessionStorage.getItem(environment.TOKEN_NAME);
  }

  getRoles(): string[] {
    const token = this.getToken();

    if (!token) {
      return [];
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const roleClaim = payload.role ?? '';
      return String(roleClaim)
        .split(',')
        .map(role => role.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  hasAnyRole(roles: string[]) {
    const userRoles = this.getRoles();
    return roles.some(role => userRoles.includes(role));
  }

  getHomeRoute() {
    const roles = this.getRoles();

    if (roles.includes('ADMIN')) {
      return '/pages/reportes';
    }

    if (roles.includes('INGENIERO')) {
      return '/pages/reservas';
    }

    return '/pages/reservas';
  }
}
