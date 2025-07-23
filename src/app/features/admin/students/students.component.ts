import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../../shared/student.interfaces';
import { StudentService } from '../../../services/student.service';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule, ButtonModule, AvatarModule, ProgressSpinnerModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  totalRecords = 0;
  loading = false;
  page = 1;
  pageSize = 10;

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    this.studentService.getStudents(this.page, this.pageSize).subscribe(res => {
      this.students = res.students;
      this.totalRecords = res.total;
      this.loading = false;
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.loadStudents();
  }

  toggleStatus(student: Student) {
    
    const newStatus = student.status === 'Active' ? 'Suspended' : 'Active';

    this.studentService.updateStudentStatus(student.id, newStatus).subscribe({

      next: (updatedStatus) => {
        student.status = updatedStatus;
      },
      
      error: (err) => {
        console.error('Failed to update status', err);
      }
    });
  }

  min(a: number, b: number): number {
    return a < b ? a : b;
  }
}
