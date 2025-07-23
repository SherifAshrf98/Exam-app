import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subject {
  id: number;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export interface ExamConfig {
  numEasy: number;
  numMedium: number;
  numHard: number;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private apiUrl = 'https://localhost:7169/api/Subject/all';

  constructor(private http: HttpClient) {}

  getSubjects(): Observable<ApiResponse<Subject[]>> {
    return this.http.get<ApiResponse<Subject[]>>(this.apiUrl);
  }

  getExamConfig(subjectId: number): Observable<ExamConfig> {
    return this.http.get<ExamConfig>(`https://localhost:7169/api/Subject/${subjectId}/examConfigs`);
  }

  createExamConfig(subjectId: number, config: ExamConfig): Observable<any> {
    return this.http.post(`https://localhost:7169/api/Subject/${subjectId}/examConfigs`, config);
  }

  updateExamConfig(subjectId: number, config: ExamConfig): Observable<any> {
    return this.http.put(`https://localhost:7169/api/Subject/${subjectId}/examConfigs`, config);
  }
}
