import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardSummary {
  totalStudents: number;
  totalPassedExams: number;
  totalFailedExams: number;
  totalSubmittedExams: number;
}
export interface StudentDashboardSummary {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  totalSubjects: number;
}

export interface AdminDashboardSummaryResponse {
  data: AdminDashboardSummary;
  statusCode: number;
  message: string;
}
export interface StudentDashboardSummaryResponse {
  data: StudentDashboardSummary;
  statusCode: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'https://localhost:7169/api/Dashboard/Admin/summary';
  private studentApiUrl = 'https://localhost:7169/api/Dashboard/Student/summary';

  constructor(private http: HttpClient) {}

  getAdminSummary(): Observable<AdminDashboardSummaryResponse> {
    return this.http.get<AdminDashboardSummaryResponse>(this.apiUrl);
  }

  getStudentSummary(): Observable<StudentDashboardSummaryResponse> {
    return this.http.get<StudentDashboardSummaryResponse>(this.studentApiUrl);
  }
}
