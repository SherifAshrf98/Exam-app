import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateQuestionRequest } from '../shared/question.interfaces';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private apiUrl = 'https://localhost:7169/api/Question/create'; 

  constructor(private http: HttpClient) {}

  createQuestion(data: CreateQuestionRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
} 