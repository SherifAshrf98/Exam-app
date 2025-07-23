import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { filter } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone: true,
  imports: [RouterModule, PanelMenuModule]
})
export class AdminLayoutComponent {
  
  headerTitle = 'Dashboard';
  userName: string | null = null;

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

  constructor(private router: Router, private loginService: LoginService) {
    this.setHeaderTitle(this.router.url);
    this.userName = this.loginService.getUserName();

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.setHeaderTitle(e.urlAfterRedirects || e.url);
    });
    
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

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
