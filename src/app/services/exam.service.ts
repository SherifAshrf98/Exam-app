import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExamHistoryItem {
  startedAt: string;
  subjectName: string;
  duration: number;
  studentName: string;
  score: number | null; // Can be null for non-submitted exams
  status: 'Submitted' | 'Expired' | 'InProgress'; // Add exam status
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
  examId: number;
  startedAt: string;
  subjectName: string;
  duration: number;
  studentName: string;
  score: number;
}

export interface ExamAnswer {
  questionId: number;
  selectedOptionId: number;
}

export interface ExamSubmission {
  examId: number;
  answers: ExamAnswer[];
}

export interface ExamResultOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface ExamResultQuestion {
  questionText: string;
  options: ExamResultOption[];
  selectedOptionId: number | null;
  isAnswerCorrect: boolean;
}

export interface ExamDetailedResult {
  data: ExamResultQuestion[];
  statusCode: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = 'https://localhost:7169/api/Exam/history';
  private requestExamUrl = 'https://localhost:7169/api/Exam/request';
  private studentExamsUrl = 'https://localhost:7169/api/Student/Exams';
  private submitExamUrl = 'https://localhost:7169/api/Exam/submit';

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

  submitExam(examId: number, answers: ExamAnswer[]): Observable<any> {
    const submission: ExamSubmission = {
      examId: examId,
      answers: answers
    };
    return this.http.post<any>(this.submitExamUrl, submission);
  }

  getExamDetailedResult(examId: number): Observable<ExamDetailedResult> {
    return this.http.get<ExamDetailedResult>(`https://localhost:7169/api/Exam/result/${examId}`);
  }
} 