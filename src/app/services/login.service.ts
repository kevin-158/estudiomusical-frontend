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
}
