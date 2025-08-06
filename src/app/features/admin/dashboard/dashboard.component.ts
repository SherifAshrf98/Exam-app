import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService, AdminDashboardSummary } from '../../../services/dashboard.service';
import { NotificationService, NotificationMessage } from '../../../services/notification.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary: AdminDashboardSummary | null = null;
  loading = true;
  recentNotifications: NotificationMessage[] = [];
  private notificationSubscription: Subscription | null = null;

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.dashboardService.getAdminSummary().subscribe({
      next: (res) => {
        this.summary = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    // Subscribe to notifications for recent activities
    this.notificationSubscription = this.notificationService.notifications$.subscribe({
      next: (notifications) => {
        this.recentNotifications = notifications.slice(0, 10); // Show only last 10 activities
      }
    });
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'success': return 'pi pi-check-circle';
      case 'error': return 'pi pi-times-circle';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'info': 
      default: return 'pi pi-info-circle';
    }
  }

  formatActivityTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  }


  getConnectionStatus(): string {
    return this.notificationService.getConnectionState();
  }

  getConnectionId(): string | null {
    return this.notificationService.getConnectionId();
  }
}