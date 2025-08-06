import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../services/notification.service';
import { NotificationPanelComponent } from '../../shared/notification-panel.component';
import { StudentService } from '../../services/student.service';
import { LoginService } from '../../services/login.service';
import { Student } from '../../shared/student.interfaces';

@Component({
  selector: 'app-student-layout',
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule, NotificationPanelComponent],
  providers: [MessageService]
})
export class StudentLayoutComponent implements OnInit, OnDestroy {
  headerTitle = 'Dashboard';
  studentInfo: Student | null = null;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private notificationService: NotificationService,
    private studentService: StudentService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    // Start SignalR connection
    this.notificationService.startConnection();
    
    // Load student information
    this.loadStudentInfo();
    
    // Set header title based on current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setHeaderTitle(event.url);
      }
    });
  }

  ngOnDestroy() {
    // Stop SignalR connection when component is destroyed
    this.notificationService.stopConnection();
  }

  private setHeaderTitle(url: string): void {
    if (url.includes('dashboard')) {
      this.headerTitle = 'Dashboard';
    } else if (url.includes('take-exam')) {
      this.headerTitle = 'Take Exam';
    } else if (url.includes('exams-history')) {
      this.headerTitle = 'Exam History';
    } else {
      this.headerTitle = 'Student Portal';
    }
  }

  private loadStudentInfo(): void {
    const userId = this.loginService.getUserId();
    if (userId) {
      this.studentService.getStudentById(userId).subscribe({
        next: (student) => {
          this.studentInfo = student;
        },
        error: (error) => {
          console.error('Error loading student info:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load student information'
          });
        }
      });
    }
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}