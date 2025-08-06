import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Student } from '../shared/student.interfaces';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = 'https://localhost:7169/api/Student';

  constructor(private http: HttpClient) {}

  getStudents(page: number, pageSize: number): Observable<{students: Student[], total: number}> {
    return this.http.get<any>(`${this.apiUrl}?pageNumber=${page}&pageSize=${pageSize}`).pipe(
      map(res => ({
        students: res.data.items as Student[],
        total: res.data.totalCount
      }))
    );
  }

  getStudentById(id: string): Observable<Student> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data as Student)
    );
  }

  updateStudentStatus(id: string, status: 'Active' | 'Suspended'): Observable<'Active' | 'Suspended'> {
    return this.http.put<any>(`${this.apiUrl}/${id}/state`, { status }).pipe(
      map(() => status)
    );
  }
} 