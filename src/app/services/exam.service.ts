import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExamHistoryItem {
  startedAt: string;
  subjectName: string;
  duration: number;
  studentName: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = 'https://localhost:7169/api/Exam/history';

  constructor(private http: HttpClient) {}

  getExamHistory(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?pageNumber=${page}&pageSize=${pageSize}`);
  }
} 