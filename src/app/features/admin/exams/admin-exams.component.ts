import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService, ExamHistoryItem } from '../../../services/exam.service';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-admin-exams',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule],
  templateUrl: './admin-exams.component.html',
  styleUrl: './admin-exams.component.css'
})
export class AdminExamsComponent implements OnInit {
  exams: ExamHistoryItem[] = [];
  totalRecords = 0;
  page = 1;
  pageSize = 5

  constructor(private examService: ExamService) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.examService.getExamHistory(this.page, this.pageSize).subscribe(res => {
      this.exams = res.data.items;
      this.totalRecords = res.data.totalCount;
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