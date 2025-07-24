import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardSummary {
  totalStudents: number;
  totalPassedExams: number;
  totalFailedExams: number;
  totalSubmittedExams: number;
}

export interface DashboardSummaryResponse {
  data: DashboardSummary;
  statusCode: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'https://localhost:7169/api/Dashboard/summary';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummaryResponse> {
    return this.http.get<DashboardSummaryResponse>(this.apiUrl);
  }
} 