import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMessage } from '../services/notification.service';
import { Subscription } from 'rxjs';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    ButtonModule,
    MenuModule,
    TooltipModule
  ],
  template: `
    <div class="notification-container">
      <p-button
        [badge]="unreadCount > 0 ? unreadCount.toString() : ''"
        [badgeClass]="unreadCount > 0 ? 'p-badge-danger' : 'p-badge-secondary'"
        icon="pi pi-bell"
        [outlined]="true"
        severity="secondary"
        (click)="togglePanel(); $event.stopPropagation()"
        pTooltip="Notifications"
        tooltipPosition="bottom">
      </p-button>

      <div class="notification-dropdown" [class.show]="showPanel" (click)="$event.stopPropagation()">
        <div class="notification-panel">
          <div class="notification-header">
            <h5>Notifications ({{ notifications.length }})</h5>
            <div class="notification-actions">
              <button
                *ngIf="unreadCount > 0"
                class="btn btn-outline-primary btn-sm"
                (click)="markAllAsRead()"
                title="Mark all as read">
                <i class="pi pi-check"></i>
                Mark All Read
              </button>
              <button
                *ngIf="notifications.length > 0"
                class="btn btn-outline-success btn-sm"
                (click)="clearAllNotifications()"
                title="Clear all">
                <i class="pi pi-trash"></i>
                Clear All
              </button>
              <button
                class="btn btn-light btn-sm ms-1"
                (click)="closePanel()"
                title="Close">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

    
          <div class="notifications-scroll">
            <div class="notifications-list">
              <!-- Show each notification -->
              <div 
                *ngFor="let notification of notifications; let i = index"
                class="notification-item"
                [ngClass]="[
                  'notification-' + notification.type,
                  notification.isRead ? 'notification-read' : 'notification-unread'
                ]">
                <div class="notification-icon">
                  <i [class]="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
                </div>
                <div class="notification-actions-item">
                  <button
                    *ngIf="!notification.isRead && notification.id"
                    class="btn btn-outline-primary btn-sm me-1"
                    (click)="markAsRead(notification.id!); $event.stopPropagation()"
                    title="Mark as read">
                    <i class="pi pi-check"></i>
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    (click)="removeNotification(i)"
                    title="Dismiss">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Show when no notifications -->
              <div *ngIf="notifications.length === 0" class="no-notifications">
                <i class="pi pi-bell-slash"></i>
                <p>No notifications yet</p>
                <small class="text-muted">You'll receive notifications here when exams are submitted or evaluated</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: relative;
    }

    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 2px solid #007bff;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      width: 400px;
      max-height: 500px;
      z-index: 9999;
      display: none;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .notification-dropdown.show {
      display: block;
    }

    .notification-panel {
      padding: 1rem;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
    }

    .notification-header h5 {
      margin: 0;
      color: #333;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .connection-status.connected {
      background-color: #d4edda;
      color: #155724;
    }

    .connection-status.disconnected {
      background-color: #f8d7da;
      color: #721c24;
    }

    .notifications-scroll {
      max-height: 300px;
      overflow-y: auto;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 12px;
      border-radius: 6px;
      border-left: 4px solid;
      background: #f8f9fa;
      margin-bottom: 8px;
      transition: all 0.2s ease;
    }

    .notification-item:hover {
      background: #e9ecef;
      transform: translateX(-2px);
    }

    .notification-unread {
      background: #fff3cd !important;
      border: 1px solid #ffeaa7;
      font-weight: 600;
    }

    .notification-unread .notification-message {
      font-weight: 600;
    }

    .notification-read {
      background: #f8f9fa;
      opacity: 0.8;
    }

    .notification-read .notification-message {
      font-weight: 400;
    }

    .notification-actions-item {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }

    .notification-icon {
      margin-right: 10px;
      font-size: 16px;
      margin-top: 2px;
    }

    .notification-success {
      border-left-color: #28a745;
    }

    .notification-success .notification-icon {
      color: #28a745;
    }

    .notification-info {
      border-left-color: #007bff;
    }

    .notification-info .notification-icon {
      color: #007bff;
    }

    .notification-warning {
      border-left-color: #ffc107;
    }

    .notification-warning .notification-icon {
      color: #ffc107;
    }

    .notification-error {
      border-left-color: #dc3545;
    }

    .notification-error .notification-icon {
      color: #dc3545;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #6c757d;
    }

    .no-notifications {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    }

    .no-notifications i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .no-notifications p {
      margin: 0;
    }

    .btn {
      border: 1px solid;
      border-radius: 4px;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      background: transparent;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }

    .btn-outline-primary {
      color: #007bff;
      border-color: #007bff;
    }

    .btn-outline-primary:hover {
      background-color: #007bff;
      color: white;
    }

    .btn-outline-success {
      color: #28a745;
      border-color: #28a745;
    }

    .btn-outline-success:hover {
      background-color: #28a745;
      color: white;
    }

    .btn-outline-secondary {
      color: #6c757d;
      border-color: #6c757d;
    }

    .btn-outline-secondary:hover {
      background-color: #6c757d;
      color: white;
    }

    .btn-light {
      color: #495057;
      background-color: #f8f9fa;
      border-color: #f8f9fa;
    }

    .btn-light:hover {
      color: #495057;
      background-color: #e2e6ea;
      border-color: #dae0e5;
    }
  `]

})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  notificationCount = 0;
  unreadCount = 0;
  isConnected = false;
  showPanel = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Load notifications from backend on init
    this.notificationService.loadNotificationsFromBackend();

    // Subscribe to notifications
    const notificationsSub = this.notificationService.notifications$.subscribe(
      (notifications: NotificationMessage[]) => {
        this.notifications = notifications;
        this.notificationCount = notifications.length;
      }
    );

    // Subscribe to unread count
    const unreadCountSub = this.notificationService.getUnreadCount().subscribe(
      (count: number) => {
        this.unreadCount = count;
      }
    );

    // Subscribe to connection status
    const connectionSub = this.notificationService.connectionStatus$.subscribe(
      (status: boolean) => {
        this.isConnected = status;
      }
    );

    this.subscriptions.push(notificationsSub, unreadCountSub, connectionSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  togglePanel(): void {
    this.showPanel = !this.showPanel;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPanel = false;
    }
  }

  closePanel(): void {
    this.showPanel = false;
  }



  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'pi pi-check-circle';
      case 'error': return 'pi pi-times-circle';
      case 'warning': return 'pi pi-exclamation-triangle';
      case 'info': 
      default: return 'pi pi-info-circle';
    }
  }

  removeNotification(index: number): void {
    this.notificationService.removeNotificationByIndex(index);
  }

  markAsRead(notificationId: string): void {
    console.log('Marking notification as read:', notificationId);
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAllNotifications(): void {
    this.notificationService.clearNotifications();
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
