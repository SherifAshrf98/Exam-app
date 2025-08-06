import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';
import { environment } from '../../environments/environment';

export interface NotificationMessage {
  id?: string; // Backend uses string IDs
  message: string;
  timestamp: Date;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead?: boolean; // Add read status, defaults to false for new notifications
}

export interface BackendNotification {
  id: string;
  message: string;
  timestamp: string; // Backend sends as ISO string
  isRead: boolean; // Backend now returns this
}

export interface NotificationResponse {
  data: BackendNotification[];
  statusCode: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection: HubConnection | null = null;
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private apiUrl = 'https://localhost:7169/api/Notification';

  public notifications$ = this.notificationsSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor(
    private loginService: LoginService,
    private http: HttpClient
  ) {}

  public async startConnection(): Promise<void> {
    const token = this.loginService.getToken();

    if (!token) {
      console.warn('No token found, cannot establish SignalR connection');
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR connection established successfully');
      this.connectionStatusSubject.next(true);
      this.setupEventListeners();
    } catch (error) {
      console.error('Error establishing SignalR connection:', error);
      this.connectionStatusSubject.next(false);
    }

    // Handle reconnection events
    this.hubConnection.onreconnecting(() => {
      this.connectionStatusSubject.next(false);
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR connection reestablished');
      this.connectionStatusSubject.next(true);
    });

    this.hubConnection.onclose((error) => {
      if (error) {
        console.error('SignalR connection closed due to error:', error);
        // If connection closed due to authentication issues, try to restart
        if (
          error.message?.includes('401') ||
          error.message?.includes('Unauthorized')
        ) {
          console.log(
            'Authentication error detected, attempting to restart connection...'
          );
          setTimeout(() => this.startConnection(), 5000); // Retry after 5 seconds
        }
      }
      this.connectionStatusSubject.next(false);
    });
  }

  // Method to restart connection with fresh token
  public async restartConnection(): Promise<void> {
    console.log('Restarting SignalR connection with fresh token...');
    await this.stopConnection();
    await this.startConnection();
  }

  private setupEventListeners(): void {
    if (!this.hubConnection) return;

    // Listen for student notifications (matches backend: ReceiveMessage)
    this.hubConnection.on('ReceiveMessage', (message: string) => {
      console.log('Received student message:', message);
      this.addNotification({
        message,
        timestamp: new Date(),
        type: 'success',
      });
    });

    // Listen for admin notifications (matches backend: ReceiveAdminMessage)
    this.hubConnection.on('ReceiveAdminMessage', (message: string) => {
      console.log('Received admin message:', message);
      this.addNotification({
        message,
        timestamp: new Date(),
        type: 'info',
      });
    });
   
  }

  public addNotification(notification: NotificationMessage): void {
    // New real-time notifications are always unread
    const newNotification = { ...notification, isRead: false };
    
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications].slice(
      0,
      50
    ); // Keep only last 50 notifications
    this.notificationsSubject.next(updatedNotifications);
  }

  // Convenience methods for different notification types
  public addSuccessNotification(message: string): void {
    this.addNotification({
      message,
      timestamp: new Date(),
      type: 'success',
    });
  }

  public addInfoNotification(message: string): void {
    this.addNotification({
      message,
      timestamp: new Date(),
      type: 'info',
    });
  }

  public addWarningNotification(message: string): void {
    this.addNotification({
      message,
      timestamp: new Date(),
      type: 'warning',
    });
  }

  public addErrorNotification(message: string): void {
    this.addNotification({
      message,
      timestamp: new Date(),
      type: 'error',
    });
  }

  // Method to ensure connection is active with valid token
  public async ensureConnection(): Promise<void> {
    const token = this.loginService.getToken();

    if (!token) {
      console.warn('No token available, stopping SignalR connection');
      await this.stopConnection();
      return;
    }

    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      console.log('SignalR not connected, starting connection...');
      await this.startConnection();
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR connection stopped');
        this.connectionStatusSubject.next(false);
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  public clearNotifications(): void {
    this.notificationsSubject.next([]);
  }

  public removeNotificationByIndex(index: number): void {
    const currentNotifications = this.notificationsSubject.value;
    currentNotifications.splice(index, 1);
    this.notificationsSubject.next([...currentNotifications]);
  }

  public getConnectionState(): string {
    return this.hubConnection?.state || 'Disconnected';
  }

  public getConnectionId(): string | null {
    return this.hubConnection?.connectionId || null;
  }

  // New methods for API integration
  public getStudentNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}/Student`);
  }

  public getAdminNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.apiUrl}/Admins`);
  }

  public markNotificationAsRead(notificationId: string): Observable<any> {
    console.log('Making PUT request to:', `${this.apiUrl}/${notificationId}/read`);
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Load notifications from backend based on user role
  public loadNotificationsFromBackend(): void {
    const userRoles = this.loginService.getUserRoles();
    let notificationObservable: Observable<NotificationResponse>;

    if (userRoles.includes('Admin')) {
      notificationObservable = this.getAdminNotifications();
    } else if (userRoles.includes('Student')) {
      notificationObservable = this.getStudentNotifications();
    } else {
      return;
    }

    notificationObservable.subscribe({
      next: (response) => {
        if (response && response.data) {
          const notifications: NotificationMessage[] = response.data.map(notification => ({
            id: notification.id,
            message: notification.message,
            timestamp: new Date(notification.timestamp),
            type: this.determineNotificationType(notification.message),
            isRead: notification.isRead // Use backend isRead value
          }));

          console.log('Loaded notifications from backend:', notifications);
          this.notificationsSubject.next(notifications);
        }
      },
      error: (error) => {
        console.error('Error loading notifications from backend:', error);
      }
    });
  }

  // Mark notification as read and update local state
  public markAsRead(notificationId: string): void {
    console.log('markAsRead called with ID:', notificationId);
    
    // Update local state immediately for better UX (optimistic update)
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    
    this.notificationsSubject.next(updatedNotifications);
    
    // Update backend
    this.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        console.log('Backend call successful for notification:', notificationId);
        // Optionally reload notifications to ensure consistency
        // this.loadNotificationsFromBackend();
      },
      error: (error) => {
        console.error('Error marking notification as read on backend:', error);
        // Revert optimistic update on error
        this.notificationsSubject.next(currentNotifications);
      }
    });
  }

  // Helper method to determine notification type based on message content
  private determineNotificationType(message: string): 'success' | 'info' | 'warning' | 'error' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('submitted') || lowerMessage.includes('completed')) {
      return 'success';
    } else if (lowerMessage.includes('scored') || lowerMessage.includes('score')) {
      return 'info';
    } else if (lowerMessage.includes('warning') || lowerMessage.includes('expired')) {
      return 'warning';
    } else if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
      return 'error';
    }
    
    return 'info'; // Default type
  }

  // Get unread notifications count
  public getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map((notifications: NotificationMessage[]) => 
        notifications.filter((n: NotificationMessage) => !n.isRead).length
      )
    );
  }

  // Mark all notifications as read
  public async markAllAsRead(): Promise<void> {
    const currentNotifications = this.notificationsSubject.value;
    const unreadNotifications = currentNotifications.filter(n => !n.isRead && n.id);

    // Update local state immediately (optimistic update)
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      isRead: true
    }));
    
    this.notificationsSubject.next(updatedNotifications);
    console.log('Marked all notifications as read locally');

    // Try to update backend for each unread notification
    try {
      const markAsReadPromises = unreadNotifications.map(notification => 
        notification.id ? firstValueFrom(this.markNotificationAsRead(notification.id)) : Promise.resolve()
      );
      
      await Promise.all(markAsReadPromises);
      console.log('Successfully marked all notifications as read on backend');
    } catch (error) {
      console.error('Error marking some notifications as read on backend:', error);
      // Revert optimistic update on error
      this.notificationsSubject.next(currentNotifications);
      // Optionally show error message to user
    }
  }
}
