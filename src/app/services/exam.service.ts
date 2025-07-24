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

export interface ExamOption {
  id: number;
  text: string;
}

export interface ExamQuestion {
  questionId: number;
  text: string;
  options: ExamOption[];
  selectedOption?: number | null;
}

export interface RequestedExam {
  id: number;
  startedAt: string;
  subjectName: string;
  remainingTime: number;
  duration: number;
  questions: ExamQuestion[];
}

export interface StudentExamHistoryItem {
  startedAt: string;
  subjectName: string;
  duration: number;
  studentName: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = 'https://localhost:7169/api/Exam/history';
  private requestExamUrl = 'https://localhost:7169/api/Exam/request';
  private studentExamsUrl = 'https://localhost:7169/api/Student/Exams';

  constructor(private http: HttpClient) {}

  getExamHistory(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?pageNumber=${page}&pageSize=${pageSize}`);
  }

  getStudentExamHistory(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.studentExamsUrl}?pageNumber=${page}&pageSize=${pageSize}`);
  }

  requestExam(subjectId: number): Observable<any> {
    return this.http.post<any>(this.requestExamUrl, { subjectId: subjectId });
  }
} 