import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { NotificationService } from '../../services/notification.service';
import { filter } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationPanelComponent } from '../../shared/notification-panel.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true,
  imports: [RouterModule, PanelMenuModule, AvatarModule, ButtonModule, ToastModule, NotificationPanelComponent],
  providers: [MessageService]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  
  headerTitle = 'Dashboard';
  userName: string | null = null;
  showUserDropdown = false;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: ['/admin/dashboard'],
      command: () => this.setHeader('Dashboard')
    },
    {
      label: 'Students',
      icon: 'pi pi-users',
      routerLink: ['/admin/students'],
      command: () => this.setHeader('Students')
    },
    {
      label: 'Exams',
      icon: 'pi pi-book',
      routerLink: ['/admin/exams'],
      command: () => this.setHeader('Exams')
    },
    {
      label: 'Subjects',
      icon: 'pi pi-bookmark',
      items: [
        {
          label: 'Exam Configurations',
          icon: 'pi pi-cog',
          routerLink: ['/admin/exam-configurations'],
          command: () => this.setHeader('Exam Configurations')
        },
        {
          label: 'Questions',
          icon: 'pi pi-question-circle',
          routerLink: ['/admin/create-question'],
          command: () => this.setHeader('Questions')
        }
      ]
    }
  ];

  constructor(
    private router: Router, 
    private loginService: LoginService,
    private messageService: MessageService,
    private notificationService: NotificationService
  ) {
    this.setHeaderTitle(this.router.url);
    this.userName = this.loginService.getUserName();

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.setHeaderTitle(e.urlAfterRedirects || e.url);
    });
  }

  ngOnInit() {
    // Start SignalR connection
    this.notificationService.startConnection();
  }

  ngOnDestroy() {
    // Stop SignalR connection when component is destroyed
    this.notificationService.stopConnection();
  }

  setHeaderTitle(url: string) {
    if (url.includes('/admin/dashboard')) this.headerTitle = 'Dashboard';
    else if (url.includes('/admin/students')) this.headerTitle = 'Students';
    else if (url.includes('/admin/exams')) this.headerTitle = 'Exams';
    else if (url.includes('/admin/exam-configurations')) this.headerTitle = 'Exam Configurations';
    else if (url.includes('/admin/create-question')) this.headerTitle = 'Questions';
    else this.headerTitle = 'Dashboard';
  }

  setHeader(title: string) {
    this.headerTitle = title;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#userDropdown') && !target.closest('.dropdown-menu')) {
      this.showUserDropdown = false;
    }
  }

  viewProfile() {
    this.showUserDropdown = false;
    // Add navigation to profile page when implemented
    console.log('Navigate to profile');
  }

  viewSettings() {
    this.showUserDropdown = false;
    // Add navigation to settings page when implemented
    console.log('Navigate to settings');
  }

  logout() {
    this.showUserDropdown = false;
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
