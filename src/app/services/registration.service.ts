import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationData, RegistrationResponse } from '../shared/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'https://localhost:7169/api/auth/Account/register';

  constructor(private http: HttpClient) {}

  register(data: RegistrationData): Observable<RegistrationResponse> 
  {
    return this.http.post<RegistrationResponse>(this.apiUrl, data);
  }
} 

