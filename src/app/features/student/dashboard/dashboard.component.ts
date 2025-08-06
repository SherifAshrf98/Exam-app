import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {
  DashboardService,
  StudentDashboardSummary,
} from '../../../services/dashboard.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: StudentDashboardSummary | null = null;
  recentResults: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {}

  private loadDashboardData(): void {

 this.dashboardService.getStudentSummary().subscribe({
      next: (res) => {
        this.summary = res.data;
        
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
      },
    });
  }

  getCompletionPercentage(): number {
    if (!this.summary || this.summary.totalExams === 0) return 0;
    return Math.round(
      (this.summary.completedExams / this.summary.totalExams) * 100
    );
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'danger';
  }
}
