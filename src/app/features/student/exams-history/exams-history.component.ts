import { Component, OnInit } from '@angular/core';
import { ExamService, StudentExamHistoryItem } from '../../../services/exam.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-exams-history',
  templateUrl: './exams-history.component.html',
  styleUrl: './exams-history.component.css',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule, ProgressSpinnerModule]
})
export class ExamsHistoryComponent implements OnInit {
  exams: StudentExamHistoryItem[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 5;
  loading = false;

  constructor(private examService: ExamService) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.loading = true;
    this.examService.getStudentExamHistory(this.page, this.pageSize).subscribe({
      next: res => {
        this.exams = res.data.items;
        this.totalRecords = res.data.totalCount;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.loadExams();
  }

  min(a: number, b: number): number {
    return a < b ? a : b;
  }
}
