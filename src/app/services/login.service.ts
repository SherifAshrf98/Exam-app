import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { LoginData, LoginResponse } from '../shared/auth.interfaces';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = 'https://localhost:7169/api/auth/Account/login';

  constructor(private http: HttpClient) {}

  login(data: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, data);
  }

  storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const decoded: any = jwtDecode(token);

      const msRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (msRole) {
        return Array.isArray(msRole) ? msRole : [msRole];
      }
      return [];
      
    } catch {

      return [];
    }
  }

  getUserName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      
      return decoded['name'] || decoded['email'] || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }
}
