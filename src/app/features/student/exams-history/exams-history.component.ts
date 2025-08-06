import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExamService, StudentExamHistoryItem, ExamDetailedResult } from '../../../services/exam.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-exams-history',
  templateUrl: './exams-history.component.html',
  styleUrl: './exams-history.component.css',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule, ProgressSpinnerModule, FormsModule, RouterModule, DialogModule, ButtonModule]
})
export class ExamsHistoryComponent implements OnInit, OnDestroy {
  exams: StudentExamHistoryItem[] = [];
  allExams: StudentExamHistoryItem[] = [];
  filteredExams: StudentExamHistoryItem[] = [];
  totalRecords = 0;
  filteredTotalRecords = 0;
  page = 1;
  pageSize = 6;
  loading = false;
  searchTerm = '';
  selectedFilter: 'all' | 'passed' | 'failed' = 'all';
  
  // Modal properties
  showDetailsModal = false;
  selectedExam: StudentExamHistoryItem | null = null;
  examDetails: ExamDetailedResult | null = null;
  loadingDetails = false;
  
  private searchSubject = new Subject<string>();

  constructor(private examService: ExamService) {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.loadExams();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }

  loadExams() {
    this.loading = true;
    // For better performance, we can limit this to a reasonable number
    // If you expect thousands of exams, consider implementing server-side filtering
    const maxRecords = this.totalRecords > 0 ? Math.min(this.totalRecords, 500) : 500;
    
    this.examService.getStudentExamHistory(1, maxRecords).subscribe({
      next: res => {
        this.allExams = res.data.items;
        this.totalRecords = res.data.totalCount;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filteredExams = [...this.allExams];

    // Apply search filter
    if (this.searchTerm) {
      filteredExams = filteredExams.filter(exam => 
        exam.subjectName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (this.selectedFilter === 'passed') {
      filteredExams = filteredExams.filter(exam => exam.score >= 50);
    } else if (this.selectedFilter === 'failed') {
      filteredExams = filteredExams.filter(exam => exam.score < 50);
    }

    this.filteredExams = filteredExams;
    this.filteredTotalRecords = filteredExams.length;
    
    // Reset to first page when filters change
    this.page = 1;
    
    // Apply pagination to filtered results
    this.applyPagination();
  }

  applyPagination() {
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.exams = this.filteredExams.slice(startIndex, endIndex);
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  setFilter(filter: 'all' | 'passed' | 'failed') {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedFilter = 'all';
    this.applyFilters();
  }

  viewExamDetails(exam: StudentExamHistoryItem) {
    this.selectedExam = exam;
    this.showDetailsModal = true;
    this.loadExamDetails(exam.examId);
  }

  private loadExamDetails(examId: number) {
    this.loadingDetails = true;
    this.examDetails = null;
    
    this.examService.getExamDetailedResult(examId).subscribe({
      next: (result) => {
        this.examDetails = result;
        this.loadingDetails = false;
      },
      error: (error) => {
        console.error('Error loading exam details:', error);
        this.loadingDetails = false;
      }
    });
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedExam = null;
    this.examDetails = null;
  }

  getCorrectAnswersCount(): number {
    if (!this.examDetails) return 0;
    return this.examDetails.data.filter(q => q.isAnswerCorrect).length;
  }

  getTotalQuestionsCount(): number {
    if (!this.examDetails) return 0;
    return this.examDetails.data.length;
  }

  getSelectedAnswerText(question: any): string {
    if (question.selectedOptionId === null) return 'Not answered';
    const selectedOption = question.options.find((opt: any) => opt.id === question.selectedOptionId);
    return selectedOption ? selectedOption.text : 'Not answered';
  }

  getCorrectAnswerText(question: any): string {
    const correctOption = question.options.find((opt: any) => opt.isCorrect);
    return correctOption ? correctOption.text : 'No correct answer found';
  }

  // Helper methods for template
  Math = Math;
  String = String;

  getAverageScore(): number {
    if (this.allExams.length === 0) return 0;
    const total = this.allExams.reduce((sum, exam) => sum + exam.score, 0);
    return Math.round(total / this.allExams.length);
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.length > 0 || this.selectedFilter !== 'all';
  }

  getPerformanceLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Average';
    return 'Needs Improvement';
  }

  getShowingText(): string {
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.filteredTotalRecords);
    return `${start}-${end}`;
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.applyPagination();
  }

  min(a: number, b: number): number {
    return a < b ? a : b;
  }
}
